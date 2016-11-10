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

import * as jsdom from 'jsdom';
var kickstart = () => {
  let g: any = <any>global;
  let document = jsdom.jsdom('<!doctype html><html><body></body></html>');
  g.document = document;
  g.window = (<any>document).defaultView;
  g.navigator = {
    userAgent: 'testing'
  };
};

var cleanup = () => {
  let g: any = <any>global;
  delete g.document;
  delete g.window;
  delete g.navigator;
};


// Initial kickstart is neede because of required modules
// (FileSaver, I'm looking at you)
kickstart();

beforeEach(kickstart);
afterEach(cleanup);

