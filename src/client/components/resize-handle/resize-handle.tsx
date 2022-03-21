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
import { isFunction } from "util";
import { clamp, classNames, getXFromEvent, getYFromEvent } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./resize-handle.scss";

export enum Direction { LEFT = "left", RIGHT = "right", TOP = "top", BOTTOM = "bottom" }

export interface ResizeHandleProps {
  direction: Direction;
  min: number;
  max: number;
  value: number;
  onResize?: (newX: number) => void;
  onResizeEnd?: () => void;
}

export interface ResizeHandleState {
  anchor?: number;
}

export const DragHandle = () => <SvgIcon svg={require("../../icons/drag-handle.svg")} />;

export class ResizeHandle extends React.Component<ResizeHandleProps, ResizeHandleState> {

  state: ResizeHandleState = {};

  onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    window.addEventListener("mouseup", this.onGlobalMouseUp);
    window.addEventListener("mousemove", this.onGlobalMouseMove);

    const { value } = this.props;
    const eventX = this.getValue(event);

    this.setState({
      anchor: eventX - value
    });

    event.preventDefault();
  };

  onGlobalMouseUp = () => {
    window.removeEventListener("mouseup", this.onGlobalMouseUp);
    window.removeEventListener("mousemove", this.onGlobalMouseMove);

    if (isFunction(this.props.onResizeEnd)) {
      this.props.onResizeEnd();
    }
  };

  onGlobalMouseMove = (event: MouseEvent) => {
    const { anchor } = this.state;
    const currentValue = this.constrainValue(this.getCoordinate(event) - anchor);
    if (!!this.props.onResize) this.props.onResize(currentValue);
  };

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
    const { direction, children, value } = this.props;

    const style: React.CSSProperties = {
      [direction]: value
    };

    return <div
      className={classNames("resize-handle", direction)}
      style={style}
      onMouseDown={this.onMouseDown}
    >
      {children}
    </div>;
  }
}
