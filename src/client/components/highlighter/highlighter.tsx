require('./highlighter.css');

import * as React from 'react';
import { Timezone, Duration } from 'chronoshift';
import { PlywoodRange } from 'plywood';

export interface HighlighterProps extends React.Props<any> {
  highlightRange: PlywoodRange;
  scaleX: any;
}

export interface HighlighterState {
}

export class Highlighter extends React.Component<HighlighterProps, HighlighterState> {

  constructor() {
    super();
  }

  render() {
    const { highlightRange, scaleX } = this.props;
    if (!highlightRange) return null;

    var startPos = scaleX(highlightRange.start);
    var endPos = scaleX(highlightRange.end);

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
