require('./highlighter.css');

import * as React from 'react';
import { Timezone, Duration } from 'chronoshift';
import { TimeRange } from 'plywood';

export interface HighlighterProps extends React.Props<any> {
  highlightTimeRange: TimeRange;
  scaleX: any;
}

export interface HighlighterState {
}

export class Highlighter extends React.Component<HighlighterProps, HighlighterState> {

  constructor() {
    super();
  }

  render() {
    const { highlightTimeRange, scaleX } = this.props;
    if (!highlightTimeRange) return null;

    var startPos = scaleX(highlightTimeRange.start);
    var endPos = scaleX(highlightTimeRange.end);

    var whiteoutLeftStyle = {
      width: Math.max(startPos, 0)
    };

    var frameStyle = {
      left: startPos,
      width: Math.max(endPos - startPos, 0)
    };

    var whiteoutRightStyle = {
      left: endPos
    };

    return <div className="highlighter">
      <div className="whiteout left" style={whiteoutLeftStyle}></div>
      <div className="frame" style={frameStyle}></div>
      <div className="whiteout right" style={whiteoutRightStyle}></div>
    </div>;
  }
}
