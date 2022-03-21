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
import * as ReactDOM from "react-dom";
import { Unary } from "../../../common/utils/functional/functional";

interface Context {
  node?: Element;
  notify?: Unary<Element, void>;
}

interface SourceState {
  node: Element;
}

interface Teleporter {
  Source: typeof React.Component;
  Target: React.FunctionComponent<{}>;
}

export function createTeleporter(): Teleporter {
  const context: Context = {};

  function saveTarget(node: HTMLDivElement) {
    context.node = node;
    if (context.notify) {
      context.notify(node);
    }
  }

  const Target: React.FunctionComponent<{}> = () => <div ref={saveTarget} />;

  class Source extends React.Component<{}, SourceState> {

    state: SourceState = { node: null };

    componentDidMount() {
      if (context.node) {
        this.setState({ node: context.node });
      }
      context.notify = (node: Element) => this.setState({ node });
    }

    componentWillUnmount() {
      context.notify = undefined;
    }

    render() {
      const { node } = this.state;
      if (!node) return null;
      return ReactDOM.createPortal(this.props.children, node);
    }
  }

  return { Source, Target };
}
