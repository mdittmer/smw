/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

let Controller;
beforeAll(() => {
  require('../../lib/Controller.es6.js');
  require('../../lib/advisors/Advisor.es6.js');
  require('../../lib/triggers/SyncXHRTrigger.es6.js');

  Controller = foam.lookup('tools.web.strict.Controller');

  foam.CLASS({
    package: 'tools.web.strict.test',
    name: 'CallbackAdvisor',
    extends: 'tools.web.strict.Advisor',

    properties: [
      {
        name: 'callback',
        value: function() {
          throw new Error('CallbackAdvisor with no callback');
        },
      },
    ],

    listeners: [
      function onAdvice(sub, topic, ...args) {
        return this.callback(...args);
      },
    ],
  });
});

describe('SyncXHR', () => {
  const withCallbackController = function(callback, f) {
    const controller = Controller.create({
      hooks: {
        map: {
          'XMLHttpRequest.prototype.open.apply': {
            class: 'tools.web.strict.PubHook',
            id: 'XMLHttpRequest.prototype.open.apply',
            implProvider: 'XMLHttpRequest.prototype',
            name: 'open',
            apply: true,
          },
        },
      },
      triggers: {
        map: {
          syncXHR: {class: 'tools.web.strict.SyncXHRTrigger'},
        },
      },
      advisors: {
        map: {
          test: {
            class: 'tools.web.strict.test.CallbackAdvisor',
            callback,
          },
        },
      },
      config: {
        triggers: ['syncXHR'],
        advisors: ['test'],
      },
    });
    controller.install();
    f(controller);
    controller.uninstall();
  };

  it('Synchronous notification of sync xhr', () => {
    let calls = 0;
    withCallbackController(
      () => calls++,
      () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://www.example.org/example.txt', false);
        expect(calls).toBe(1);
      }
    );
  });

  it('No notification of explicit async xhr', () => {
    let calls = 0;
    withCallbackController(
      () => calls++,
      () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://www.example.org/example.txt', true);
        expect(calls).toBe(0);
      }
    );
  });

  it('No notification of implicit async xhr', () => {
    let calls = 0;
    withCallbackController(
      () => calls++,
      () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://www.example.org/example.txt');
        expect(calls).toBe(0);
      }
    );
  });
});
