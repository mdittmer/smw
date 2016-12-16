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
        return `${args.impl.$UID.toString()}:${args.name}` +
          ':' + (args.get !== undefined ? args.get : cls.GET.value) +
          ':' + (args.set !== undefined ? args.set : cls.SET.value) +
          ':' + (args.apply !== undefined ? args.apply : cls.APPLY.value);
      },
    }),
  ],

  properties: [
    {
      documentation: 'Unique identifier for this hook',
      class: 'String',
      name: 'id',
      required: true,
    },
    {
      documentation: 'Implementation to hook into (passed to hook)',
      name: 'impl',
      required: true,
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
      let config = {
        id: `hookFor(${this.id})`,
        name: this.name,
        impl: this.impl,
      };
      if (this.get) config.get = this.onGet;
      if (this.set) config.set = this.onSet;
      if (this.apply) config.apply = this.onApply;

      this.hook = this.Hook.create(config);
      return this.hook.install();
    },
    function uninstall() {
      const ret = this.hook.uninstall();
      this.hook = null;
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
