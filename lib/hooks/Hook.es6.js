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
require('../patterns.es6.js');
require('../properties.es6.js');
require('./HookManager.es6.js');

foam.CLASS({
  package: 'tools.web.strict',
  name: 'Hook',

  documentation: `
    Wrap some object.property with custom getter, setter, and/or invoker. This
    facilitates "hooking into" web APIs. E.g.,

    let hook = Hook.create({
      name: 'requestAnimationFrame',
      apply: (...) => ...,
    }).install(window)

    ...

    hook.uninstall()
  `,

  implements: ['tools.web.strict.Installable'],

  requires: ['tools.web.strict.HookManager'],
  imports: ['Proxy'],

  properties: [
    {
      documentation: 'Unique identifier for this hook',
      class: 'String',
      name: 'id',
      required: true,
    },
    {
      documentation: 'Name of the property being hooked into',
      class: 'String',
      name: 'name',
      required: true,
    },
    {
      documentation: `
        Object to which the property being hooked into belongs, generally set at
        install() time.
      `,
      name: 'impl',
      required: true,
    },
    {
      name: 'value',
      getter: function() {
        const desc = this.prevPropertyDescriptor;
        if (!desc) return undefined;
        if (desc.value !== undefined) return desc.value;
        if (desc.get !== undefined) return desc.get();
        return undefined;
      },
      setter: function(value) {
        const desc = this.prevPropertyDescriptor;
        if (!desc) {
          const newDesc = {};
          return newDesc.value = value;
        }
        if (desc.value !== undefined) return desc.value = value;
        if (desc.set !== undefined) return desc.set(value);
        return undefined;
      },
    },
    {
      documentation: 'Descriptor before installation; kept for uninstallation',
      name: 'prevPropertyDescriptor',
      value: null,
    },
    {
      documentation: 'Wrapper for property-get',
      class: 'tools.web.strict.MethodProperty',
      name: 'get',
      value: {
        returns: {
          documentation: 'Value stored in property',
          typeName: 'any',
        },
        args: [
          {
            documentation: 'The value currently stored in the property',
            name: 'value',
          },
        ],
        code: null,
      },
    },
    {
      documentation: 'Wrapper for property-set',
      class: 'tools.web.strict.MethodProperty',
      name: 'set',
      value: {
        returns: {
          documentation: 'Value assigned to property',
          typeName: 'any',
        },
        args: [
          {
            documentation: 'Previous value before assignment',
            name: 'old',
          },
          {
            documentation: 'New value being assigned',
            name: 'nu',
          },
        ],
        code: null,
      },
    },
    {
      documentation: 'Wrapper for invoking property as a function',
      class: 'tools.web.strict.MethodProperty',
      name: 'apply',
      value: {
        returns: {
          documentation: 'Value returned from invocation',
          typeName: 'any',
        },
        args: [
          {
            documentation: 'The value currently stored in the property',
            name: 'value',
          },
          {
            documentation: 'The "this" for the invocation',
            name: 'self',
          },
          {
            documentation: 'The "arguments" for the invocation',
            name: 'args',
          },
        ],
        code: null,
      },
    },
    {
      name: 'manager',
      factory: function() {
        return this.HookManager.create();
      },
    },
  ],

  methods: [
    function install() {
      this.manager.installHook(this);

      const oldDesc = Object.getOwnPropertyDescriptor(this.impl, this.name);

      if (!oldDesc)
        throw new Error(`Attempt to wrap non-existent property "${this.name}"`);

      this.prevPropertyDescriptor = oldDesc;

      let newDesc = Object.assign({}, oldDesc);

      // Eliminate values incompatible with our getter/setter wrapping.
      if (newDesc.hasOwnProperty('value') ) delete newDesc.value;
      if (newDesc.hasOwnProperty('get')) delete newDesc.get;
      if (newDesc.hasOwnProperty('set')) delete newDesc.set;
      if (newDesc.hasOwnProperty('writable')) delete newDesc.writable;
      newDesc.configurable = true;

      const hook = this;
      if (this.get) {
        if (this.apply) {
          newDesc.get = function() {
            const value = hook.get(hook.value);
            return function(...args) {
              return hook.apply(value, this, ...args);
            };
          };
        } else {
          newDesc.get = function() {
            return hook.get(hook.value);
          };
        }
      } else {
        if (this.apply) {
          const apply = function(...args) {
            return hook.apply(hook.value, this, ...args);
          };
          newDesc.get = function() {
            return apply;
          };
        } else {
          newDesc.get = function() {
            return hook.value;
          };
        }
      }

      if (this.set) {
        newDesc.set = function(newValue) {
          hook.value = hook.set(hook.value, newValue);
          return hook.value;
        };
      } else {
        newDesc.set = function(newValue) {
          hook.value = newValue;
          return hook.value;
        };
      }

      Object.defineProperty(this.impl, this.name, newDesc);
    },
    function uninstall() {
      this.manager.uninstallHook(this);

      Object.defineProperty(this.impl, this.name, this.prevPropertyDescriptor);
    },
  ],
});
