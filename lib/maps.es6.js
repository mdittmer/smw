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

require('./properties.es6.js');

foam.CLASS({
  package: 'tools.web.strict',
  name: 'Map',

  methods: [
    function put(key, value) {
      throw new Error('Map without put implementation');
    },
    function get(key) {
      throw new Error('Map without get implementation');
    },
    function select() {
      throw new Error('Map without select implementation');
    },
  ],
});

foam.CLASS({
  package: 'tools.web.strict',
  name: 'ProxyMap',
  extends: 'tools.web.strict.Map',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'tools.web.strict.Map',
      name: 'delegate',
      value: null,
    },
  ],

  methods: [
    function put(key, value) {
      return this.delegate ? this.delegate.put(key, value) : undefined;
    },
    function get(key) {
      return this.delegate ? this.delegate.get(key) : undefined;
    },
    function select() {
      return this.delegate ? this.delegate.select() : [];
    },
  ],
});

foam.CLASS({
  package: 'tools.web.strict',
  name: 'NoOverwriteMap',
  extends: 'tools.web.strict.ProxyMap',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'tools.web.strict.Map',
      name: 'delegate',
      value: null,
    },
  ],

  methods: [
    function put(key, value) {
      return this.delegate && this.delegate.get(key) === undefined ?
        this.delegate.put(key, value) : undefined;
    },
  ],
});

foam.CLASS({
  package: 'tools.web.strict',
  name: 'SerializingMap',
  extends: 'tools.web.strict.ProxyMap',

  properties: [
    {
      name: 'context',
      value: null,
    },
    {
      class: 'Function',
      name: 'serialize',
      value: function(value) {
        return foam.json.objectify(value);
      },
    },
    {
      class: 'Function',
      name: 'deserialize',
      value: function(key) {
        return foam.json.parse(
          this.delegate.get(key), undefined, this.context || this
        );
      },
    },
  ],

  methods: [
    function put(key, value) {
      return this.delegate ?
        this.delegate.put(key, this.serialize(value)) : undefined;
    },
    function get(key) {
      try {
        return this.delegate ? this.deserialize(key) : undefined;
      } catch (error) {
        return undefined;
      }
    },
  ],
});

foam.CLASS({
  package: 'tools.web.strict',
  name: 'SplitMap',
  extends: 'tools.web.strict.ProxyMap',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'tools.web.strict.Map',
      name: 'cache',
      value: null,
    },
  ],

  methods: [
    function put(key, value) {
      return this.delegate ? this.delegate.put(key, value) : undefined;
    },
    function get(key) {
      const cached = this.cache ? this.cache.get(key) : undefined;
      const value = this.delegate ? this.delegate.get(key) : undefined;
      if (this.cache && cached === undefined && value !== undefined)
        this.cache.put(key, value);
      return cached ? cached : value;
    },
  ],
});

foam.CLASS({
  package: 'tools.web.strict',
  name: 'ObjectMap',
  extends: 'tools.web.strict.Map',

  properties: [
    {
      name: 'map',
      factory: function() {
        return {};
      },
    },
    {
      documentation: 'Sorter function for key sorting on select().',
      class: 'tools.web.strict.MethodProperty',
      name: 'sort',
      value: {
        returns: {
          documentation: `
            Integer indicating order, as per Array.prototype.sort(sortFn)
          `,
          typeName: 'Int',
        },
        args: [
          {
            documentation: 'The left-side key.',
            name: 'a',
          },
          {
            documentation: 'The right-side key.',
            name: 'b',
          },
        ],
        code: null,
      },
    },
  ],

  methods: [
    function put(key, value) {
      return (this.map[key] = value);
    },
    function get(key) {
      return this.map[key];
    },
    function select() {
      return Object.keys(this.map).sort(this.sort).map(key => this.map[key]);
    },
  ],
});

foam.CLASS({
  package: 'tools.web.strict',
  name: 'ActiveMap',
  extends: 'tools.web.strict.ProxyMap',

  requires: [
    'tools.web.strict.NoOverwriteMap',
    'tools.web.strict.SerializingMap',
    'tools.web.strict.SplitMap',
    'tools.web.strict.ObjectMap',
  ],

  constants: {
    sortMatchers: [
      /[.]get$/,
      /[.]set$/,
      /[.]apply$/,
    ],
  },

  properties: [
    {
      class: 'FObjectProperty',
      of: 'tools.web.strict.Map',
      name: 'active',
      value: null,
    },
    {
      name: 'map',
      factory: function() {
        return {};
      },
    },
    {
      class: 'Function',
      name: 'serialize',
      value: function(value) {
        return foam.json.objectify(value);
      },
    },
    {
      class: 'Function',
      name: 'deserialize',
      value: function(key) {
        return foam.json.parse(
          this.delegate.get(key), undefined, this.context || this
        );
      },
    },
    {
      documentation: `
        Sorter function for key sorting on ObjectMap.select(). Ensures that
        hooks in the same map are selected in a consistent order for
        installation.
      `,
      class: 'Function',
      name: 'sort',
      value: function(a, b) {
        if (a === b) return 0;

        for (let i = 0; i < this.SORT_MATCHERS.length; i++) {
          const matcher = this.SORT_MATCHERS[i];
          if (a.match(matcher) && !b.match(matcher))
            return 1;
        }
        return a < b ? -1 : 1;
      },
    },
  ],

  methods: [
    function init() {
      this.active = this.ObjectMap.create({sort: this.sort.bind(this)});
      this.delegate = this.NoOverwriteMap.create({
        delegate: this.SplitMap.create({
          cache: this.active,
          delegate: this.SerializingMap.create({
            serialize: this.serialize,
            deserialize: this.deserialize,
            delegate: this.ObjectMap.create({
              map: this.map,
              sort: this.sort.bind(this),
            }),
          }),
        }),
      });
    },
  ],
});
