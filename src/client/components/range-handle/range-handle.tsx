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
import { clamp, classNames, getXFromEvent } from "../../utils/dom/dom";
import "./range-handle.scss";

export interface RangeHandleProps {
  positionLeft: number;
  onChange: (x: number) => void;
  offset: number;
  isAny: boolean;
  isBeyondMin?: boolean;
  isBeyondMax?: boolean;
  rightBound?: number;
  leftBound?: number;
}

export interface RangeHandleState {
  anchor: number;
}

export class RangeHandle extends React.Component<RangeHandleProps, RangeHandleState> {
  public mounted: boolean;

  state: RangeHandleState = {
    anchor: null
  };

  onGlobalMouseMove = (event: MouseEvent) => {
    const { onChange, leftBound, rightBound } = this.props;
    const { anchor } = this.state;
    const newX = getXFromEvent(event) - anchor;

    onChange(clamp(newX, leftBound, rightBound));
  };

  onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    const { offset, positionLeft } = this.props;

    const x = getXFromEvent(event);
    const anchor = x - offset - positionLeft;

    this.setState({
      anchor
    });

    event.preventDefault();
    window.addEventListener("mouseup", this.onGlobalMouseUp);
    window.addEventListener("mousemove", this.onGlobalMouseMove);
  };

  onGlobalMouseUp = () => {
    window.removeEventListener("mouseup", this.onGlobalMouseUp);
    window.removeEventListener("mousemove", this.onGlobalMouseMove);
  };

  render() {
    const { positionLeft, isAny, isBeyondMin, isBeyondMax } = this.props;

    const style = { left: positionLeft };

    return <div
      className={classNames("range-handle", { "empty": isAny, "beyond min": isBeyondMin, "beyond max": isBeyondMax })}
      style={style}
      onMouseDown={this.onMouseDown}
    />;
  }
}
