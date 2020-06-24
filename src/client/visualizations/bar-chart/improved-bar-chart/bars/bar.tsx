/*
 * Copyright 2017-2018 Allegro.pl
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

import { Datum } from "plywood";
import * as React from "react";
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { Unary } from "../../../../../common/utils/functional/functional";
import { LinearScale } from "../../../../utils/linear-scale/linear-scale";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";

export const TOP_PADDING = 5;

interface SingleBarProps {
  datum: Datum;
  yScale: LinearScale;
  xScale: XScale;
  series: ConcreteSeries;
  getX: Unary<Datum, DomainValue>;
  maxHeight: number;
}

const SIDE_PADDING = 5;

const SingleBar: React.SFC<SingleBarProps> = props => {
  const { datum, xScale, yScale, getX, series, maxHeight } = props;
  const x = getX(datum);
  const xPos = xScale.calculate(x) + SIDE_PADDING;
  const width = xScale.rangeBand() - (2 * SIDE_PADDING);
  const y = series.selectValue(datum);
  const yPos = yScale(y);
  const height = maxHeight - yPos;

  return <rect
    className="bar-chart-bar"
    x={xPos}
    y={yPos}
    width={width}
    height={height} />;
};

interface TimeShiftBarProps {
  datum: Datum;
  yScale: LinearScale;
  xScale: XScale;
  series: ConcreteSeries;
  getX: Unary<Datum, DomainValue>;
  maxHeight: number;
}

const TimeShiftBar: React.SFC<TimeShiftBarProps> = props => {
  const { datum, xScale, yScale, getX, series, maxHeight } = props;
  const x = getX(datum);
  const xStart = xScale.calculate(x);
  const rangeBand = xScale.rangeBand();
  const fullWidth = rangeBand - 2 * SIDE_PADDING;
  const barWidth = fullWidth * 2 / 3;

  const yCurrent = series.selectValue(datum);
  const yPrevious = series.selectValue(datum, SeriesDerivation.PREVIOUS);
  const yCurrentStart = yScale(yCurrent);
  const yPreviousStart = yScale(yPrevious);

  return <React.Fragment>
    <rect
      className="bar-chart-bar"
      x={xStart + SIDE_PADDING}
      y={yCurrentStart}
      width={barWidth}
      height={maxHeight - yCurrentStart} />
    <rect
      className="bar-chart-bar-previous"
      x={xStart + rangeBand - SIDE_PADDING - barWidth}
      y={yPreviousStart}
      width={barWidth}
      height={maxHeight - yPreviousStart} />
  </React.Fragment>;
};

interface BarProps {
  datum: Datum;
  yScale: LinearScale;
  xScale: XScale;
  series: ConcreteSeries;
  getX: Unary<Datum, DomainValue>;
  showPrevious: boolean;
  maxHeight: number;
}

export const Bar: React.SFC<BarProps> = props => {
  const { showPrevious, ...otherProps } = props;
  return showPrevious ?
    <TimeShiftBar {...otherProps} /> :
    <SingleBar {...otherProps} />;
};
