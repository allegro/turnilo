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
import { isFunction } from "util";
import { clamp, classNames, getXFromEvent, getYFromEvent } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./resize-handle.scss";

export enum Direction { LEFT = "left", RIGHT = "right", TOP = "top", BOTTOM = "bottom" }

export interface ResizeHandleProps {
  direction: Direction;
  min: number;
  max: number;
  initialValue: number;
  onResize?: (newX: number) => void;
  onResizeEnd?: (newX: number) => void;
}

export interface ResizeHandleState {
  dragging?: boolean;
  currentValue?: number;
  anchor?: number;
}

export class ResizeHandle extends React.Component<ResizeHandleProps, ResizeHandleState> {

  state: ResizeHandleState = {};

  onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    window.addEventListener("mouseup", this.onGlobalMouseUp);
    window.addEventListener("mousemove", this.onGlobalMouseMove);

    const newX = this.state.currentValue;
    const eventX = this.getValue(event);

    this.setState({
      dragging: true,
      currentValue: newX,
      anchor: eventX - newX
    });

    event.preventDefault();
  }

  onGlobalMouseUp = () => {
    this.setState({
      dragging: false
    });
    window.removeEventListener("mouseup", this.onGlobalMouseUp);
    window.removeEventListener("mousemove", this.onGlobalMouseMove);

    if (isFunction(this.props.onResizeEnd)) {
      this.props.onResizeEnd(this.state.currentValue);
    }
  }

  onGlobalMouseMove = (event: MouseEvent) => {
    const { anchor } = this.state;
    const currentValue = this.constrainValue(this.getCoordinate(event) - anchor);
    this.setState({ currentValue });
    if (!!this.props.onResize) this.props.onResize(currentValue);
  }

  componentDidMount() {
    this.setState({
      currentValue: this.constrainValue(this.props.initialValue)
    });
  }

  private getValue(event: MouseEvent | React.MouseEvent<HTMLElement>): number {
    return this.constrainValue(this.getCoordinate(event));
  }

  private getCoordinate(event: MouseEvent | React.MouseEvent<HTMLElement>): number {
    switch (this.props.direction) {
      case Direction.LEFT:
        return getXFromEvent(event);
      case Direction.RIGHT:
        return window.innerWidth - getXFromEvent(event);
      case Direction.TOP:
        return getYFromEvent(event);
      case Direction.BOTTOM:
        return window.innerHeight - getYFromEvent(event);
    }
  }

  private constrainValue(value: number): number {
    return clamp(value, this.props.min, this.props.max);
  }

  render() {
    const { direction, children } = this.props;

    const style: React.CSSProperties = {
      [direction]: this.state.currentValue
    };

    return <div
      className={classNames("resize-handle", direction)}
      style={style}
      onMouseDown={this.onMouseDown}
    >
      {children === undefined ? <SvgIcon svg={require("../../icons/drag-handle.svg")} /> : children}
    </div>;
  }
}
