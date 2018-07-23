/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import * as ReactDOM from "react-dom";
import "./body-portal.scss";

export interface BodyPortalProps {
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
  fullSize?: boolean;
  disablePointerEvents?: boolean;
  onMount?: () => void;
  isAboveAll?: boolean;
}

export interface BodyPortalState {
}

export class BodyPortal extends React.Component<BodyPortalProps, BodyPortalState> {
  public static defaultProps: Partial<BodyPortalProps> = {
    disablePointerEvents: false,
    isAboveAll: false
  };

  private static aboveAll: any;

  private _target: any = null; // HTMLElement, a div that is appended to the body
  private _component: Element = null; // ReactElement, which is mounted on the target

  public get component() {
    return this._component;
  }

  public get target() {
    return this._target;
  }

  normalizeDimension(dimension: number | string): string | undefined {
    if (typeof dimension === "number") {
      return Math.round(dimension) + "px";
    }
    if (typeof dimension === "string") {
      return dimension;
    }
    return undefined;
  }

  updateStyle() {
    const { left, top, bottom, right, disablePointerEvents, isAboveAll } = this.props;
    let style = this._target.style;
    style.top = this.normalizeDimension(top);
    style.bottom = this.normalizeDimension(bottom);
    style.left = this.normalizeDimension(left);
    style.right = this.normalizeDimension(right);
    style["z-index"] = 200 + (isAboveAll ? 1 : 0);

    style["pointer-events"] = disablePointerEvents ? "none" : "auto";
  }

  componentDidMount() {
    this.teleport();

    const { onMount, isAboveAll } = this.props;

    if (onMount) onMount();

    if (isAboveAll) {
      if (BodyPortal.aboveAll) throw new Error("There can be only one");
      BodyPortal.aboveAll = this;
    }
  }

  teleport() {
    var { fullSize } = this.props;
    var newDiv = document.createElement("div");
    newDiv.className = "body-portal" + (fullSize ? " full-size" : "");
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

    if (BodyPortal.aboveAll === this) BodyPortal.aboveAll = undefined;
  }

  render(): React.ReactElement<BodyPortalProps> {
    return null;
  }
}
