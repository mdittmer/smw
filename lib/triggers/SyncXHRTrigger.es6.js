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

require('../hooks/PubHook.es6.js');
require('../reporters/SyncXHRReporter.es6.js');
require('./Trigger.es6.js');

foam.CLASS({
  package: 'tools.web.strict',
  name: 'SyncXHRTrigger',
  extends: 'tools.web.strict.Trigger',

  requires: ['tools.web.strict.PubHook'],

  constants: {
    reporterClass: foam.lookup('tools.web.strict.SyncXHRReporter'),
  },
  properties: [
    {
      documentation: `Hook into XHR's open() method`,
      class: 'FObjectProperty',
      of: 'tools.web.strict.PubHook',
      name: 'hook',
      factory: function() {
        return this.PubHook.create({
          id: 'XMLHttpRequest.prototype.open:apply',
          impl: XMLHttpRequest.prototype,
          name: 'open',
          apply: true,
        });
      },
    },
    {
      documentation: `
        FOAM subscription object held for unsubscribing during uninstall()
      `,
      class: 'FObjectArray',
      of: 'Object',
      name: 'subs',
    },
  ],

  listeners: [
    function onApply(sub, topic, fn, impl, [method, url, isAsync]) {
      if (!isAsync && isAsync !== undefined)
        this.reporter.report(sub.src, method, url);
    },
  ],
});
