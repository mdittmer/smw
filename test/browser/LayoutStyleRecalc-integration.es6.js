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

describe('LayoutStyleRecalc', () => {
  let Controller;
  beforeAll(() => {
    require('../../lib/Controller.es6.js');
    require('../../lib/advisors/Advisor.es6.js');
    require('../../lib/triggers/LayoutStyleRecalcTrigger.es6.js');

    Controller = foam.lookup('tools.web.strict.Controller');

    foam.CLASS({
      package: 'tools.web.strict.test',
      // TODO(markdittmer): Put one CallbackAdvisor in a helper.
      name: 'CallbackAdvisor2',
      extends: 'tools.web.strict.Advisor',

      properties: [
        {
          name: 'callback',
          value: function() {
            throw new Error('CallbackAdvisor2 with no callback');
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

  const withCallbackController = function(callback, f) {
    const controller = Controller.create({
      triggers: {
        map: {
          layoutStyleRecalc: {
            class: 'tools.web.strict.LayoutStyleRecalcTrigger',
          },
        },
      },
      advisors: {
        map: {
          test: {
            class: 'tools.web.strict.test.CallbackAdvisor2',
            callback,
          },
        },
      },
      config: {
        triggers: ['layoutStyleRecalc'],
        advisors: ['test'],
      },
    });
    controller.install();
    function done() {
      controller.uninstall();
    }
    f(controller, done);
    if (f.length < 2) done();
  };

  it('Stay beneath threshold (same API; same element)', done => {
    let calls = 0;
    let threshold = 0;
    withCallbackController(
      (...args) => calls++,
      (controller, doneWithCC) => {
        threshold = controller.triggers.get('layoutStyleRecalc').reporter.threshold;
        const e = document.createElement('p');
        for (let i = 0; i < threshold - 1; i++) {
          e.clientLeft;
        }
        requestAnimationFrame(() => requestAnimationFrame(() => {
          expect(calls).toBe(0);
          doneWithCC();
          done();
        }));
      }
    );
    });

  it('Meet threshold (same API; same element)', done => {
    let calls = 0;
    let threshold = 0;
    withCallbackController(
      (...args) => {
        calls++;
        expect(args.length).toBe(threshold);
      },
      (controller, doneWithCC) => {
        threshold = controller.triggers.get('layoutStyleRecalc').reporter.threshold;
        const e = document.createElement('p');
        for (let i = 0; i < threshold; i++) {
          e.clientLeft;
        }
        requestAnimationFrame(() => requestAnimationFrame(() => {
          expect(calls).toBe(1);
          doneWithCC();
          done();
        }));
      }
    );
  });

  it('Exceed threshold (same API; same element)', done => {
    let calls = 0;
    let threshold = 0;
    withCallbackController(
      (...args) => {
        calls++;
        expect(args.length).toBe(threshold + 10);
      },
      (controller, doneWithCC) => {
        threshold = controller.triggers.get('layoutStyleRecalc').reporter.threshold;
        const e = document.createElement('p');
        for (let i = 0; i < threshold + 10; i++) {
          e.clientLeft;
        }
        requestAnimationFrame(() => requestAnimationFrame(() => {
          expect(calls).toBe(1);
          doneWithCC();
          done();
        }));
      }
    );
  });
});
