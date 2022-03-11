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

import * as d3 from "d3";
import { Datum } from "plywood";
import React from "react";
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { selectSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import { LinearScale } from "../../../../utils/linear-scale/linear-scale";
import { StackedBarChartModel } from "../utils/bar-chart-model";
import { selectBase } from "../utils/stack-layout";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";
import { SIDE_PADDING } from "./padding";

interface StackedTimeShiftBarProps {
  model: StackedBarChartModel;
  datum: Datum;
  yScale: LinearScale;
  xScale: XScale;
  series: ConcreteSeries;
}

export const StackedTimeShiftBar: React.FunctionComponent<StackedTimeShiftBarProps> = props => {
  const { datum, xScale, yScale, series, model: { nominalSplit, continuousSplit, colors } } = props;
  const datums = selectSplitDatums(datum);

  const x = continuousSplit.selectValue<DomainValue>(datum);

  const xStart = xScale.calculate(x);
  const rangeBand = xScale.bandwidth();
  const fullWidth = rangeBand - 2 * SIDE_PADDING;
  const barWidth = fullWidth * 2 / 3;
  const color = (d: Datum) => colors.get(String(nominalSplit.selectValue(d)));
  return <React.Fragment>
    {datums.map(datum => {
      const key = `${nominalSplit.selectValue(datum)}--previous`;
      const yPrevious = series.selectValue(datum, SeriesDerivation.PREVIOUS);
      const yPreviousBase = selectBase(datum, series, SeriesDerivation.PREVIOUS);
      const yPreviousPos = yScale(yPrevious + yPreviousBase);
      const previousHeight = yScale(yPreviousBase) - yScale(yPrevious + yPreviousBase);

      const previousColor = d3.rgb(color(datum)).darker(0.8);

      return <rect
          className="bar-chart-bar-segment"
          key={String(key)}
          x={xStart + rangeBand - SIDE_PADDING - barWidth}
          y={yPreviousPos}
          width={barWidth}
          height={previousHeight}
          opacity={0.8}
          fill={previousColor.toString()}
        />;
    })}
    {datums.map(datum => {
      const key = `${nominalSplit.selectValue(datum)}--current`;
      const yCurrent = series.selectValue(datum);
      const yCurrentBase = selectBase(datum, series);
      const yCurrentPos = yScale(yCurrent + yCurrentBase);
      const currentHeight = yScale(yCurrentBase) - yScale(yCurrent + yCurrentBase);
      const currentColor = color(datum);

      return <rect
        className="bar-chart-bar-previous-segment"
        key={key}
        x={xStart + SIDE_PADDING}
        y={yCurrentPos}
        width={barWidth}
        height={currentHeight}
        fill={currentColor}
      />;
    })}
  </React.Fragment>;
};
