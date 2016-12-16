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

foam.CLASS({
  package: 'tools.web.strict',
  name: 'Trigger',

  implements: ['tools.web.strict.Installable'],

  requires: ['tools.web.strict.PubHookTopic'],

  constants: {
    // Provides hint to Trigger-creation contexts that wish to decorate
    // a reporter that understands this trigger's output.
    reporterClass: foam.lookup('tools.web.strict.Reporter'),
  },

  properties: [
    {
      class: 'FObjectProperty',
      of: 'tools.web.strict.Reporter',
      name: 'reporter',
      factory: function() {
        return this.REPORTER_CLASS.create(null, this);
      },
    },
    {
      documentation: 'List of topics to listen to on "hook"',
      class: 'FObjectArray',
      of: 'tools.web.strict.PubHookTopic',
      name: 'topics',
      factory: function() {
        return [this.PubHookTopic.APPLY];
      },
    },
    {
      documentation: `
        FOAM subscription objects held for unsubscribing during uninstall()
      `,
      class: 'FObjectArray',
      of: 'Object',
      name: 'subs',
    },
  ],

  methods: [
    function install() {
      for (const topic of this.topics) {
        this.subs.push(this.hook.sub(topic.name, this[`on${topic.label}`]));
      }
    },
    function uninstall() {
      for (const sub of this.subs) {
        sub.detach();
      }
    },
  ],

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
