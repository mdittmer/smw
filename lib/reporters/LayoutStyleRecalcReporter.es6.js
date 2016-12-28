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
require('./FramedThresholdReporter.es6.js');

foam.CLASS({
  package: 'tools.web.strict',
  name: 'LayoutStyleRecalcReporter',
  extends: 'tools.web.strict.FramedThresholdReporter',

  requires: [
    'tools.web.strict.Advice',
    'tools.web.strict.Link',
  ],

  methods: [
    function report(src, context) {
      try {
        throw new Error('Forced layout / style recalculation');
      } catch (error) {
        context.error = error;
        // TODO(markdittmer): Possible optimization: Defer Advice creation to
        // onTimeout in all ThresholdReporters.
        this.SUPER(this.Advice.create({
          title: 'Forced layout / style recalculation',
          description: `
              Many synchronous CSS/DOM APIs force the browser to perform
              document layout and/or recalculate element styles. Heavy use of
              these APIs within the same frame can introduce performance
              problems.
            `,
          solution: `
              Refactor code to defer non-time-sensitive CSS/DOM operations,
              eliminate loops or recursion that invoke CSS/DOM repeatedly, or
              use a virtual DOM library to batch DOM operations for you.
            `,
          context,
          references: [
            this.Link.create({
              url: 'https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing',
              text: 'Avoid Large, Complex Layouts and Layout Thrashing',
              description: `
                In-depth article on how to avoid repeated layout operations
              `,
            }),
            this.Link.create({
              url: 'https://gist.github.com/paulirish/5d52fb081b3570c81e3a',
              text: 'What forces layout / reflow',
              description: `
                A comprehensive list of APIs that cause layout / style
                recalculation.
              `,
            }),
          ],
        }));
      }
    },
  ],
});
