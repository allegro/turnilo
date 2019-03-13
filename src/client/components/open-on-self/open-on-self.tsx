/*
 * Copyright 2017-2018 Allegro.pl
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
import { Unary } from "../../../common/utils/functional/functional";

interface OpenOnSelfProps {
  open: boolean;
  children: Unary<{ element?: Element, setRef: Unary<Element, void> }, JSX.Element>;
}

interface OpenOnSelfState {
  element?: Element;
}

export class OpenOnSelf extends React.Component<OpenOnSelfProps, OpenOnSelfState> {
  private reference?: Element = null;

  state: OpenOnSelfState = {};

  setItemReference = (element: Element) => {
    this.reference = element;
  }

  componentDidUpdate() {
    this.setOpenOnReference();
  }

  componentDidMount() {
    this.setOpenOnReference();
  }

  private setOpenOnReference() {
    if (this.props.open && !this.state.element) {
      const element = this.reference;
      this.setState({ element });
    }
  }

  render() {
    const setRef = this.setItemReference;
    const { element } = this.state;
    return this.props.children({ element, setRef });
  }
}
