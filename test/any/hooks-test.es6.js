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

let hooks;
beforeAll(() => {
  hooks = require('../../lib/hooks/hooks.es6.js');
});

describe('hooks', () => {
  it('Class, id, impl, and name', () => {
    foam.Object.forEach(hooks, value => {
      expect(typeof value.class).toBe('string');
      expect(value.id).toBeDefined();
      expect(value.impl).toBeDefined();
      expect(typeof value.name).toBe('string');
    });
  });
});
