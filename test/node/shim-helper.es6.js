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

// Stub out known web APIs.

// TODO(markdittmer): Setup a proper dependency.
const data = require('../../node_modules/web-apis-investigator/data/idl/blink/linked/processed.json');
const v = {};
const f = function() {
  return v;
};

function defineProperty(ifName, memName, desc) {
  let impl = global;
  if (!impl[ifName]) impl[ifName] = function() {};
  impl = impl[ifName];
  if (!impl.prototype) impl.prototype = {};
  impl = impl.prototype;

  Object.defineProperty(impl, memName, desc);
  if (ifName === 'Window')
    Object.defineProperty(global, memName, desc);
}

beforeAll(() => {
  for (const iface of data) {
    if (!iface.members) continue;

    for (const member of iface.members) {
      if (!member.name) continue;

      let desc = {configurable: true};
      if (member.type_ === 'Attribute') {
        desc.get = () => v;
        if (!member.isReadOnly)
          desc.set = () => v;

      } else {
        desc.value = f;
      }
      defineProperty(iface.name, member.name, desc);
    }
  }
});
