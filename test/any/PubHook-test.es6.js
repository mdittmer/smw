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

let installPubHook;
beforeAll(() => {
  const X = foam.createSubContext({Proxy});
  require('../../lib/PubHook.es6.js');
  const PubHook = foam.lookup('tools.web.strict.PubHook');
  const doInstallPubHook = (opts) => {
    const impl = opts.impl;
    delete opts.impl;
    const hook = PubHook.create(opts, X);
    hook.install(impl);
    return hook;
  };
  installPubHook = opts => doInstallPubHook(opts);
});

describe('PubHook', () => {
  it('Provide class', () => {
    expect(foam.lookup('tools.web.strict.PubHook')).toBeDefined();
  });

  it('No publications with no get/set/apply set', () => {
    let value = 0;
    const impl = {f: () => true};
    const hook = installPubHook({impl, name: 'f'});
    hook.sub('get', () => value++);
    hook.sub('set', () => value++);
    hook.sub('apply', () => value++);
    impl.f;
    impl.f = () => false;
    impl.f();
    expect(value).toBe(0);
  });

  it('Get publishes', () => {
    let value = 0;
    const impl = {f: () => true};
    const hook = installPubHook({impl, name: 'f', get: true});
    hook.sub('get', () => value++);
    impl.f;
    impl.f;
    expect(value).toBe(2);
  });

  it('Set publishes', () => {
    let value = 0;
    const impl = {f: () => true};
    const hook = installPubHook({impl, name: 'f', set: true});
    hook.sub('set', () => value++);
    impl.f = () => false;
    impl.f = () => null;
    expect(value).toBe(2);
  });

  it('Apply publishes', () => {
    let value = 0;
    const impl = {f: () => true};
    const hook = installPubHook({impl, name: 'f', apply: true});
    hook.sub('apply', () => value++);
    impl.f();
    impl.f();
    expect(value).toBe(2);
  });

  it('Get, set work together', () => {
    let gets = 0;
    let sets = 0;
    const impl = {f: () => true};
    const hook = installPubHook({impl, name: 'f', get: true, set: true});
    hook.sub('get', () => gets++);
    hook.sub('set', () => sets++);
    impl.f;
    impl.f = () => false;
    expect(gets).toBe(1);
    expect(sets).toBe(1);
  });

  it('Get, apply work together', () => {
    let gets = 0;
    let applies = 0;
    const impl = {f: () => true};
    const hook = installPubHook({impl, name: 'f', get: true, apply: true});
    hook.sub('get', () => gets++);
    hook.sub('apply', () => applies++);
    impl.f; // Get.
    impl.f(); // Get-then-apply.
    expect(gets).toBe(2);
    expect(applies).toBe(1);
  });

  it('Set, apply work together', () => {
    let sets = 0;
    let applies = 0;
    const impl = {f: () => true};
    const hook = installPubHook({impl, name: 'f', set: true, apply: true});
    hook.sub('set', () => sets++);
    hook.sub('apply', () => applies++);
    impl.f = () => false; // Set.
    impl.f(); // Apply.
    expect(sets).toBe(1);
    expect(applies).toBe(1);
  });

  it('Get, set, and apply work together', () => {
    let gets = 0;
    let sets = 0;
    let applies = 0;
    const impl = {f: () => true};
    const hook = installPubHook({
      impl,
      name: 'f',
      get: true,
      set: true,
      apply: true,
    });
    hook.sub('get', () => gets++);
    hook.sub('set', () => sets++);
    hook.sub('apply', () => applies++);
    impl.f; // Get.
    impl.f = () => false; // Set.
    impl.f(); // Get-then-apply.
    expect(gets).toBe(2);
    expect(sets).toBe(1);
    expect(applies).toBe(1);
  });
});
