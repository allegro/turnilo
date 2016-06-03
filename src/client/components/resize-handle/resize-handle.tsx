require('./resize-handle.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { clamp } from '../../utils/dom/dom';

import { SvgIcon } from '../svg-icon/svg-icon';
import { getXFromEvent } from '../../utils/dom/dom';


export interface ResizeHandleProps extends React.Props<any> {
  side: 'left' | 'right';
  min: number;
  max: number;
  initialValue: number;
  onResize?: (newX: number) => void;
  onResizeEnd?: (newX: number) => void;
}

export interface ResizeHandleState {
  dragging?: Boolean;

  startValue?: number;
  currentValue?: number;
  anchor?: number;
}

export class ResizeHandle extends React.Component<ResizeHandleProps, ResizeHandleState> {
  public mounted: boolean;

  private offset = 0;

  constructor() {
    super();

    this.state = {};

    this.onGlobalMouseUp = this.onGlobalMouseUp.bind(this);
    this.onGlobalMouseMove = this.onGlobalMouseMove.bind(this);
  }

  componentDidMount() {
    this.setState({
      currentValue: this.constrainValue(this.props.initialValue)
    });
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onMouseDown(event: MouseEvent) {
    window.addEventListener('mouseup', this.onGlobalMouseUp);
    window.addEventListener('mousemove', this.onGlobalMouseMove);

    var newX = this.state.currentValue;
    var eventX = this.getValueFromX(getXFromEvent(event));

    this.setState({
      dragging: true,
      startValue: newX,
      currentValue: newX,
      anchor: eventX - newX
    });

    event.preventDefault();
  }

  getValueFromX(x: number): number {
    if (this.props.side !== 'right') {
      return this.constrainValue(x);
    }

    return this.constrainValue(window.innerWidth - x);
  }

  constrainValue(value: number): number {
    return clamp(value, this.props.min, this.props.max);
  }

  onGlobalMouseMove(event: MouseEvent) {
    const { anchor } = this.state;

    let newX = this.getValueFromX(getXFromEvent(event)) - anchor;

    this.setState({
      currentValue: newX
    });

    if (!!this.props.onResize) {
      this.props.onResize(newX);
    }
  }

  onGlobalMouseUp(event: MouseEvent) {
    this.setState({
      dragging: false
    });
    window.removeEventListener('mouseup', this.onGlobalMouseUp);
    window.removeEventListener('mousemove', this.onGlobalMouseMove);

    if (!!this.props.onResizeEnd) {
      this.props.onResizeEnd(this.state.currentValue);
    }
  }


  render() {
    let { side } = this.props;

    let style: React.CSSProperties = {};
    style[side] = this.state.currentValue ;

    let className = 'resize-handle ' + side;

    return <div
      className={className}
      style={style}
      onMouseDown={this.onMouseDown.bind(this)}
    >
      <SvgIcon svg={require('../../icons/drag-handle.svg')}/>
    </div>;
  }
}
