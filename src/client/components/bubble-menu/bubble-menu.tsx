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
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { clamp, classNames, escapeKey, isInside, uniqueId } from "../../utils/dom/dom";
import { BodyPortal } from "../body-portal/body-portal";
import { Shpitz } from "../shpitz/shpitz";
import "./bubble-menu.scss";

export const OFFSET_H = 10;
export const OFFSET_V = 0;
export const SCREEN_OFFSET = 5;

export type BubbleLayout = "normal" | "mini";
export type Align = "start" | "center" | "end";
export type Direction = "down" | "right" | "up";

export interface BubbleMenuProps {
  className: string;
  id?: string;
  direction: Direction;
  stage: Stage;
  fixedSize?: boolean;
  containerStage?: Stage;
  openOn: Element;
  alignOn?: Element;
  onClose: Fn;
  inside?: Element;
  layout?: BubbleLayout;
  align?: Align;
}

export interface BubbleMenuState {
  id?: string;
  x?: number;
  y?: number;
}

interface Coordinates {
  x: number;
  y: number;
}

interface PositionCSSProperties {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  height?: number;
  width?: number;
  maxWidth?: number;
  maxHeight?: number;
}

function defaultStage(): Stage {
  return new Stage({
    x: SCREEN_OFFSET,
    y: SCREEN_OFFSET,
    width: window.innerWidth - SCREEN_OFFSET * 2,
    height: window.innerHeight - SCREEN_OFFSET * 2
  });
}

function alignHorizontalInside(align: Align, { left, width }: ClientRect): number {
  switch (align) {
    case "center":
      return left + width / 2;
    case "start":
      return left;
    case"end":
      return left + width;
  }
}

function alignHorizontalOutside(align: Align, x: number, width: number): number {
  switch (align) {
    case "center":
      return x - width / 2;
    case "start":
      return x;
    case "end":
      return x - width;
  }
}

export class BubbleMenu extends React.Component<BubbleMenuProps, BubbleMenuState> {
  static defaultProps: Partial<BubbleMenuProps> = {
    align: "center"
  };

  state: BubbleMenuState = {
    id: null
  };

  componentDidMount() {
    const { alignOn, openOn, id } = this.props;
    const rect = (alignOn || openOn).getBoundingClientRect();

    this.setState({
      id: id || uniqueId("bubble-menu-"),
      ...this.calcBubbleCoordinates(rect)
    });
    window.addEventListener("mousedown", this.globalMouseDownListener);
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.globalMouseDownListener);
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalMouseDownListener = (e: MouseEvent) => {
    const { onClose, openOn } = this.props;
    const { id } = this.state;
    // can not use ReactDOM.findDOMNode(this) because portal?
    const myElement = document.getElementById(id) as Element;
    if (!myElement) return;
    const target = e.target as Element;

    if (isInside(target, myElement) || isInside(target, openOn)) return;
    onClose();
  };

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (!escapeKey(e)) return;
    const { onClose } = this.props;
    onClose();
  };

  private calcBubbleCoordinates(rect: ClientRect): Coordinates {
    const { direction, align } = this.props;
    switch (direction) {
      case "right":
        return {
          x: rect.left + rect.width - OFFSET_H,
          y: rect.top + rect.height / 2
        };

      case "down":
        return {
          x: alignHorizontalInside(align, rect),
          y: rect.top + rect.height - OFFSET_V
        };

      case "up":
        return {
          x: alignHorizontalInside(align, rect),
          y: window.innerHeight - rect.top - OFFSET_V
        };

      default:
        throw new Error(`unknown direction: '${direction}'`);
    }
  }

  private calcMenuPosition(): PositionCSSProperties {
    const { align, direction, stage, containerStage } = this.props;
    const { x: menuX, y: menuY } = this.state;
    const { height: menuHeight, width: menuWidth } = stage;

    const container = containerStage || defaultStage();
    const containerVerticalExtent = container.y + container.height - menuHeight;
    const containerHorizontalExtent = container.x + container.width - menuWidth;

    switch (direction) {
      case "right":
        const top = menuY - menuHeight / 2;
        const clampedTop = clamp(top, container.y, containerVerticalExtent);
        return {
          top: clampedTop,
          height: menuHeight,
          left: menuX,
          maxWidth: container.width
        };
      case "down": {
        const left = alignHorizontalOutside(align, menuX, menuWidth);
        const clampedLeft = clamp(left, container.x, containerHorizontalExtent);
        return {
          left: clampedLeft,
          width: menuWidth,
          top: menuY,
          maxHeight: container.height
        };
      }
      case "up": {
        const left = alignHorizontalOutside(align, menuX, menuWidth);
        const clampedLeft = clamp(left, container.x, containerHorizontalExtent);
        return {
          left: clampedLeft,
          width: menuWidth,
          bottom: menuY,
          maxHeight: container.height
        };
      }

      default:
        throw new Error(`unknown direction: '${direction}'`);
    }
  }

  private calcShpitzPosition(menuStyle: PositionCSSProperties): PositionCSSProperties {
    const { x, y } = this.state;
    const { direction } = this.props;
    const { left, top } = menuStyle;

    switch (direction) {
      case "right":
        return {
          top: y - top,
          left: 0
        };

      case "down":
        return {
          left: x - left,
          top: 0
        };

      case "up":
        return {
          left: x - left,
          bottom: 0
        };

      default:
        throw new Error(`unknown direction: '${direction}'`);
    }
  }

  getInsideId(): string | null {
    const { inside } = this.props;
    if (!inside) return null;
    if (!inside.id) throw new Error("inside element must have id");
    return inside.id;
  }

  render(): any {
    const { className, direction, stage, fixedSize, layout, align, children } = this.props;
    const { id } = this.state;
    const insideId = this.getInsideId();

    const menuCoordinates = this.calcMenuPosition();

    const hasShpitz = align === "center";
    const shpitzCoordinates = hasShpitz && this.calcShpitzPosition(menuCoordinates);

    const { maxHeight, maxWidth, left, top, bottom, height, width } = menuCoordinates;
    const menuSize = fixedSize ? { width: stage.width, height: stage.height } : { maxHeight, maxWidth, height, width };

    const myClass = classNames("bubble-menu", direction, className, { mini: layout === "mini" });

    return <BodyPortal left={left} top={top} bottom={bottom}>
      <div className={myClass} id={id} data-parent={insideId} style={menuSize}>
        {children}
        {hasShpitz && <Shpitz style={shpitzCoordinates} direction={direction} />}
      </div>
    </BodyPortal>;
  }
}
