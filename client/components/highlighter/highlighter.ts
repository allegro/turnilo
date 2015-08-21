'use strict';

import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Dispatcher, Dataset, NumberRange } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface HighlighterProps {
  scaleX: any;
  dragStart: number;
  onHighlightEnd: Function;
}

interface HighlighterState {
  highlight?: NumberRange;
  confirm?: boolean;
}

export class Highlighter extends React.Component<HighlighterProps, HighlighterState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      highlight: null
    };

    this.globalMouseMoveListener = this.globalMouseMoveListener.bind(this);
    this.globalMouseUpListener = this.globalMouseUpListener.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    window.addEventListener('mousemove', this.globalMouseMoveListener);
    window.addEventListener('mouseup', this.globalMouseUpListener);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('mousemove', this.globalMouseMoveListener);
    window.removeEventListener('mouseup', this.globalMouseUpListener);
  }

  componentWillReceiveProps(nextProps: HighlighterProps) {

  }

  globalMouseMoveListener(e: MouseEvent) {
    var { dragStart, scaleX } = this.props;
    var { confirm } = this.state;
    if (confirm) return;
    var myDOM = React.findDOMNode(this);

    dragStart = scaleX.invert(dragStart);
    var myX = scaleX.invert(e.clientX - myDOM.getBoundingClientRect().left);

    this.setState({
      highlight: NumberRange.fromJS({
        start: Math.min(dragStart, myX),
        end: Math.max(dragStart, myX)
      })
    });
  }

  globalMouseUpListener(e: MouseEvent) {
    var { confirm } = this.state;
    if (confirm) return;
    this.setState({
      confirm: true
    });
  }

  onYes() {
    var { onHighlightEnd } = this.props;
    console.log('YES');
    onHighlightEnd();
  }

  onNo() {
    var { onHighlightEnd } = this.props;
    onHighlightEnd();
  }

  render() {
    var { scaleX } = this.props;
    var { highlight, confirm } = this.state;

    if (!highlight) {
      return JSX(`<div className="highlighter"></div>`);
    }

    var buttonBar: React.DOMElement<any> = null;
    if (confirm) {
      buttonBar = JSX(`
        <div className="button-bar">
          <div className="button yes" onClick={this.onYes.bind(this)}>Yes</div>
          <div className="button no" onClick={this.onNo.bind(this)}>No</div>
        </div>
      `);
    }

    var frameStyle = {
      left: scaleX(highlight.start),
      width: scaleX(highlight.end) - scaleX(highlight.start)
    };

    return JSX(`
      <div className="highlighter">
        <div className="frame" style={frameStyle}>
          {buttonBar}
        </div>
      </div>
    `);
  }
}
