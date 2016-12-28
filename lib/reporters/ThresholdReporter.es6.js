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
require('./PubReporter.es6.js');

// TODO(markdittmer): It would be nice to use foam.util.Timer so long as it's
// sufficiently configurable.
foam.CLASS({
  package: 'tools.web.strict',
  name: 'Timeout',

  implements: ['tools.web.strict.Installable'],

  constants: {
    pubTopic: 'TIMED_OUT',
  },

  properties: [
    {
      class: 'Boolean',
      name: 'installed',
    },
    {
      class: 'Int',
      name: 'timeout',
      value: 350,
    },
  ],

  methods: [
    function install() {
      this.installed = true;
      this.tick();
    },
    function uninstall() {
      this.installed = false;
    },
  ],

  listeners: [
    function tick() {
      if (!this.installed) return;

      this.pub(this.PUB_TOPIC);
      window.setTimeout(this.tick, this.timeout);
    },
  ],
});

foam.CLASS({
  package: 'tools.web.strict',
  name: 'ThresholdReporter',

  extends: 'tools.web.strict.PubReporter',
  implements: ['tools.web.strict.Installable'],
  requires: ['tools.web.strict.Timeout'],

  constants: {
    pubTopic: 'ADVISE',
    timeoutTopic: 'TIMED_OUT',
  },

  properties: [
    {
      class: 'Int',
      name: 'threshold',
      value: 4,
    },
    {
      class: 'FObjectProperty',
      of: 'tools.web.strict.Timeout',
      name: 'timeout',
      factory: function() {
        return this.Timeout.create();
      },
    },
    {
      name: 'timeoutSub',
    },
    {
      class: 'FObjectArray',
      of: 'tools.web.strict.Advice',
      name: 'q',
    },
  ],

  methods: [
    function report(...reports) {
      for (const advice of reports) {
        this.q.push(advice);
      }
    },
    function install() {
      this.timeoutSub = this.timeout.sub(this.TIMEOUT_TOPIC, this.onTimeout);
      this.timeout.install();
    },
    function uninstall() {
      this.timeout.uninstall();
    },
  ],

  listeners: [
    function onTimeout() {
      if (this.q.length >= this.threshold) {
        // TODO(markdittmer): Possible optimization: Defer Advice creation
        // to onTimeout (now) in all ThresholdReporters.
        this.pub(this.PUB_TOPIC, ...this.q);
      }
      if (this.q.length > 0) this.q = [];
    },
  ],
});
