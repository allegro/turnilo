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
import { firstUp } from "../../../common/utils/string/string";
import { enterKey, escapeKey, leftKey, rightKey } from "../../utils/dom/dom";

export interface GlobalEventListenerProps {
  resize?: () => void;
  scroll?: (e: MouseEvent) => void;
  mouseDown?: (e: MouseEvent) => void;
  mouseMove?: (e: MouseEvent) => void;
  mouseUp?: (e: MouseEvent) => void;
  keyDown?: (e: KeyboardEvent) => void;
  enter?: (e: KeyboardEvent) => void;
  escape?: (e: KeyboardEvent) => void;
  right?: (e: KeyboardEvent) => void;
  left?: (e: KeyboardEvent) => void;
}

export interface GlobalEventListenerState {
}

export class GlobalEventListener extends React.Component<GlobalEventListenerProps, GlobalEventListenerState> {
  public mounted: boolean;
  private propsToEvents: any = {
    resize: "resize",
    scroll: "scroll",
    mouseDown: "mousedown",
    mouseMove: "mousemove",
    mouseUp: "mouseup",
    keyDown: "keydown",
    enter: "keydown",
    escape: "keydown",
    right: "keydown",
    left: "keydown"
  };

  UNSAFE_componentWillReceiveProps(nextProps: GlobalEventListenerProps) {
    this.refreshListeners(nextProps, this.props);
  }

  componentDidMount() {
    this.refreshListeners(this.props);
  }

  componentWillUnmount() {
    for (const prop in this.propsToEvents) {
      this.removeListener(this.propsToEvents[prop]);
    }
  }

  refreshListeners(nextProps: any, currentProps: any = {}) {
    const toAdd: string[] = [];
    const toRemove: string[] = [];

    for (const prop in this.propsToEvents) {
      const event = this.propsToEvents[prop];

      if (currentProps[prop] && nextProps[prop]) continue;

      if (nextProps[prop] && toAdd.indexOf(event) === -1) {
        toAdd.push(event);
      } else if (currentProps[prop] && toRemove.indexOf(event) === -1) {
        toRemove.push(event);
      }
    }

    toRemove.forEach(this.removeListener, this);
    toAdd.forEach(this.addListener, this);
  }

  addListener(event: string) {
    const useCapture = event === "scroll";
    window.addEventListener(event, (this as any)[`on${firstUp(event)}`], useCapture);
  }

  removeListener(event: string) {
    window.removeEventListener(event, (this as any)[`on${firstUp(event)}`]);
  }

  onResize = () => {
    if (this.props.resize) this.props.resize();
  };

  onScroll = (e: MouseEvent) => {
    if (this.props.scroll) this.props.scroll(e);
  };

  onMousedown = (e: MouseEvent) => {
    if (this.props.mouseDown) this.props.mouseDown(e);
  };

  onMousemove = (e: MouseEvent) => {
    if (this.props.mouseMove) this.props.mouseMove(e);
  };

  onMouseup = (e: MouseEvent) => {
    if (this.props.mouseUp) this.props.mouseUp(e);
  };

  onKeydown = (e: KeyboardEvent) => {
    if (this.props.escape && escapeKey(e)) this.props.escape(e);
    if (this.props.enter && enterKey(e)) this.props.enter(e);
    if (this.props.right && rightKey(e)) this.props.right(e);
    if (this.props.left && leftKey(e)) this.props.left(e);

    if (this.props.keyDown) this.props.keyDown(e);
  };

  render(): JSX.Element {
    return null;
  }
}
