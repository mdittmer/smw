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

require('./Hook.es6.js');

foam.CLASS({
  package: 'tools.web.strict',
  name: 'PubHook',

  requires: ['tools.web.strict.Hook'],

  documentation: `
    Hook facade that publishes events on get, set, and/or apply.
  `,

  properties: [
    {
      documentation: 'Unique identifier for this pub-hook',
      name: 'id',
      factory: function() {
        return `anonymousPubHook${this.$UID}`;
      },
    },
    {
      documentation: 'Name of the property being hooked into',
      name: 'name',
      required: true,
    },
    {
      documentation: `
        Object to which the property being hooked into belongs, generally set at
        install() time.
      `,
      name: 'impl',
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
    function install(impl) {
      let config = {name: this.name};
      if (this.get) config.get = this.onGet;
      if (this.set) config.set = this.onSet;
      if (this.apply) config.apply = this.onApply;

      this.hook = this.Hook.create(config);
      return this.hook.install(impl);
    },
    function uninstall() {
      const ret = this.hook.uninistall();
      this.hook = null;
      return ret;
    },
  ],

  listeners: [
    function onGet(value) {
      this.pub('get', value);
      return value;
    },
    function onSet(old, nu) {
      this.pub('set', old, nu);
      return nu;
    },
    function onApply(value, self, args) {
      this.pub('apply', value, self, args);
      return value.apply(self, args);
    },
  ],
});
