require('./time-axis.css');

import * as React from 'react';
import { Timezone, WallTime } from 'chronoshift';
import { Stage } from '../../../common/models/index';
import { roundToHalfPx } from '../../utils/dom/dom';

const TICK_HEIGHT = 5;
const TEXT_OFFSET = 12;

export interface TimeAxisProps extends React.Props<any> {
  stage: Stage;
  ticks: Date[];
  scale: any;
  timezone: Timezone;
}

export interface TimeAxisState {
}

export class TimeAxis extends React.Component<TimeAxisProps, TimeAxisState> {
  constructor() {
    super();

  }

  render() {
    const { stage, ticks, scale, timezone } = this.props;

    //var format = d3.time.format('%b %-d');
    var format = scale.tickFormat();

    var timezoneString = timezone.toString();
    function formatWithTimezone(d: Date): string {
      return format(WallTime.UTCToWallTime(d, timezoneString));
    }

    var lines = ticks.map((tick: any) => {
      var x = roundToHalfPx(scale(tick));
      return <line key={String(tick)} x1={x} y1={0} x2={x} y2={TICK_HEIGHT}/>;
    });

    var labelY = TICK_HEIGHT + TEXT_OFFSET;
    var labels = ticks.map((tick: any) => {
      var x = scale(tick);
      return <text key={String(tick)} x={x} y={labelY}>{formatWithTimezone(tick)}</text>;
    });

    return <g className="time-axis" transform={stage.getTransform()}>
      {lines}
      {labels}
    </g>;
  }
}
