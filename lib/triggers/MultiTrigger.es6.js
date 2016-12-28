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

require('../Installable.es6.js');
require('../hooks/PubHook.es6.js');
require('../reporters/Reporter.es6.js');
require('./Trigger.es6.js');

foam.CLASS({
  package: 'tools.web.strict',
  name: 'MultiTrigger',

  extends: 'tools.web.strict.Trigger',
  implements: ['tools.web.strict.Installable'],

  requires: ['tools.web.strict.PubHookTopic'],

  constants: {
    reporterClass: foam.lookup('tools.web.strict.Reporter'),
  },

  properties: [
    {
      class: 'FObjectArray',
      of: 'tools.web.strict.PubHook',
      name: 'hooks',
    },
  ],

  methods: [
    function install() {
      for (const hook of this.hooks) {
        for (const topic of this.PubHookTopic.getValues()) {
          // TODO(markdittmer): toLowerCase() here is probably error-prone.
          // Model name?
          if (hook[topic.label.toLowerCase()])
            this.subs.push(hook.sub(topic.name, this[`on${topic.label}`]));
        }
      }
    },
    function uninstall() {
      for (const sub of this.subs.reverse()) {
        sub.detach();
      }
      this.subs = [];
    },
  ],

  // TODO(markdittmer): Are these inherited already?
  listeners: [
    function onGet(...args) {
      this.reporter.report(...args);
    },
    function onSet(sub, ...args) {
      this.reporter.report(...args);
    },
    function onApply(sub, ...args) {
      this.reporter.report(...args);
    },
  ],
});
