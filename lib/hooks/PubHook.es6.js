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
require('./Hook.es6.js');

foam.ENUM({
  package: 'tools.web.strict',
  name: 'PubHookTopic',

  documentation: 'Topics over which PubHooks publish',

  values: [
    {
      name: 'GET',
      label: 'Get',
    },
    {
      name: 'SET',
      label: 'Set',
    },
    {
      name: 'APPLY',
      label: 'Apply',
    },
  ],
});

foam.CLASS({
  package: 'tools.web.strict',
  name: 'PubHook',

  documentation: `
    A hook that publishes gets, sets, and/or function applications; plugs in to
    base hook implementation by composition (see "hook" property).
  `,

  implements: ['tools.web.strict.Installable'],

  requires: [
    'tools.web.strict.Hook',
    'tools.web.strict.PubHookTopic',
  ],

  documentation: `
    Hook facade that publishes events on get, set, and/or apply.
  `,

  axioms: [
    foam.lookup('tools.web.strict.SingletonById').create({
      getId: function(cls, args) {
        return `${cls.IMPL_TO_IMPL(args.implProvider).$UID.toString()}` +
          `:${args.name}` +
          ':' + (args.get !== undefined ? args.get : cls.GET.value) +
          ':' + (args.set !== undefined ? args.set : cls.SET.value) +
          ':' + (args.apply !== undefined ? args.apply : cls.APPLY.value);
      },
    }),
  ],

  constants: {
    // Constantize for easy access on class in SingletonById.getId().  This
    // translates an impl description (or "implProvider") to the actual
    // implementation object. It is used in SingletonById to get a unique ID
    // for the actual implementation. It is used on instances to translate
    // the description into the actual implementation.
    implToImpl: function IMPL_TO_IMPL(implProvider) {
      const typeOf = typeof implProvider;
      if (typeOf === 'string') {
        return implProvider.split('.').reduce(
          (impl, key) => impl[key],
          typeof window !== 'undefined' ? window : global
        );
      } else if (typeOf === 'function') {
        return implProvider();
      } else {
        return implProvider;
      }
    },
  },

  properties: [
    {
      documentation: 'Unique identifier for this hook',
      class: 'String',
      name: 'id',
      required: true,
    },
    {
      documentation: `
        Provider for implementation being hooked into. Either a global
        property-lookup path (String) or provider Function. (Un)Bound to
        "impl" in (un)install().
      `,
      name: 'implProvider',
      required: true,
    },
    {
      documentation: 'Actual implementation provided by "implProvider".',
      name: 'impl',
      transient: true,
    },
    {
      documentation: 'Subscription object for "implProvider"/"impl" binding.',
      name: 'implSub',
      value: null,
      transient: true,
    },
    {
      documentation: 'Name of the property being hooked into (passed to hook)',
      name: 'name',
      required: true,
    },
    {
      class: 'Boolean',
      documentation: 'Wrap get?',
      name: 'get',
      value: false,
    },
    {
      class: 'Boolean',
      documentation: 'Wrap set?',
      name: 'set',
      value: false,
    },
    {
      class: 'Boolean',
      documentation: 'Wrap apply?',
      name: 'apply',
      value: false,
    },
    {
      class: 'FObjectProperty',
      of: 'tools.web.strict.Hook',
      name: 'hook',
      value: null,
    },
  ],

  methods: [
    function install() {
      this.implSub = this.implProvider$.mapTo(this.impl$, this.IMPL_TO_IMPL);

      let config = {
        id: `hookFor(${this.id})`,
        name: this.name,
        impl: this.impl,
      };
      if (this.get) config.get = this.onGet;
      if (this.set) config.set = this.onSet;
      if (this.apply) config.apply = this.onApply;

      this.hook = this.Hook.create(config);

      // TODO(markdittmer): Better error-handling. In particular, a procedure is
      // needed for attempting to install a collection of hooks, and simply
      // "skipping" ones that aren't implemented by the current platform.
      try {
        return this.hook.install();
      } catch (err) {
        console.warn(`Failed to install Hook for PubHook ${this.id}`);
        return err;
      }
    },
    function uninstall() {
      let ret;
      // TODO(markdittmer): Better error-handling (as above).
      try {
        ret = this.hook.uninstall();
      } catch (err) {
        console.warn(`Failed to uninstall Hook for PubHook ${this.id}`);
        ret = err;
      }
      this.hook = null;
      this.implSub.detach();
      return ret;
    },
  ],

  listeners: [
    function onGet(value) {
      this.pub(this.PubHookTopic.GET, value);
      return value;
    },
    function onSet(old, nu) {
      this.pub(this.PubHookTopic.SET, old, nu);
      return nu;
    },
    function onApply(value, self, ...args) {
      this.pub(this.PubHookTopic.APPLY, value, self, args);
      return value.apply(self, args);
    },
  ],
});
