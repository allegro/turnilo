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

import React from "react";
import * as TestUtils from "react-dom/test-utils";

// TODO: remove when included in official @types/react-dom package
//
// This wrapper is needed for correct type inference
// Current @types/react-dom declare wrong (IMHO) return type which includes void
export function renderIntoDocument<P>(element: React.ReactElement<P>): React.Component<P> | Element {
  return TestUtils.renderIntoDocument(element) as React.Component<P> | Element;
}
