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

describe('HookManager', () => {
  let installHook;
  beforeAll(() => {
    require('../../lib/hooks/Hook.es6.js');
    const Hook = foam.lookup('tools.web.strict.Hook');
    const ProxyX = foam.createSubContext({Proxy});

    let count = 0;
    const doInstallHook = (opts, X) => {
      opts.id = opts.id || `anonymousHook${count++}`;
      const hook = Hook.create(opts, X);
      hook.install();
      return hook;
    };

    installHook = opts => doInstallHook(opts, ProxyX);
  });

  let f1, f2;
  let impl1, impl2;
  let g1, g2;
  let get1;
  let s1, s2;
  let set1;
  let a1, a2;
  let apply1;
  let gsa2;
  const name = 'f';

  function resetGSA() {
    g1 = g2 = s1 = s2 = a1 = a2 = 0;
  }
  beforeEach(function() {
    resetGSA();
  });
  afterEach(function() {
    f1 = f2 = impl1 = impl2 = get1 = set1 = apply1 = gsa2 = undefined;
  });

  function setupImpl1() {
    f1 = function() {
      return true;
    };
    impl1 = {};
    impl1[name] = f1;
  }
  function setupImpl2() {
    f2 = function() {
      return true;
    };
    impl2 = {};
    impl2[name] = f2;
  }
  function setupGet1() {
    g1 = 0;
    get1 = installHook({
      id: 'get1',
      impl: impl1,
      name,
      get: function(value) {
        g1++;
        return value;
      },
    });
  }
  function setupSet1() {
    s1 = 0;
    set1 = installHook({
      id: 'set1',
      impl: impl1,
      name,
      set: function(old, nu) {
        s1++;
        return nu;
      },
    });
  }
  function setupApply1() {
    a1 = 0;
    apply1 = installHook({
      id: 'apply1',
      impl: impl1,
      name,
      apply: function(value, self, args) {
        a1++;
        return value.apply(self, args);
      },
    });
  }
  function setupGSA2() {
    g2 = 0;
    s2 = 0;
    a2 = 0;
    gsa2 = installHook({
      id: 'gsa2',
      impl: impl2,
      name,
      get: function(value) {
        g2++;
        return value;
      },
      set: function(old, nu) {
        s2++;
        return nu;
      },
      apply: function(value, self, args) {
        a2++;
        return value.apply(self, args);
      },
    });
  }
  function checkGSA() {
    expect(g1).toBe(g2);
    expect(s1).toBe(s2);
    expect(a1).toBe(a2);
  }

  function standardSetup() {
    setupImpl1();
    setupImpl2();

    setupGSA2();
  }

  function standardTearDown() {
    gsa2.uninstall();
  }

  function strictTest() {
    impl1.f;
    impl2.f;
    checkGSA();

    impl1.f();
    impl2.f();
    checkGSA();

    impl1.f = function() {
      return true;
    };
    impl2.f = function() {
      return true;
    };
    checkGSA();

    impl1.f();
    impl2.f();
    checkGSA();
  }

  function simpleTest() {
    impl1.f;
    impl2.f;
    expect(g1).toBe(g2);

    resetGSA();

    impl1.f();
    impl2.f();
    expect(g1).toBe(g2);
    expect(a1).toBe(a2);

    resetGSA();

    impl1.f = function() {
      return true;
    };
    impl2.f = function() {
      return true;
    };
    // NOTE: With some (otherwise equivalent) configurations may/may not
    // include a "get" as a part of a "set"; hence strictTest() for some
    // configurations and simpleTest() for others.
    expect(s1).toBe(s2);

    resetGSA();

    impl1.f();
    impl2.f();
    expect(g1).toBe(g2);
    expect(a1).toBe(a2);
  }

  it('apply(set(get(impl))) = getSetApply(impl)', () => {
    standardSetup();

    setupGet1();
    setupSet1();
    setupApply1();

    strictTest();

    apply1.uninstall();
    set1.uninstall();
    get1.uninstall();

    standardTearDown();
  });
  it('set(apply(get(impl))) = getSetApply(impl)', () => {
    standardSetup();

    setupGet1();
    setupApply1();
    setupSet1();

    strictTest();

    apply1.uninstall();
    set1.uninstall();
    get1.uninstall();

    standardTearDown();
  });
  it('set(get(apply(impl))) = getSetApply(impl)', () => {
    standardSetup();

    setupApply1();
    setupGet1();
    setupSet1();

    strictTest();

    apply1.uninstall();
    set1.uninstall();
    get1.uninstall();

    standardTearDown();
  });
  it('get(set(apply(impl))) = getSetApply(impl)', () => {
    standardSetup();

    setupApply1();
    setupSet1();
    setupGet1();

    simpleTest();

    apply1.uninstall();
    set1.uninstall();
    get1.uninstall();

    standardTearDown();
  });
  it('get(apply(set(impl))) = getSetApply(impl)', () => {
    standardSetup();

    setupSet1();
    setupApply1();
    setupGet1();

    simpleTest();

    apply1.uninstall();
    set1.uninstall();
    get1.uninstall();

    standardTearDown();
  });
});
