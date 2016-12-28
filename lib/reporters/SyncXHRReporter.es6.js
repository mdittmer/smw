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

require('../advice.es6.js');
require('./PubReporter.es6.js');

foam.CLASS({
  package: 'tools.web.strict',
  name: 'SyncXHRReporter',
  extends: 'tools.web.strict.PubReporter',

  requires: [
    'tools.web.strict.Advice',
    'tools.web.strict.Link',
  ],

  methods: [
    function report(xhr, method, url) {
      try {
        throw new Error('Synchronous XHR');
      } catch (error) {
        this.SUPER(this.Advice.create({
          title: 'Synchronous XHR',
          description: `
              Synchronous XMLHttpRequests (XHRs) run on the browser's main
              thread, preventing UI updates and script execution until the
              request has been fulfilled. This usually leads to a bad user
              experience.
            `,
          solution: `
              Locate areas in your code that invoke
              request.open(method, url, false) and change the last parameter
              to true. Code that follows such calls may assume that the
              request has already been fulfilled, and may need to be
              refactored into a callback taht is invoked after the request
              has actually been fulfilled.
            `,
          context: {xhr, method, url, error},
          references: [
            this.Link.create({
              url: 'https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests',
              text: 'MDN Article',
              description: 'Synchronous and asynchronous requests',
            }),
          ],
        }));
      }
    },
  ],
});
