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

require('./Installable.es6.js');
require('./advisors/Advisor.es6.js');
require('./maps.es6.js');
require('./hooks/PubHook.es6.js');

// TODO(markdittmer): The list of required triggers is only going to grow.
// Refactor here?
require('./triggers/LayoutStyleRecalcTrigger.es6.js');
require('./triggers/SyncXHRTrigger.es6.js');
require('./triggers/Trigger.es6.js');

foam.CLASS({
  package: 'tools.web.strict',
  name: 'Controller',

  implements: ['tools.web.strict.Installable'],

  requires: [
    'tools.web.strict.Advisor',
    'tools.web.strict.PubHook',
    'tools.web.strict.ActiveMap',
    'tools.web.strict.SyncXHRTrigger',
    'tools.web.strict.Trigger',
  ],
  exports: [
    'Proxy',
    'advisors',
    'hooks',
    'triggers',
  ],

  properties: [
    {
      name: 'Proxy',
      value: typeof Proxy !== undefined ? Proxy : null,
    },
    {
      name: 'config',
      required: true,
    },
    {
      name: 'defaults',
      value: {
        hooks: ['XMLHttpRequest.open.apply'],
        triggers: ['syncXHR'],
        advisors: ['warn'],
      },
    },
    {
      class: 'FObjectProperty',
      of: 'tools.web.strict.ActiveMap',
      name: 'hooks',
      factory: function() {
        return this.ActiveMap.create({map: require('./hooks/hooks.es6.js')});
      },
    },
    {
      class: 'FObjectProperty',
      of: 'tools.web.strict.ActiveMap',
      name: 'triggers',
      factory: function() {
        return this.ActiveMap.create({
          map: require('./triggers/triggers.es6.js'),
        });
      },
    },
    {
      class: 'FObjectArray',
      of: 'tools.web.strict.Reporter',
      name: 'reporters',
    },
    {
      class: 'FObjectProperty',
      of: 'tools.web.strict.ActiveMap',
      name: 'advisors',
      factory: function() {
        return this.ActiveMap.create({
          map: require('./advisors/advisors.es6.js'),
        });
      },
    },
  ],

  methods: [
    function init() {
      const config = this.processConfig(this.config, this.defaults);

      for (const trigger of config.triggers) {
        // TODO: Decorate trigger reporter according to config.
        this.reporters.push(this.triggers.get(trigger).reporter);
      }

      for (const advisor of config.advisors) {
        this.advisors.get(advisor).reporters = this.reporters;
      }
    },
    function processConfig(config, defaults) {
      // TODO(markdittmer): Collect short-hands into structured config.
      return Object.assign({}, defaults, config);
    },
    function install() {
      for (const advisor of this.advisors.active.select()) {
        advisor.install();
      }
      for (const reporter of this.reporters) {
        reporter.install();
      }
      for (const trigger of this.triggers.active.select()) {
        trigger.install();
      }
      for (const hook of this.hooks.active.select()) {
        hook.install();
      }
    },
    function uninstall() {
      for (const hook of this.hooks.active.select().reverse()) {
        hook.uninstall();
      }
      for (const trigger of this.triggers.active.select().reverse()) {
        trigger.uninstall();
      }
      for (const reporter of this.reporters.slice().reverse()) {
        reporter.uninstall();
      }
      for (const advisor of this.advisors.active.select().reverse()) {
        advisor.uninstall();
      }
    },
  ],
});
