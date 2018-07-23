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
import { Stage } from "../../../common/models/index";
import { Fn } from "../../../common/utils/general/general";
import { clamp, classNames, escapeKey, isInside, uniqueId } from "../../utils/dom/dom";
import { BodyPortal } from "../body-portal/body-portal";
import { Shpitz } from "../shpitz/shpitz";
import "./bubble-menu.scss";

const OFFSET_H = 10;
const OFFSET_V = 0;
const SCREEN_OFFSET = 5;

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

interface PositionStyles {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  height?: number;
  width?: number;
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
  if (align === "center") {
    return left + width / 2;
  } else if (align === "start") {
    return left;
  } else { // align === 'end'
    return left + width;
  }
}

function alignHorizontalOutside(align: Align, x: number, width: number): number {
  if (align === "center") {
    return x - width / 2;
  } else if (align === "start") {
    return x;
  } else { // align === 'end'
    return x - width;
  }
}

export class BubbleMenu extends React.Component<BubbleMenuProps, BubbleMenuState> {
  static defaultProps: Partial<BubbleMenuProps> = {
    align: "center"
  };

  constructor(props: BubbleMenuProps) {
    super(props);
    this.state = {
      id: null
    };
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    const { alignOn, openOn, id } = this.props;
    const rect = (alignOn || openOn).getBoundingClientRect();

    this.setState({
      id: id || uniqueId("bubble-menu-"),
      ...this.calcBubbleCoordinates(rect)
    });
  }

  componentDidMount() {
    window.addEventListener("mousedown", this.globalMouseDownListener);
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.globalMouseDownListener);
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalMouseDownListener(e: MouseEvent) {
    const { onClose, openOn } = this.props;
    const { id } = this.state;
    // can not use ReactDOM.findDOMNode(this) because portal?
    const myElement = document.getElementById(id) as Element;
    if (!myElement) return;
    const target = e.target as Element;

    if (isInside(target, myElement) || isInside(target, openOn)) return;
    onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    const { onClose } = this.props;
    onClose();
  }

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

  private calcMenuCoordinates(): PositionStyles {
    const { align, direction, stage } = this.props;
    const { x, y } = this.state;
    const { height, width } = stage;
    const container = this.props.containerStage || defaultStage();
    switch (direction) {
      case "right":
        const top = clamp(y - height / 2, container.y, container.y + container.height - height);
        return {
          top,
          height,
          left: x
        };
      case "down": {
        const left = clamp(alignHorizontalOutside(align, x, width), container.x, container.x + container.width - width);
        return {
          left,
          width,
          top: y
        };
      }
      case "up": {
        const left = clamp(alignHorizontalOutside(align, x, width), container.x, container.x + container.width - width);
        return {
          left,
          width,
          bottom: y
        };
      }

      default:
        throw new Error(`unknown direction: '${direction}'`);
    }
  }

  private calcShpitzCoordinates(menuStyle: PositionStyles): PositionStyles {
    const { y, x } = this.state;
    const { direction } = this.props;
    const { top, left } = menuStyle;

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

    const menuCoordinates = this.calcMenuCoordinates();

    const hasShpitz = align === "center";
    const shpitzCoordinates = hasShpitz && this.calcShpitzCoordinates(menuCoordinates);

    const { left, top, bottom, height, width } = menuCoordinates;
    const menuSize = fixedSize ? { width: stage.width, height: stage.height } : { height, width };

    const myClass = classNames("bubble-menu", direction, className, { mini: layout === "mini" });

    return <BodyPortal left={left} top={top} bottom={bottom}>
      <div className={myClass} id={id} data-parent={insideId} style={menuSize}>
        {children}
        {hasShpitz && <Shpitz style={shpitzCoordinates} direction={direction}/>}
      </div>
    </BodyPortal>;
  }
}
