'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { Timezone, Duration } from 'chronology';
import { $, Expression, Executor, Dataset, TimeRange } from 'plywood';
import { Clicker, Essence, Filter, Dimension, Measure } from '../../models/index';
import { isInside, escapeKey } from '../../utils/dom';
// import { SomeComp } from '../some-comp/some-comp';

interface HighlighterProps {
  clicker: Clicker;
  essence: Essence;
  scaleX: any;
  dragStart: number;
  duration: Duration;
  timezone: Timezone;
  onClose: Function;
}

interface HighlighterState {
  pseudoHighlight?: TimeRange;
  dragging?: boolean;
}

export class Highlighter extends React.Component<HighlighterProps, HighlighterState> {

  constructor() {
    super();
    this.state = {
      pseudoHighlight: null,
      dragging: false
    };

    this.globalMouseMoveListener = this.globalMouseMoveListener.bind(this);
    this.globalMouseUpListener = this.globalMouseUpListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    var { dragStart } = this.props;
    window.addEventListener('keydown', this.globalKeyDownListener);
    var dragging = (dragStart !== null);
    if (dragging) {
      this.addMouseListeners();
    }
    this.setState({ dragging });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.globalKeyDownListener);
    this.removeMouseListeners();
  }

  addMouseListeners() {
    window.addEventListener('mousemove', this.globalMouseMoveListener);
    window.addEventListener('mouseup', this.globalMouseUpListener);
  }

  removeMouseListeners() {
    window.removeEventListener('mousemove', this.globalMouseMoveListener);
    window.removeEventListener('mouseup', this.globalMouseUpListener);
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
      pseudoHighlight: this.getHighlight(e.clientX)
    });
  }

  globalMouseUpListener(e: MouseEvent) {
    var { clicker, essence, duration, timezone } = this.props;
    var { dragging, pseudoHighlight } = this.state;
    if (!dragging) return;
    if (!pseudoHighlight) { // There was no mouse move so just quietly cancel out
      this.onCancel();
      return;
    }

    pseudoHighlight = this.getHighlight(e.clientX);
    this.setState({
      dragging: false,
      pseudoHighlight: null
    });

    var timeRange = TimeRange.fromJS({
      start: duration.floor(pseudoHighlight.start, timezone),
      end: duration.move(duration.floor(pseudoHighlight.end, timezone), timezone, 1)
    });

    var timeDimension = essence.getTimeDimension();
    clicker.changeHighlight(timeDimension.expression.in(timeRange));
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onClose } = this.props;
    onClose();
  }

  onAccept() {
    var { onClose, clicker } = this.props;
    console.log('accept');
    clicker.acceptHighlight();
    onClose();
  }

  onCancel() {
    var { onClose, clicker } = this.props;
    clicker.dropHighlight();
    onClose();
  }

  render() {
    var { essence, scaleX } = this.props;
    var { pseudoHighlight, dragging } = this.state;

    var shownTimeRange = pseudoHighlight;
    if (!shownTimeRange) {
      var timeDimension = essence.getTimeDimension();
      if (essence.highlightOn(timeDimension)) {
        shownTimeRange = essence.getHighlighValue();
      }
    }

    if (!shownTimeRange) {
      return JSX(`<div className='highlighter'></div>`);
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

    var startPos = scaleX(shownTimeRange.start);
    var endPos = scaleX(shownTimeRange.end);

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
