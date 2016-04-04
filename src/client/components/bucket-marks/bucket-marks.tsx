require('./bucket-marks.css');

import * as React from 'react';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage } from '../../../common/models/index';
import { roundToHalfPx } from "../../utils/dom/dom";

const TICK_HEIGHT = 5;

export interface BucketMarksProps extends React.Props<any> {
  stage: Stage;
  ticks: string[];
  scale: any;
}

export interface BucketMarksState {
}

export class BucketMarks extends React.Component<BucketMarksProps, BucketMarksState> {
  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { stage, ticks, scale } = this.props;
    var stageWidth = stage.width;

    var lines: JSX.Element[] = [];
    function addLine(x: number, key: string) {
      if (stageWidth < x) return;
      lines.push(<line key={key} x1={x} y1={0} x2={x} y2={TICK_HEIGHT}/>);
    }

    for (var tick of ticks) {
      var x = roundToHalfPx(scale(tick));
      addLine(x, '_' + tick);
    }
    if (ticks.length) {
      var x = roundToHalfPx(scale(ticks[ticks.length - 1]) + scale.rangeBand());
      addLine(x, 'last');
    }

    return <g className="bucket-marks" transform={stage.getTransform()}>
      {lines}
    </g>;
  }
}
