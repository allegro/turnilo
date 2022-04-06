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
import { firstUp } from "../../../common/utils/string/string";
import { clamp, classNames, getXFromEvent, getYFromEvent } from "../../utils/dom/dom";
import "./scroller.scss";

export type XSide = "left" | "right";
export type YSide = "top" | "bottom";
export type ScrollerPart =
  "top-left-corner"
  | "top-gutter"
  | "top-right-corner"
  | "left-gutter"
  | "body"
  | "right-gutter"
  | "bottom-left-corner"
  | "bottom-gutter"
  | "bottom-right-corner";

export interface ScrollerLayout {
  bodyWidth: number;
  bodyHeight: number;

  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ScrollerProps {
  layout: ScrollerLayout;

  onClick?: (x: number, y: number, part: ScrollerPart) => void;
  onMouseMove?: (x: number, y: number, part: ScrollerPart) => void;
  onMouseLeave?: () => void;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  onViewportUpdate?: (stage: Stage) => void;

  // "Transcluded" elements
  topGutter?: JSX.Element | JSX.Element[];
  rightGutter?: JSX.Element | JSX.Element[];
  bottomGutter?: JSX.Element | JSX.Element[];
  leftGutter?: JSX.Element | JSX.Element[];
  topLeftCorner?: JSX.Element | JSX.Element[];
  topRightCorner?: JSX.Element | JSX.Element[];
  bottomRightCorner?: JSX.Element | JSX.Element[];
  bottomLeftCorner?: JSX.Element | JSX.Element[];
  body?: JSX.Element | JSX.Element[];
  overlay?: JSX.Element | JSX.Element[];
}

export interface ScrollerState {
  scrollTop?: number;
  scrollLeft?: number;

  viewportHeight?: number;
  viewportWidth?: number;
}

export class Scroller extends React.Component<ScrollerProps, ScrollerState> {
  static TOP_LEFT_CORNER: ScrollerPart = "top-left-corner";
  static TOP_GUTTER: ScrollerPart = "top-gutter";
  static TOP_RIGHT_CORNER: ScrollerPart = "top-right-corner";
  static LEFT_GUTTER: ScrollerPart = "left-gutter";
  static BODY: ScrollerPart = "body";
  static RIGHT_GUTTER: ScrollerPart = "right-gutter";
  static BOTTOM_LEFT_CORNER: ScrollerPart = "bottom-left-corner";
  static BOTTOM_GUTTER: ScrollerPart = "bottom-gutter";
  static BOTTOM_RIGHT_CORNER: ScrollerPart = "bottom-right-corner";

  static PARTS: ScrollerPart[][] = [
    [Scroller.TOP_LEFT_CORNER, Scroller.TOP_GUTTER, Scroller.TOP_RIGHT_CORNER],
    [Scroller.LEFT_GUTTER, Scroller.BODY, Scroller.RIGHT_GUTTER],
    [Scroller.BOTTOM_LEFT_CORNER, Scroller.BOTTOM_GUTTER, Scroller.BOTTOM_RIGHT_CORNER]
  ];

  // TODO: fix with React.forwardRef?
  public scroller = React.createRef<HTMLDivElement>();

  constructor(props: ScrollerProps) {
    super(props);
    this.state = {
      scrollTop: 0,
      scrollLeft: 0,
      viewportHeight: 0,
      viewportWidth: 0
    };
  }

  globalResizeListener = () => {
    this.updateViewport();
  };

  private getGutterStyle(side: XSide | YSide): React.CSSProperties {
    const { layout } = this.props;
    const { scrollLeft, scrollTop } = this.state;

    switch (side) {
      case "top":
        return {
          height: layout.top,
          left: layout.left - scrollLeft,
          right: layout.right
        };

      case "right":
        return {
          width: layout.right,
          right: 0,
          top: layout.top - scrollTop,
          bottom: layout.bottom
        };

      case "bottom":
        return {
          height: layout.bottom,
          left: layout.left - scrollLeft,
          right: layout.right,
          bottom: 0
        };

      case "left":
        return {
          width: layout.left,
          left: 0,
          top: layout.top - scrollTop,
          bottom: layout.bottom
        };

      default:
        throw new Error("Unknown side for gutter. This shouldn't happen.");
    }
  }

  private getCornerStyle(yPos: YSide, xPos: XSide): React.CSSProperties {
    const { layout } = this.props;

    var style: any = {};
    if (xPos === "left") {
      style.left = 0;
      style.width = layout.left;
    } else {
      style.right = 0;
      style.width = layout.right;
    }

    if (yPos === "top") {
      style.top = 0;
      style.height = layout.top;
    } else {
      style.height = layout.bottom;
      style.bottom = 0;
    }

    return style;
  }

  private getShadowStyle(side: XSide | YSide): React.CSSProperties {
    const { layout } = this.props;

    switch (side) {
      case "top":
        return { top: 0, height: layout.top, left: 0, right: 0 };

      case "right":
        return { width: layout.right, right: 0, top: 0, bottom: 0 };

      case "bottom":
        return { height: layout.bottom, bottom: 0, left: 0, right: 0 };

      case "left":
        return { width: layout.left, left: 0, top: 0, bottom: 0 };

      default:
        throw new Error("Unknown side for shadow. This shouldn't happen.");
    }
  }

  getBodyStyle(): React.CSSProperties {
    const { layout } = this.props;

    return {
      top: layout.top,
      right: layout.right,
      bottom: layout.bottom,
      left: layout.left
    };
  }

  getTargetStyle(): React.CSSProperties {
    const { layout } = this.props;

    return {
      width: layout.bodyWidth + layout.left + layout.right,
      height: layout.bodyHeight + layout.top + layout.bottom
    };
  }

  private onScroll = (e: React.UIEvent<HTMLElement>) => {
    const { onScroll, layout: { bodyHeight, bodyWidth } } = this.props;
    const { viewportWidth, viewportHeight } = this.state;
    const target = e.target as Element;
    console.log("scroll", target.scrollTop);

    const scrollLeft = clamp(target.scrollLeft, 0, Math.max(bodyWidth - viewportWidth, 0));
    const scrollTop = clamp(target.scrollTop, 0, Math.max(bodyHeight - viewportHeight, 0));

    this.setState({
      scrollTop,
      scrollLeft
    }, onScroll ? () => this.props.onScroll(scrollTop, scrollLeft) : undefined);
  };

  getRelativeMouseCoordinates(event: React.MouseEvent<HTMLElement>): { x: number, y: number, part: ScrollerPart } {
    const { top, left, bodyWidth, bodyHeight } = this.props.layout;
    const scroller = this.scroller.current;
    const { scrollLeft, scrollTop, viewportHeight, viewportWidth } = this.state;
    const rect = scroller.getBoundingClientRect();

    var i = 0;
    var j = 0;

    var x = getXFromEvent(event) - rect.left;
    var y = getYFromEvent(event) - rect.top;

    if (x > left && x <= left + viewportWidth) {
      j = 1;
      x += scrollLeft;
    } else if (x > left + viewportWidth) {
      j = 2;
      x += bodyWidth - viewportWidth;
    }

    if (y > top && y <= top + viewportHeight) {
      i = 1;
      y += scrollTop;
    } else if (y > top + viewportHeight) {
      i = 2;
      y += bodyHeight - viewportHeight;
    }

    return { x, y, part: Scroller.PARTS[i][j] };
  }

  onClick = (event: React.MouseEvent<HTMLElement>) => {
    if (this.props.onClick === undefined) return;

    const { x, y, part } = this.getRelativeMouseCoordinates(event);
    if (y < 0 || x < 0) return;

    this.props.onClick(x, y, part);
  };

  onMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (this.props.onMouseMove === undefined) return;

    const { x, y, part } = this.getRelativeMouseCoordinates(event);
    if (y < 0 || x < 0) return;

    this.props.onMouseMove(x, y, part);
  };

  renderGutter(side: XSide | YSide): JSX.Element {
    var element = (this.props as any)[`${side}Gutter`];
    if (!element) return null;

    return <div className={`${side}-gutter`} style={this.getGutterStyle(side)}>{element}</div>;
  }

  shouldHaveShadow(side: XSide | YSide): boolean {
    const { layout } = this.props;
    const { scrollLeft, scrollTop, viewportHeight, viewportWidth } = this.state;

    if (side === "top") return scrollTop > 0;
    if (side === "left") return scrollLeft > 0;
    if (side === "bottom") return layout.bodyHeight - scrollTop > viewportHeight;
    if (side === "right") return layout.bodyWidth - scrollLeft > viewportWidth;

    throw new Error("Unknown side for shadow : " + side);
  }

  renderShadow(side: XSide | YSide): JSX.Element {
    if (!(this.props.layout as any)[side]) return null; // no gutter ? no shadow.
    if (!this.shouldHaveShadow(side)) return null;

    return <div className={`${side}-shadow`} style={this.getShadowStyle(side)}/>;
  }

  renderCorner(yPos: YSide, xPos: XSide): JSX.Element {
    var style = this.getCornerStyle(yPos, xPos);
    var element = (this.props as any)[yPos + firstUp(xPos) + "Corner"];
    if (!element) return null;

    return <div className={[yPos, xPos, "corner"].join("-")} style={style}>{element}</div>;
  }

  componentDidMount() {
    window.addEventListener("resize", this.globalResizeListener);
    this.updateViewport();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.globalResizeListener);
  }

  componentDidUpdate() {
    this.updateViewport();
  }

  updateViewport() {
    const scroller = this.scroller.current;
    if (!scroller) return;

    const rect = scroller.getBoundingClientRect();
    const { top, right, bottom, left } = this.props.layout;

    const newHeight = rect.height - top - bottom;
    const newWidth = rect.width - left - right;

    if (this.state.viewportHeight !== newHeight || this.state.viewportWidth !== newWidth) {
      this.setState({ viewportHeight: newHeight, viewportWidth: newWidth });

      const { left: x, top: y } = rect;
      const { onViewportUpdate } = this.props;

      onViewportUpdate && onViewportUpdate(new Stage({ x, y, width: newWidth, height: newHeight }));
    }
  }

  render() {
    const { viewportWidth, viewportHeight } = this.state;
    const { body, overlay, onMouseLeave, layout } = this.props;

    if (!layout) return null;

    const { bodyWidth, bodyHeight } = layout;
    let blockHorizontalScroll = bodyWidth <= viewportWidth;
    let blockVerticalScroll = bodyHeight <= viewportHeight;

    const spacerClasses = classNames(
      "scroller-spacer",
      {
        "no-x-scroll": blockHorizontalScroll,
        "no-y-scroll": blockVerticalScroll
      }
    );

    const scrollerClasses = classNames(
      "scroller",
      {
        "has-top-shadow": this.shouldHaveShadow("top")
      }
    );

    return <div
      onClick={this.onClick}
      onMouseMove={this.onMouseMove}
      onMouseLeave={onMouseLeave || null}
      className={scrollerClasses}
      ref={this.scroller}
      onScroll={this.onScroll}
    >
      <div
        className={spacerClasses}
        style={this.getTargetStyle()}>
        <div className="body" style={this.getBodyStyle()}>{body}</div>

        {this.renderGutter("top")}
        {this.renderGutter("right")}
        {this.renderGutter("bottom")}
        {this.renderGutter("left")}

        {this.renderCorner("top", "left")}
        {this.renderCorner("top", "right")}
        {this.renderCorner("bottom", "left")}
        {this.renderCorner("bottom", "right")}

        {this.renderShadow("top")}
        {this.renderShadow("right")}
        {this.renderShadow("bottom")}
        {this.renderShadow("left")}

        {overlay ? <div className="overlay">{overlay}</div> : null}
      </div>
    </div>;
  }
}
