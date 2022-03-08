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
import { Unary } from "../../../common/utils/functional/functional";

interface WithRefProps {
  children: Unary<{ ref?: Element, setRef: Unary<Element, void> }, JSX.Element>;
}

interface WithRefState {
  ref?: Element;
}

export class WithRef extends React.Component<WithRefProps, WithRefState> {
  state: WithRefState = {};

  setRef = (ref: Element) => this.setState({ ref });

  render() {
    const setRef = this.setRef;
    const { ref } = this.state;
    return this.props.children({ ref, setRef });
  }
}
