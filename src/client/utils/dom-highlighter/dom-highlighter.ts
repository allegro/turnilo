/*
 * Copyright 2015-2016 Imply Data, Inc.
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

export class DOMHighlighter {
  private static timeoutsForElements: any = {};

  private static select(selector: string): HTMLElement {
    var bits = selector.split(/\s+/);
    var element: any = document;
    var bit: string;

    while (bits.length && element) {
      bit = bits.shift().replace(/^\./, '').replace(/\./, ' ');
      element = element.getElementsByClassName(bit)[0];
    }

    if (!element || element === document) {
      console.warn(`Selector '${selector}' returned no element in DOMHighlighter`);
      return null;
    }

    return element;
  }

  public static highlight(selector: string) {
    var element = this.select(selector);
    if (!element) return;

    element.classList.add('dom-highlighter-on');
  }

  public static unhighlight(selector: string) {
    var element = this.select(selector);
    if (!element) return;

    element.classList.remove('dom-highlighter-on');
  }

  public static wiggle(selector: string) {
    var element = this.select(selector);
    if (!element) return;

    element.classList.add('dom-highlighter-wiggle');

    window.setTimeout(() => {
      element.classList.remove('dom-highlighter-wiggle');
    }, 1000);
  }
}
