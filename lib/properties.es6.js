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
  name: 'MethodProperty',
  extends: 'FObjectProperty',

  documentation: `
    Property that may be set to a function, a Method object, or data
    specification of a method object, and assume the function value.
  `,

  requires: ['Method'],

  properties: [
    {
      name: 'of',
      value: 'Method',
    },
    {
      name: 'adapt',
      value: function(_, o, self) {
        if (!o) return o;

        if (typeof o === 'function')
          return self.Method.create({code: o}).code;
        if (!self.Method.isInstance(o))
          return self.Method.create(o).code;
        return o.code;
      },
    },
    {
      name: 'factory',
      value: function(self) {
        return self.adapt(
          undefined,
          Object.assign({}, self.value, {name: self.name}),
          self
        );
      },
    },
  ],
});
