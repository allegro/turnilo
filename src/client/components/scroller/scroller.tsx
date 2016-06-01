require('./scroller.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { clamp, classNames, getXFromEvent, getYFromEvent } from '../../utils/dom/dom';
import { firstUp } from '../../utils/string/string';

export type XSide = 'left' | 'right';
export type YSide = 'top' | 'bottom';

export interface ScrollerLayout {
  bodyWidth: number;
  bodyHeight: number;

  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ScrollerProps extends React.Props<any> {
  layout: ScrollerLayout;

  onClick?: (x: number, y: number) => void;
  onMouseMove?: (x: number, y: number) => void;
  onMouseLeave?: () => void;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;

  // "Transcluded" elements
  topGutter?: JSX.Element | JSX.Element[];
  rightGutter?: JSX.Element | JSX.Element[];
  bottomGutter?: JSX.Element | JSX.Element[];
  leftGutter?: JSX.Element | JSX.Element[];
  topLeftCorner?: JSX.Element | JSX.Element[];
  topRightCorner?: JSX.Element | JSX.Element[];
  bottomRightCorner?: JSX.Element | JSX.Element[];
  bottomLeftCorner?: JSX.Element | JSX.Element[];
  body?: JSX.Element[];
  overlay?: JSX.Element | JSX.Element[];
}

export interface ScrollerState {
  scrollTop?: number;
  scrollLeft?: number;

  viewportHeight?: number;
  viewportWidth?: number;
}

export class Scroller extends React.Component<ScrollerProps, ScrollerState> {
  constructor() {
    super();
    this.state = {
      scrollTop: 0,
      scrollLeft: 0,
      viewportHeight: 0,
      viewportWidth: 0
    };
  }

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
    if (xPos === 'left') {
      style.left = 0;
      style.width = layout.left;
    } else {
      style.right = 0;
      style.width = layout.right;
    }

    if (yPos === 'top') {
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
        return {top: 0, height: layout.top, left: 0, right: 0};

      case "right":
        return {width: layout.right, right: 0, top: 0, bottom: 0};

      case "bottom":
        return {height: layout.bottom, bottom: 0, left: 0, right: 0};

      case "left":
        return {width: layout.left, left: 0, top: 0, bottom: 0};

      default:
        throw new Error("Unknown side for shadow. This shouldn't happen.");
    }
  }

  getBodyStyle(): React.CSSProperties {
    const { layout } = this.props;
    const { scrollTop, scrollLeft } = this.state;

    return {
      top: layout.top - scrollTop,
      right: layout.right,
      bottom: layout.bottom,
      left: layout.left - scrollLeft
    };
  }

  getTargetStyle(): React.CSSProperties {
    const { layout } = this.props;

    return {
      width: layout.bodyWidth + layout.left + layout.right,
      height: layout.bodyHeight + layout.top + layout.bottom
    };
  }

  private getDOMElement(refName: string): any {
    return ReactDOM.findDOMNode(this.refs[refName]) as any;
  }

  private onScroll(e: UIEvent) {
    const { bodyWidth, bodyHeight } = this.props.layout;
    const { viewportWidth, viewportHeight } = this.state;
    var target = e.target as Element;
​
    var scrollLeft = clamp(target.scrollLeft, 0, Math.max(bodyWidth - viewportWidth, 0));
    var scrollTop = clamp(target.scrollTop, 0, Math.max(bodyHeight - viewportHeight, 0));
​
    if (this.props.onScroll !== undefined) {
      this.setState({
        scrollTop,
        scrollLeft
      }, () => this.props.onScroll(scrollTop, scrollLeft));
    } else {
      this.setState({
        scrollTop,
        scrollLeft
      });
    }
  }

  getRelativeMouseCoordinates(event: MouseEvent): {x: number, y: number} {
    const { top, left, bodyWidth, bodyHeight } = this.props.layout;
    const container = this.getDOMElement('eventContainer');
    const { scrollLeft, scrollTop, viewportHeight, viewportWidth } = this.state;
    const rect = container.getBoundingClientRect();

    var x = getXFromEvent(event) - rect.left;
    var y = getYFromEvent(event) - rect.top;

    if (x > left && x <= left + viewportWidth) {
      x += scrollLeft;
    } else if (x > left + viewportWidth) {
      x += bodyWidth - viewportWidth;
    }

    if (y > top && y <= top + viewportHeight) {
      y += scrollTop;
    } else if (y > top + viewportHeight) {
      y += bodyHeight - viewportHeight;
    }

    return {x, y};
  }

  onClick(event: MouseEvent) {
    if (this.props.onClick === undefined) return;

    const { x, y } = this.getRelativeMouseCoordinates(event);

    this.props.onClick(x, y);
  }

  onMouseMove(event: MouseEvent) {
    if (this.props.onMouseMove === undefined) return;

    const { x, y } = this.getRelativeMouseCoordinates(event);

    this.props.onMouseMove(x, y);
  }

  renderGutter(side: XSide | YSide): JSX.Element {
    var element = (this.props as any)[`${side}Gutter`];
    if (!element) return null;

    return <div className={`${side}-gutter`} style={this.getGutterStyle(side)}>{element}</div>;
  }

  shouldHaveShadow(side: XSide | YSide): boolean {
    const { layout } = this.props;
    const { scrollLeft, scrollTop, viewportHeight, viewportWidth } = this.state;

    if (side === 'top') return scrollTop > 0;
    if (side === 'left') return scrollLeft > 0;
    if (side === 'bottom') return layout.bodyHeight - scrollTop > viewportHeight;
    if (side === 'right') return layout.bodyWidth - scrollLeft > viewportWidth;

    throw new Error('Unknown side for shadow : ' + side);
  }

  renderShadow(side: XSide | YSide): JSX.Element {
    if (!(this.props.layout as any)[side]) return null; // no gutter ? no shadow.
    if (!this.shouldHaveShadow(side)) return null;

    return <div className={`${side}-shadow`} style={this.getShadowStyle(side)}/>;
  }

  renderCorner(yPos: YSide, xPos: XSide): JSX.Element {
    var style = this.getCornerStyle(yPos, xPos);
    var element = (this.props as any)[yPos + firstUp(xPos) + 'Corner'];
    if (!element) return null;

    return <div className={[yPos, xPos, 'corner'].join('-')} style={style}>{element}</div>;
  }

  componentDidUpdate() {
    const rect = this.getDOMElement('Scroller').getBoundingClientRect();
    const { top, right, bottom, left } = this.props.layout;

    const newHeight = rect.height - top - bottom;
    const newWidth = rect.width - left - right;

    if (this.state.viewportHeight !== newHeight || this.state.viewportWidth !== newWidth) {
      this.setState({viewportHeight: newHeight, viewportWidth: newWidth});
    }
  }

  render() {
    const { viewportWidth, viewportHeight } = this.state;
    const { body, overlay, onMouseLeave, layout } = this.props;

    if (!layout) return null;

    const { bodyWidth, bodyHeight } = layout;
    let blockHorizontalScroll = bodyWidth <= viewportWidth;
    let blockVerticalScroll = bodyHeight <= viewportHeight;

    return <div className="scroller" ref="Scroller">

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

      { overlay ? <div className="overlay">{overlay}</div> : null }

      <div
        className={classNames('event-container', {'no-x-scroll': blockHorizontalScroll, 'no-y-scroll': blockVerticalScroll})}
        ref="eventContainer"
        onScroll={this.onScroll.bind(this)}
        onClick={this.onClick.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseLeave={onMouseLeave || null}
       >
        <div className="event-target" style={this.getTargetStyle()}/>
      </div>

    </div>;
  }
}
