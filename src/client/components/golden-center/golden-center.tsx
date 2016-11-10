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

require('./golden-center.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface GoldenCenterProps extends React.Props<any> {
  topRatio?: number;
  minPadding?: number;
}

export interface GoldenCenterState {
  top?: number;
}

export class GoldenCenter extends React.Component<GoldenCenterProps, GoldenCenterState> {
  static defaultProps = {
    topRatio: 0.618 / 1.618,
    minPadding: 50
  };

  constructor() {
    super();
    this.state = {
      top: 0
    };

    this.globalResizeListener = this.globalResizeListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.globalResizeListener);
  }

  globalResizeListener() {
    var myNode = ReactDOM.findDOMNode(this);
    if (!myNode) return;

    var childNode = myNode.firstChild as Element;
    if (!childNode) return;

    var myRect = myNode.getBoundingClientRect();
    var childRect = childNode.getBoundingClientRect();

    const { topRatio, minPadding } = this.props;

    var top = Math.max((myRect.height - childRect.height) * topRatio, minPadding);
    this.setState({ top });
  }

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
