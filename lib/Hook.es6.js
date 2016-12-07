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

foam.CLASS({
  package: 'tools.web.strict',
  name: 'Hook',

  imports: ['Proxy'],

  properties: [
    {
      name: 'impl',
    },
    {
      name: 'name',
    },
    {
      name: 'get',
      value: null,
    },
    {
      name: 'set',
      value: null,
    },
    {
      name: 'apply',
      value: null,
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.value = this.impl[this.name];

      let newDesc = Object.assign(
        {}, Object.getOwnPropertyDescriptor(this.impl, this.name) || {}
      );

      // Eliminate values incompatible with our getter/setter wrapping.
      if (newDesc.hasOwnProperty('value') ) delete newDesc.value;
      if (newDesc.hasOwnProperty('get')) delete newDesc.get;
      if (newDesc.hasOwnProperty('set')) delete newDesc.set;
      if (newDesc.hasOwnProperty('writable')) delete newDesc.writable;

      if (this.get) {
        if (this.apply) {
          const self = this;
          const apply = function(...args) {
            const value = self.get(self.value);
            return self.apply(value, this, ...args);
          };
          newDesc.get = () => apply;
        } else {
          newDesc.get = () => {
            return this.get(this.value);
          };
        }
      } else {
        if (this.apply) {
          const self = this;
          const apply = function(...args) {
            return self.apply(self.value, this, ...args);
          };
          newDesc.get = () => apply;
        } else {
          newDesc.get = () => {
            return this.value;
          };
        }
      }

      if (this.set) {
        newDesc.set = newValue => {
          this.value = this.set(this.value, newValue);
          return this.value;
        };
      } else {
        newDesc.set = newValue => {
          this.value = newValue;
          return this.value;
        };
      }

      Object.defineProperty(this.impl, this.name, newDesc);
    },
  ],
});
