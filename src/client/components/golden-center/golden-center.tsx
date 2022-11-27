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

import React from "react";
import * as ReactDOM from "react-dom";
import "./golden-center.scss";

export interface GoldenCenterProps {
  topRatio?: number;
  minPadding?: number;
}

export interface GoldenCenterState {
  top?: number;
}

export class GoldenCenter extends React.Component<GoldenCenterProps, GoldenCenterState> {
  static defaultProps: Partial<GoldenCenterProps> = {
    topRatio: 0.618 / 1.618,
    minPadding: 50
  };

  state: GoldenCenterState = {
    top: 0
  };

  componentDidMount() {
    window.addEventListener("resize", this.globalResizeListener);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.globalResizeListener);
  }

  globalResizeListener = () => {
    const myNode = ReactDOM.findDOMNode(this) as Element;
    if (!myNode) return;

    const childNode = myNode.firstChild as Element;
    if (!childNode) return;

    const myRect = myNode.getBoundingClientRect();
    const childRect = childNode.getBoundingClientRect();

    const { topRatio, minPadding } = this.props;

    const top = Math.max((myRect.height - childRect.height) * topRatio, minPadding);
    this.setState({ top });
  };

  render() {
    const { minPadding, children } = this.props;
    const { top } = this.state;

    return <div
      className="golden-center"
      style={{ paddingTop: top, paddingBottom: minPadding }}
    >
      {React.Children.only(children)}
    </div>;
  }
}
