/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('./line-chart-axis.css');

import * as d3 from 'd3';
import * as React from 'react';
import { Timezone, WallTime } from 'chronoshift';
import { Stage } from '../../../common/models/index';
import { roundToHalfPx } from '../../utils/dom/dom';

const TICK_HEIGHT = 5;
const TEXT_OFFSET = 12;
const floatFormat =  d3.format(".1f");

export interface LineChartAxisProps extends React.Props<any> {
  stage: Stage;
  ticks: (Date | number)[];
  scale: any;
  timezone: Timezone;
}

export interface LineChartAxisState {
}

export class LineChartAxis extends React.Component<LineChartAxisProps, LineChartAxisState> {
  constructor() {
    super();

  }

  render() {
    const { stage, ticks, scale, timezone } = this.props;

    //var format = d3.time.format('%b %-d');
    var format = scale.tickFormat();

    var timezoneString = timezone.toString();

    function formatLabel(v: Date | number) {
      if (v instanceof Date) { return formatWithTimezone(v); }
      return String(floatFormat(v as number));
    }

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
      return <text key={String(tick)} x={x} y={labelY}>{formatLabel(tick)}</text>;
    });

    return <g className="line-chart-axis" transform={stage.getTransform()}>
      {lines}
      {labels}
    </g>;
  }
}
