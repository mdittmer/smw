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

foam.CLASS({
  package: 'tools.web.strict',
  name: 'Advisor',

  implements: ['tools.web.strict.Installable'],

  requires: [
    'tools.web.strict.PubReporter',
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'tools.web.strict.PubReporter',
      name: 'reporters',
      final: true,
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
      for (const reporter of this.reporters) {
        this.subs.push(reporter.sub(this.PubReporter.PUB_TOPIC, this.onAdvice));
      }
    },
    function uninstall() {
      for (const sub of this.subs) {
        sub.detach();
      }
    },
  ],

  listeners: [
    function onAdvice(...args) {
      for (const arg of args) {
        console.warn(arg.toPlainText());
      }
    },
  ],
});
