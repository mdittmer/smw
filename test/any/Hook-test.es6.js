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

let createHook;
let createHookNoProxy;
let dualIt = (desc, f) => {
  it(`${desc} (proxy)`, () => f(createHook));
  it(`${desc} (no proxy)`, () => f(createHookNoProxy));
};

beforeAll(() => {
  require('../../lib/Hook.es6.js');
  const Hook = foam.lookup('tools.web.strict.Hook');
  const ProxyX = foam.createSubContext({Proxy});
  const NoProxyX = foam.createSubContext({Proxy: null});
  createHook = opts => Hook.create(opts, ProxyX);
  createHookNoProxy = opts => Hook.create(opts, NoProxyX);

  dualIt = (desc, f) => {
    it(`${desc} (proxy)`, () => f(createHook));
    it(`${desc} (no proxy)`, () => f(createHookNoProxy));
  };
});

describe('Hook', () => {
  dualIt('Provide class', createHook => {
    expect(foam.lookup('tools.web.strict.Hook')).toBeDefined();
  });

  dualIt('Invocation passes through', createHook => {
    let value = 0;
    const impl = {f: () => value++};
    const hook = createHook({impl, name: 'f'});
    impl.f();
    expect(value).toBe(1);
  });

  dualIt('Invocation wraps', createHook => {
    let value = 0;
    const impl = {f: () => true};
    const hook = createHook({
      impl,
      name: 'f',
      apply: () => value++,
    });
    impl.f();
    expect(value).toBe(1);
  });

  dualIt('Get passes through', createHook => {
    const impl = {p: 0};
    const hook = createHook({impl, name: 'p'});
    expect(impl.p).toBe(0);
  });

  dualIt('Get wraps', createHook => {
    let value = 0;
    const impl = {p: 0};
    const hook = createHook({
      impl,
      name: 'p',
      get: () => value++,
    });
    const p = impl.p;
    expect(p).toBe(0); // From value before ++.
    expect(value).toBe(1);
  });

  dualIt('Set passes through', createHook => {
    const impl = {p: 0};
    const hook = createHook({impl, name: 'p'});
    impl.p = 1;
    expect(impl.p).toBe(1);
  });

  dualIt('Set wraps', createHook => {
    let value = 0;
    const impl = {p: 0};
    const hook = createHook({
      impl,
      name: 'p',
      set: () => value++,
    });
    impl.p = -1; // Overridden by setter.
    expect(impl.p).toBe(0); // From value before ++.
    expect(value).toBe(1);
  });
});
