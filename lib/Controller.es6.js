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
require('./dao.es6.js');
require('./hooks/PubHook.es6.js');
require('./triggers/SyncXHRTrigger.es6.js');
require('./triggers/Trigger.es6.js');

foam.CLASS({
  package: 'tools.web.strict',
  name: 'Controller',

  implements: ['tools.web.strict.Installable'],

  requires: [
    'tools.web.strict.Advisor',
    'tools.web.strict.PubHook',
    'tools.web.strict.SyncFindDAO',
    'tools.web.strict.SyncXHRTrigger',
    'tools.web.strict.Trigger',
  ],
  exports: [
    'Proxy',
    'advisorsDAO',
    'hooksDAO',
    'triggersDAO',
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
      name: 'hooks',
      value: require('./hooks/hooks.es6.js'),
    },
    {
      name: 'triggers',
      value: require('./triggers/triggers.es6.js'),
    },
    {
      name: 'advisors',
      value: require('./advisors/advisors.es6.js'),
    },
    {
      documentation: `
        DAO of loaded Hooks. Implements find synchronously to ensure that
        everything can get wired up before observed events start firing.
      `,
      class: 'FObjectProperty',
      of: 'tools.web.strict.SyncFindDAO',
      name: 'hooksDAO',
      factory: function() {
        return this.SyncFindDAO.create({of: 'tools.web.strict.Hook'});
      },
    },
    {
      documentation: `
        DAO of loaded Triggers. Implements find synchronously to ensure that
        everything can get wired up before observed events start firing.
      `,
      class: 'FObjectProperty',
      of: 'tools.web.strict.SyncFindDAO',
      name: 'triggersDAO',
      factory: function() {
        return this.SyncFindDAO.create({of: 'tools.web.strict.Trigger'});
      },
    },
    {
      documentation: `
        DAO of loaded Advisors. Implements find synchronously to ensure that
        everything can get wired up before observed events start firing.
      `,
      class: 'FObjectProperty',
      of: 'tools.web.strict.SyncFindDAO',
      name: 'advisorsDAO',
      factory: function() {
        return this.SyncFindDAO.create({of: 'tools.web.strict.Advisor'});
      },
    },
    {
      documentation: 'Hooks that are actually installed/uninstalled',
      class: 'FObjectArray',
      of: 'tools.web.strict.Hook',
      name: 'hooks_',
    },
    {
      documentation: 'Triggers that are actually installed/uninstalled',
      class: 'FObjectArray',
      of: 'tools.web.strict.Trigger',
      name: 'triggers_',
    },
    {
      documentation: 'Advisors that are actually installed/uninstalled',
      class: 'FObjectArray',
      of: 'tools.web.strict.Advisor',
      name: 'advisors_',
    },
  ],

  methods: [
    function init() {
      const config = this.processConfig(this.config, this.defaults);

      for (const hook of config.hooks) {
        const hookObject = foam.json.parse(
          this.hooks[hook], this.PubHook, this
        );
        this.store(hookObject, this.hooksDAO, this.hooks_);
      }

      let reporters = [];
      for (const trigger of config.triggers) {
        // TODO: Decorate trigger reporter according to config.
        const triggerObject = foam.json.parse(
          this.triggers[trigger], this.Trigger, this
        );
        reporters.push(triggerObject.reporter);
        this.store(triggerObject, this.triggersDAO, this.triggers_);
      }

      for (const advisor of config.advisors) {
        const advisorObject = foam.json.parse(
          this.advisors[advisor], this.Advisor, this
        );
        advisorObject.reporters = reporters;
        this.store(advisorObject, this.advisorsDAO, this.advisors_);
      }
    },
    function processConfig(config, defaults) {
      // TODO(markdittmer): Collect short-hands into structured config.
      return Object.assign({}, defaults, config);
    },
    {
      documentation: `
        Mark object (e.g., trigger or advisor) for active use in this controller.
      `,
      name: 'store',
      code: function(o, dao, array) {
        array.push(o);
        return dao.put(o);
      },
    },
    function install() {
      for (const hook of this.hooks_) {
        hook.install();
      }
      for (const trigger of this.triggers_) {
        trigger.install();
      }
      for (const advisor of this.advisors_) {
        advisor.install();
      }
    },
    function uninstall() {
      for (const hook of this.hooks_) {
        hook.uninstall();
      }
      for (const trigger of this.triggers_) {
        trigger.uninstall();
      }
      for (const advisor of this.advisors_) {
        advisor.uninstall();
      }
    },
  ],
});
