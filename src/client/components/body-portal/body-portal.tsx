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

require('./body-portal.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface BodyPortalProps extends React.Props<any> {
  left?: number | string;
  top?: number | string;
  fullSize?: boolean;
  disablePointerEvents?: boolean;
}

export interface BodyPortalState {
}

export class BodyPortal extends React.Component<BodyPortalProps, BodyPortalState> {
  private _target: any = null; // HTMLElement, a div that is appended to the body
  private _component: React.DOMComponent<any> = null; // ReactElement, which is mounted on the target

  constructor() {
    super();
  }

  public get component() {
    return this._component;
  }

  public get target() {
    return this._target;
  }

  updateStyle() {
    var { left, top, disablePointerEvents } = this.props;
    var style = this._target.style;

    if (typeof left === 'number') {
      style.left = Math.round(left) + 'px';
    } else if (typeof left === 'string') {
      style.left = left;
    }
    if (typeof top === 'number') {
      style.top = Math.round(top) + 'px';
    } else if (typeof top === 'string') {
      style.top = top;
    }
    style['z-index'] = disablePointerEvents ? 200 : 201;
    style['pointer-events'] = disablePointerEvents ? 'none' : 'auto';
  }

  componentDidMount() {
    this.teleport();
  }

  teleport() {
    var { fullSize } = this.props;
    var newDiv = document.createElement('div');
    newDiv.className = 'body-portal' + (fullSize ? ' full-size' : '');
    this._target = document.body.appendChild(newDiv);
    this.updateStyle();
    this._component = ReactDOM.render(React.Children.only(this.props.children) as any, this._target);
  }

  componentDidUpdate() {
    this.updateStyle();
    this._component = ReactDOM.render(React.Children.only(this.props.children) as any, this._target);
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this._target);
    document.body.removeChild(this._target);
  }

  render(): React.ReactElement<BodyPortalProps> {
    return null;
  }
}
