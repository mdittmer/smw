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

require('../reporters/LayoutStyleRecalcReporter.es6.js');
require('./MultiTrigger.es6.js');

foam.CLASS({
  package: 'tools.web.strict',
  name: 'LayoutStyleRecalcTrigger',

  extends: 'tools.web.strict.MultiTrigger',
  imports: ['hooks as hooksMap'],

  constants: {
    reporterClass: foam.lookup('tools.web.strict.LayoutStyleRecalcReporter'),
  },

  properties: [
    {
      class: 'FObjectArray',
      of: 'tools.web.strict.PubHook',
      name: 'hooks',
      factory: function() {
        const map = this.hooksMap;
        const ret = [
          // TODO: Add all DOM write APIs?

          //
          // Elements
          //
          // Element apply:
          map.get('Element.prototype.getClientRects.apply'),
          map.get('Element.prototype.getBoundingClientRect.apply'),
          map.get('Element.prototype.scrollBy.apply'),
          map.get('Element.prototype.scrollTo.apply'),
          map.get('Element.prototype.scrollIntoView.apply'),
          // Element set:
          map.get('Element.prototype.innerHTML.set'),
          map.get('Element.prototype.outerHTML.set'),
          map.get('Element.prototype.scrollTop.set'),
          map.get('Element.prototype.scrollLeft.set'),
          map.get('Element.prototype.slot.set'),
          // Element get:
          map.get('Element.prototype.scrollTop.get'),
          map.get('Element.prototype.scrollLeft.get'),
          map.get('Element.prototype.computedRole.get'),
          map.get('Element.prototype.computedName.get'),
          map.get('Element.prototype.clientTop.get'),
          map.get('Element.prototype.clientLeft.get'),
          map.get('Element.prototype.clientBottom.get'),
          map.get('Element.prototype.clientRight.get'),
          map.get('Element.prototype.clientWidth.get'),
          map.get('Element.prototype.clientHeight.get'),
          map.get('Element.prototype.computedRole.get'),
          map.get('Element.prototype.computedName.get'),
          map.get('Element.prototype.innerText.get'),
          map.get('Element.prototype.clientTop.get'),
          map.get('Element.prototype.clientLeft.get'),
          map.get('Element.prototype.clientBottom.get'),
          map.get('Element.prototype.clientRight.get'),
          map.get('Element.prototype.clientWidth.get'),
          map.get('Element.prototype.clientHeight.get'),
          // HTMLElement apply:
          map.get('HTMLElement.prototype.focus.apply'),
          map.get('HTMLInputElement.prototype.select.apply'),
          map.get('HTMLTextAreaElement.prototype.select.apply'),
          // HTMLElement set:
          map.get('HTMLElement.prototype.innerText.set'),
          map.get('HTMLElement.prototype.outerText.set'),
          // HTMLElement get:
          map.get('HTMLElement.prototype.innerText.get'),
          map.get('HTMLElement.prototype.outerText.get'),
          map.get('HTMLElement.prototype.offsetTop.get'),
          map.get('HTMLElement.prototype.offsetLeft.get'),
          map.get('HTMLElement.prototype.offsetBottom.get'),
          map.get('HTMLElement.prototype.offsetRight.get'),
          map.get('HTMLElement.prototype.offsetWidth.get'),
          map.get('HTMLElement.prototype.offsetHeight.get'),
          map.get('HTMLElement.prototype.offsetParent.get'),
          map.get('HTMLElement.prototype.innerText.get'),

          //
          // Window
          //
          map.get('Window.prototype.scrollX.get'),
          map.get('Window.prototype.scrollY.get'),
          map.get('Window.prototype.innerWidth.get'),
          map.get('Window.prototype.innerHeight.get'),
          map.get('Window.prototype.getMatchedCSSRules.apply'),

          //
          // Document
          //
          map.get('Document.prototype.scrollingElement.get'),

          //
          // Events
          //
          map.get('MouseEvent.prototype.layerX.get'),
          map.get('MouseEvent.prototype.layerY.get'),
          map.get('MouseEvent.prototype.offsetX.get'),
          map.get('MouseEvent.prototype.offsetY.get'),

          //
          // Misc
          //
          map.get('Range.prototype.getClientRects.apply'),
          map.get('Range.prototype.getBoundingClientRect.apply'),
        ];
        // TODO(markdittmer): Audit missing data. Could be due to browser
        // implementation differences or APIs coming-and-going in the web
        // platform.

        // TODO(markdittmer): We should have a more elegant interface for
        // managing situations like this. Support for applying multiple Hooks
        // to the same property should resolve this and simplify other things
        // too.
        for (let i = 0; i < ret.length; i++) {
          for (let j = i + 1; j < ret.length; j++) {
            // Sometimes multiple methods get rolled into the same Hook.
            // E.g., property getter + setter installed as same Hook.
            // When this happens, just keep one.
            if (ret[i] === ret[j]) ret[j] = undefined;
          }
        }
        return ret.filter(
          // TODO(markdittmer): Audit missing data. Could be due to browser
          // implementation differences or APIs coming-and-going in the web
          // platform.
          pubHook => pubHook !== undefined
        );
      },
    },
  ],

  listeners: [
    // TODO(markdittmer): We should profile this flow. Since it's likely to be
    // hit often, sugar like creating an object to encapsulate each report may
    // need to be optimized out.
    function onGet(sub, topic, value) {
      this.reporter.report(sub.src, {topic, value});
    },
    function onSet(sub, topic, oldValue, newValue) {
      this.reporter.report(sub.src, {topic, oldValue, newValue});
    },
    function onApply(sub, topic, fn, impl, ...args) {
      this.reporter.report(sub.src, {topic, fn, impl, args});
    },
  ],
});
