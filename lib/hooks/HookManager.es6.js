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

// TODO(markdittmer): This should be unnecessary if hooks could compose
// themselves over existing custom getters and setters.
foam.CLASS({
  package: 'tools.web.strict',
  name: 'HookManager',

  axioms: [foam.lookup('foam.pattern.Singleton').create()],

  properties: [
    {
      documentation: 'Hash map of installed hooks',
      name: 'installedHooks',
      factory: function() {
        return {};
      },
    },
  ],

  methods: [
    function installHook(hook) {
      if (this.installedHooks[this.getHookHash(hook)])
        throw new Error(`Attempt to install two hooks on ${hook.impl.$UID}.${hook.name}`);
      this.installedHooks[this.getHookHash(hook)] = 1;
    },
    function uninstallHook(hook) {
      if (!this.installedHooks[this.getHookHash(hook)])
        throw new Error(`Attempt to uninstall unknown hooks from ${hook.impl.$UID}.${hook.name}`);
      delete this.installedHooks[this.getHookHash(hook)];
    },
    function getHookHash(hook) {
      return `${hook.impl.$UID}:${hook.name}`;
    },
  ],
});
