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

let Link;
let Advice;
beforeAll(() => {
  require('../../lib/advice.es6.js');
  Link = foam.lookup('tools.web.strict.Link');
  Advice = foam.lookup('tools.web.strict.Advice');
});

// TODO(markdittmer): Use string matchers to get more useful failure messages
// from tring-comparison tests.

describe('advice', () => {
  it('Link plain text contains URL, text, description', () => {
    const url = 'https://www.example.com/';
    const text = 'Example';
    const description = 'An example';
    const link = Link.create({url, text, description});
    expect(
      link.toPlainText().match(/https:\/\/www[.]example[.]com\//)
    ).not.toBeNull();
    expect(
      link.toPlainText().match(/Example/)
    ).not.toBeNull();
    expect(
      link.toPlainText().match(/An[ ]example/)
    ).not.toBeNull();
  });

  it('Advice plain text contains title, description, solution', () => {
    const title = 'My Advice';
    const description = 'What I have to say';
    const solution = 'Try all the things';
    const advice = Advice.create({title, description, solution});
    expect(
      advice.toPlainText().match(/My[ ]Advice/)
    ).not.toBeNull();
    expect(
      advice.toPlainText().match(/What[ ]I[ ]have[ ]to[ ]say/)
    ).not.toBeNull();
    expect(
      advice.toPlainText().match(/Try[ ]all[ ]the[ ]things/)
    ).not.toBeNull();
  });

  it('Advice plain text contains reference URLs', () => {
    const title = 'My Advice';
    const description = 'What I have to say';
    const solution = 'Try all the things';
    const references = [
      Link.create({url: 'https://www.example.com/1'}),
      Link.create({url: 'https://www.example.com/2'}),
    ];
    const advice = Advice.create({title, description, solution, references});
    expect(
      advice.toPlainText().match(/https:\/\/www[.]example[.]com\/1/)
    ).not.toBeNull();
    expect(
      advice.toPlainText().match(/https:\/\/www[.]example[.]com\/2/)
    ).not.toBeNull();
  });
});
