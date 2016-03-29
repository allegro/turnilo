require('./grid-lines.css');

import * as React from 'react';
import { Stage } from '../../../common/models/index';
import { classNames, roundToHalfPx } from '../../utils/dom/dom';

export interface GridLinesProps extends React.Props<any> {
  orientation: string;
  stage: Stage;
  ticks: any[];
  scale: any;
}

export interface GridLinesState {
}

export class GridLines extends React.Component<GridLinesProps, GridLinesState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { orientation, stage, ticks, scale } = this.props;

    var lines = ticks.map((tick: any) => {
      var lineProps: any = {
        key: String(tick)
      };

      if (orientation === 'horizontal') {
        var y = roundToHalfPx(scale(tick));
        lineProps.x1 = 0;
        lineProps.x2 = stage.width;
        lineProps.y1 = y;
        lineProps.y2 = y;
      } else {
        var x = roundToHalfPx(scale(tick));
        lineProps.x1 = x;
        lineProps.x2 = x;
        lineProps.y1 = 0;
        lineProps.y2 = stage.height;
      }

      return React.createElement('line', lineProps);
    });

    return <g className={classNames('grid-lines', orientation)} transform={stage.getTransform()}>
      {lines}
    </g>;
  }
}
