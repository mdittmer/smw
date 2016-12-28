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

require('../Installable.es6.js');
require('./ThresholdReporter.es6.js');

// TODO(markdittmer): It would be nice to use foam.util.Timer so long as it's
// sufficiently configurable.
foam.CLASS({
  package: 'tools.web.strict',
  name: 'FrameTimeout',
  extends: 'tools.web.strict.Timeout',

  listeners: [
    // TODO(markdittmer): Use a framed listener?
    function tick() {
      if (!this.installed) return;

      this.pub(this.PUB_TOPIC);
      requestAnimationFrame(this.tick);
    },
  ],
});

foam.CLASS({
  package: 'tools.web.strict',
  name: 'FramedThresholdReporter',

  extends: 'tools.web.strict.ThresholdReporter',
  requires: ['tools.web.strict.FrameTimeout'],

  constants: {
    pubTopic: 'ADVISE',
    timeoutTopic: 'TIMED_OUT',
  },

  properties: [
    {
      name: 'timeout',
      factory: function() {
        return this.FrameTimeout.create();
      },
    },
  ],

  // TODO(markdittmer): Confirm: Listeners inherited?
});
