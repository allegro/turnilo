/*
 * Copyright 2017-2019 Allegro.pl
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

const div = document.createElement("div");
const dragDiv = "draggable" in div;
const evts = "ondragstart" in div && "ondrop" in div;

const needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);

if (needsPatch) {
  Promise.all([
    // @ts-ignore
    import(/* webpackChunkName: "dnd-js" */ "../../lib/polyfill/drag-drop-polyfill.min.js"),
    // @ts-ignore
    import(/* webpackChunkName: "dnd-css" */"../../lib/polyfill/drag-drop-polyfill.css")
  ]).then(([DragDropPolyfill, _]) => {
    DragDropPolyfill.Initialize({});
  });
}
