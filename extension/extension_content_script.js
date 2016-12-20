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

var files = [];
function load(path) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('error', error => {
    throw error;
  });
  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      files.push(xhr.responseText);
    } else {
      throw xhr.statusText;
    }
  });
  xhr.open('GET', chrome.extension.getURL(path), false);
  xhr.send();
}

load('bundle/foam-bin.bundle.js');
load('bundle/vendors.bundle.js');
load('bundle/extension_content_script.es6.bundle.js');

var head = document.createElement('head');
var script = document.createElement('script');
script.setAttribute('language', 'javascript');
script.textContent = files.join('\n');
head.appendChild(script);
document.documentElement.appendChild(head);
