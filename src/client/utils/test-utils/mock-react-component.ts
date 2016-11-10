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

import * as React from 'react';

export function mockReactComponent(_class: any) {
  let prototype = _class.prototype;
  let toUndo: (() => void)[] = [];

  if (prototype.hasOwnProperty('componentDidMount') === true) {
    let oldComponentDidMount = prototype.componentDidMount;
    toUndo.push(() => {
      prototype.componentDidMount = oldComponentDidMount;
    });
    prototype.componentDidMount = () => {};
  }

  if (prototype.hasOwnProperty('render') === true) {
    let oldRender = prototype.render;
    toUndo.push(() => {
      prototype.render = oldRender;
    });

    prototype.render = (): any => { return null; };
  }

  _class.restore = function() {
    toUndo.map((fn: any) => fn());
    delete this.restore;
  };
}
