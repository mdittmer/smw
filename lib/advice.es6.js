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
  name: 'Link',

  properties: [
    {
      class: 'String',
      name: 'url',
      required: true,
    },
    {
      documentation: 'Suggested link text',
      class: 'String',
      name: 'text',
      required: true,
    },
    {
      documentation: 'Discussion of the link',
      class: 'String',
      name: 'description',
    },
  ],

  methods: [
    function toPlainText() {
      let str = `${this.text}: ${this.url}`;
      if (this.description) str += `\n  ${this.description}`;
      return str;
    },
  ],
});

foam.CLASS({
  package: 'tools.web.strict',
  name: 'Advice',

  properties: [
    {
      class: 'String',
      name: 'title',
      required: true,
    },
    {
      class: 'String',
      name: 'description',
      required: true,
    },
    {
      class: 'String',
      name: 'solution',
      required: true,
    },
    {
      documentation: `
        Contextual information about where in user's code this advice applies
      `,
      name: 'context',
      value: null,
    },
    {
      class: 'FObjectArray',
      of: 'tools.web.strict.Link',
      name: 'references',
    },
  ],

  methods: [
    function toPlainText() {
      let str = `${this.title}\n${this.underline(this.title, '=')}\n\n${this.description}`;
      if (this.solution) str += `\n\nSolution: ${this.solution}`;
      if (this.references.length > 0) str += `\n\nReferences:\n${this.references.map((ref, i) => '[' + i + '] ' + ref.toPlainText()).join('\n')}`;
      return str;
    },
    function underline(text, char) {
      char = char || '-';
      let str = '';
      for (let i = 0; i < text.length; i++) {
        str += char;
      }
      return str;
    },
  ],
});
