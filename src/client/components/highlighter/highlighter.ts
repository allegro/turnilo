'use strict';

import * as React from 'react/addons';
//import * as Icon from 'react-svg-icons';
import { Timezone, Duration } from 'chronoshift';
import { $, Expression, Executor, Dataset, TimeRange } from 'plywood';
import { Clicker, Essence, Filter, Dimension, Measure } from '../../models/index';
import { isInside, escapeKey } from '../../utils/dom';
import { HighlightControls } from '../highlight-controls/highlight-controls';

interface HighlighterProps {
  clicker: Clicker;
  essence: Essence;
  highlightId: string;
  scaleX: any;
  dragStart: number;
  duration: Duration;
  timezone: Timezone;
  onClose: Function;
}

interface HighlighterState {
  pseudoHighlight?: TimeRange;
  dragStartPx?: number;
}

export class Highlighter extends React.Component<HighlighterProps, HighlighterState> {

  constructor() {
    super();
    this.state = {
      pseudoHighlight: null,
      dragStartPx: null
    };

    this.globalMouseMoveListener = this.globalMouseMoveListener.bind(this);
    this.globalMouseUpListener = this.globalMouseUpListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    var { dragStart } = this.props;
    window.addEventListener('keydown', this.globalKeyDownListener);
    window.addEventListener('mousemove', this.globalMouseMoveListener);
    window.addEventListener('mouseup', this.globalMouseUpListener);
    this.setState({ dragStartPx: dragStart });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.globalKeyDownListener);
    window.removeEventListener('mousemove', this.globalMouseMoveListener);
    window.removeEventListener('mouseup', this.globalMouseUpListener);
  }

  getPseudoHighlight(eventX: number): TimeRange {
    var { scaleX } = this.props;
    var { dragStartPx } = this.state;
    var myDOM = React.findDOMNode(this);
    var d1 = scaleX.invert(dragStartPx);
    var d2 = scaleX.invert(eventX - myDOM.getBoundingClientRect().left);

    if (d1 < d2) {
      return TimeRange.fromJS({ start: d1, end: d2 });
    } else {
      return TimeRange.fromJS({ start: d2, end: d1 });
    }
  }

  onMouseDown(e: MouseEvent) {
    var { dragStartPx } = this.state;
    if (dragStartPx !== null) return;
    var myDOM = React.findDOMNode(this);
    dragStartPx = e.clientX - (myDOM.getBoundingClientRect().left);
    this.setState({ dragStartPx });
  }

  globalMouseMoveListener(e: MouseEvent) {
    var { dragStartPx } = this.state;
    if (dragStartPx === null) return;
    this.setState({
      pseudoHighlight: this.getPseudoHighlight(e.clientX)
    });
  }

  globalMouseUpListener(e: MouseEvent) {
    var { clicker, essence, highlightId, duration, timezone, onClose } = this.props;
    var { dragStartPx, pseudoHighlight } = this.state;
    if (dragStartPx === null) return;
    if (!pseudoHighlight) { // There was no mouse move so just quietly cancel out
      clicker.dropHighlight();
      onClose();
      return;
    }

    pseudoHighlight = this.getPseudoHighlight(e.clientX);
    this.setState({
      dragStartPx: null,
      pseudoHighlight: null
    });

    var timeRange = TimeRange.fromJS({
      start: duration.floor(pseudoHighlight.start, timezone),
      end: duration.move(duration.floor(pseudoHighlight.end, timezone), timezone, 1)
    });

    var timeDimension = essence.getTimeDimension();
    clicker.changeHighlight(highlightId, Filter.fromClause(timeDimension.expression.in(timeRange)));
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { onClose } = this.props;
    onClose();
  }

  render() {
    var { clicker, essence, highlightId, scaleX, onClose } = this.props;
    var { pseudoHighlight, dragStartPx } = this.state;

    var shownTimeRange = pseudoHighlight;
    if (!shownTimeRange) {
      if (essence.highlightOn(highlightId)) {
        shownTimeRange = essence.getSingleHighlightValue();
      }
    }

    if (!shownTimeRange) {
      return JSX(`<div className='highlighter'></div>`);
    }

    var highlightControls: React.ReactElement<any> = null;
    if (dragStartPx === null) {
      highlightControls = JSX(`
        <HighlightControls clicker={clicker} orientation="vertical" onClose={onClose}/>
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
      <div className={'highlighter ' + (dragStartPx !== null ? 'dragging' : 'confirm')} onMouseDown={this.onMouseDown.bind(this)}>
        <div className="whiteout left" style={whiteoutLeftStyle}></div>
        <div className="frame" style={frameStyle}>{highlightControls}</div>
        <div className="whiteout right" style={whiteoutRightStyle}></div>
      </div>
    `);
  }
}
