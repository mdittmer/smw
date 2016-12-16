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
  name: 'SingletonById',

  properties: [
    'instances_',
    {
      name: 'getId',
      value: function getId(opts) {
        if ((!opts) || opts.id === undefined) {
          throw new Error(
            `Attempt to construct ${this.id} instance with no "id"`
          );
        }
      },
    },
  ],

  methods: [
    function installInClass(cls) {
      const oldCreate = cls.create;
      const getId = this.getId.bind(this);

      cls.instances_ = {};

      cls.create = function(args, X) {
        const id = getId(this, args, X);
        return cls.instances_[id] ||
          (cls.instances_[id] = oldCreate.call(this, args, X));
      };
    },

    function clone() {
      return this;
    },
    function equals(other) {
      return other === this;
    },
  ],
});
