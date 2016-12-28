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

// Attempt to wrap known web APIs in hooks.

// TODO(markdittmer): Setup a proper dependency.
const data = require('../../node_modules/web-apis-investigator/data/idl/blink/linked/processed.json');

// let hooksNoType = {};
let hooks = {};

function storeHook(type, iface, member) {
  const ifName = iface.name;
  const memName = member.name;

  // Some data are not named interface + named member.
  if (!(ifName && memName)) return;

  const id = `${ifName}.prototype.${memName}.${type}`;
  const json = {
    class: 'tools.web.strict.PubHook',
    id,
    implProvider: `${ifName}.prototype`,
    name: memName,
  };
  json[type] = true;
  hooks[id] =
    json;
}

for (const iface of data) {
  if (!iface.members) continue;
  iface.members.filter(x => x.type_ === 'Attribute').forEach(
    storeHook.bind(this, 'get', iface)
  );
  iface.members.filter(x => x.type_ === 'Attribute' && !x.isReadOnly).forEach(
    storeHook.bind(this, 'set', iface)
  );
  iface.members.filter(x => x.type_ !== 'Attribute').forEach(
    storeHook.bind(this, 'apply', iface)
  );
};

module.exports = hooks;
