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
import React from "react";
import { alphaMain } from "../../../../../common/models/colors/colors";
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { LinearScale } from "../../../../utils/linear-scale/linear-scale";
import { useSettingsContext } from "../../../../views/cube-view/settings-context";
import { BaseBarChartModel } from "../utils/bar-chart-model";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";
import { SIDE_PADDING } from "./padding";

interface SingleTimeShiftBar {
  datum: Datum;
  yScale: LinearScale;
  xScale: XScale;
  series: ConcreteSeries;
  model: BaseBarChartModel;
}

export const SingleTimeShiftBar: React.FunctionComponent<SingleTimeShiftBar> = props => {
  const { customization: { visualizationColors } } = useSettingsContext();
  const { datum, xScale, yScale, model: { continuousSplit }, series } = props;
  const [maxHeight] = yScale.range();
  const x = continuousSplit.selectValue<DomainValue>(datum);
  const xStart = xScale.calculate(x);
  const rangeBand = xScale.bandwidth();
  const fullWidth = rangeBand - 2 * SIDE_PADDING;
  const barWidth = fullWidth * 2 / 3;

  const yCurrent = series.selectValue(datum);
  const yPrevious = series.selectValue(datum, SeriesDerivation.PREVIOUS);
  const yCurrentStart = yScale(yCurrent);
  const yPreviousStart = yScale(yPrevious);

  const currentFill = visualizationColors.main;
  const previousFill = alphaMain(visualizationColors);

  return <React.Fragment>
    <rect
      className="bar-chart-bar-previous"
      x={xStart + rangeBand - SIDE_PADDING - barWidth}
      y={yPreviousStart}
      fill={previousFill}
      width={barWidth}
      height={maxHeight - yPreviousStart} />
    <rect
      className="bar-chart-bar"
      x={xStart + SIDE_PADDING}
      y={yCurrentStart}
      fill={currentFill}
      width={barWidth}
      height={maxHeight - yCurrentStart} />
  </React.Fragment>;
};
