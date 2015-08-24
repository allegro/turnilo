'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { Timezone, Duration } from 'chronology';
import { $, Expression, Executor, Dataset, TimeRange } from 'plywood';
import { Clicker, Filter, Dimension, Measure } from '../../models/index';
import { isInside, escapeKey } from '../../utils/dom';
// import { SomeComp } from '../some-comp/some-comp';

interface HighlighterProps {
  clicker: Clicker;
  scaleX: any;
  dragStart: number;
  duration: Duration;
  timezone: Timezone;
  onHighlightEnd: Function;
}

interface HighlighterState {
  highlight?: TimeRange;
  dragging?: boolean;
}

export class Highlighter extends React.Component<HighlighterProps, HighlighterState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      highlight: null,
      dragging: true
    };

    this.globalMouseMoveListener = this.globalMouseMoveListener.bind(this);
    this.globalMouseUpListener = this.globalMouseUpListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    window.addEventListener('mousemove', this.globalMouseMoveListener);
    window.addEventListener('mouseup', this.globalMouseUpListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('mousemove', this.globalMouseMoveListener);
    window.removeEventListener('mouseup', this.globalMouseUpListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  getHighlight(eventX: number): TimeRange {
    var { dragStart, scaleX } = this.props;
    var myDOM = React.findDOMNode(this);
    var d1 = scaleX.invert(dragStart);
    var d2 = scaleX.invert(eventX - myDOM.getBoundingClientRect().left);

    if (d1 < d2) {
      return TimeRange.fromJS({ start: d1, end: d2 });
    } else {
      return TimeRange.fromJS({ start: d2, end: d1 });
    }
  }

  globalMouseMoveListener(e: MouseEvent) {
    var { dragging } = this.state;
    if (!dragging) return;
    this.setState({
      highlight: this.getHighlight(e.clientX)
    });
  }

  globalMouseUpListener(e: MouseEvent) {
    var { duration, timezone } = this.props;
    var { dragging, highlight } = this.state;
    if (!dragging) return;
    if (!highlight) { // There was no mouse move so just quetly cancel out
      this.onCancel();
      return;
    }

    highlight = this.getHighlight(e.clientX);
    this.setState({
      dragging: false,
      highlight: TimeRange.fromJS({
        start: duration.floor(highlight.start, timezone),
        end: duration.move(duration.floor(highlight.end, timezone), timezone, 1)
      })
    });
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onHighlightEnd } = this.props;
    onHighlightEnd();
  }

  onAccept() {
    var { onHighlightEnd, clicker } = this.props;
    var { highlight } = this.state;
    clicker.changeTimeRange(highlight);
    onHighlightEnd();
  }

  onCancel() {
    var { onHighlightEnd } = this.props;
    onHighlightEnd();
  }

  render() {
    var { scaleX } = this.props;
    var { highlight, dragging } = this.state;

    if (!highlight) {
      return JSX(`<div className="highlighter"></div>`);
    }

    var buttonBar: React.DOMElement<any> = null;
    if (!dragging) {
      buttonBar = JSX(`
        <div className="button-bar">
          <div className="button accept" onClick={this.onAccept.bind(this)}>
            <Icon name="check"/>
          </div>
          <div className="button cancel" onClick={this.onCancel.bind(this)}>
            <Icon name="x"/>
          </div>
        </div>
      `);
    }

    var startPos = scaleX(highlight.start);
    var endPos = scaleX(highlight.end);

    var whiteoutLeftStyle = {
      width: startPos
    };

    var frameStyle = {
      left: startPos,
      width: endPos - startPos
    };

    var whiteoutRightStyle = {
      left: endPos
    };

    return JSX(`
      <div className={'highlighter ' + (dragging ? 'dragging' : 'confirm')}>
        <div className="whiteout left" style={whiteoutLeftStyle}></div>
        <div className="frame" style={frameStyle}>{buttonBar}</div>
        <div className="whiteout right" style={whiteoutRightStyle}></div>
      </div>
    `);
  }
}
