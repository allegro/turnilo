/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-dom/test-utils";
import { BodyPortal } from "../../components/body-portal/body-portal";

export function findDOMNode(element: React.Component<any, any> | Element): Element {
  const portal: any = TestUtils.scryRenderedComponentsWithType(element as React.Component, BodyPortal)[0];
  return portal ? portal.target.childNodes[0] : ReactDOM.findDOMNode(element) as Element;
}
