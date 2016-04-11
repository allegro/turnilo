require('./scroller.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Fn } from "../../../common/utils/general/general";

export interface ScrollerProps extends React.Props<any> {
  onScroll: Fn;
  style?: Lookup<any>;
  ref?: string;
  className?: string;
  onMouseLeave?: Fn;
  onMouseMove?: Fn;
  onClick?: Fn;
}

export interface ScrollerState {
  scrollLeft: number;
  scrollTop: number;
}

export class Scroller extends React.Component<ScrollerProps, ScrollerState> {

  constructor() {
    super();
    this.state = {
      scrollLeft: 0,
      scrollTop: 0
    };
  }

  render() {
    const { style, onScroll, onMouseLeave, onMouseMove, onClick } = this.props;
    return <div
      className="scroller"
      ref="base"
      onScroll={onScroll}
      onMouseLeave={onMouseLeave || null}
      onMouseMove={onMouseMove || null}
      onClick={onClick || null}
    >
      <div className="scroller-inner" style={style}></div>
    </div>;
  }
}
