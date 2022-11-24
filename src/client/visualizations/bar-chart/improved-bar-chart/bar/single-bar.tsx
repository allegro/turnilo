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
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { LinearScale } from "../../../../utils/linear-scale/linear-scale";
import { useSettingsContext } from "../../../../views/cube-view/settings-context";
import { BaseBarChartModel } from "../utils/bar-chart-model";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";
import { SIDE_PADDING } from "./padding";

interface SingleBarProps {
  datum: Datum;
  yScale: LinearScale;
  xScale: XScale;
  series: ConcreteSeries;
  model: BaseBarChartModel;
}

export const SingleBar: React.FunctionComponent<SingleBarProps> = props => {
  const { customization: { visualizationColors } } = useSettingsContext();
  const { datum, xScale, yScale, model: { continuousSplit }, series } = props;
  const [maxHeight] = yScale.range();
  const x = continuousSplit.selectValue<DomainValue>(datum);
  const xPos = xScale.calculate(x) + SIDE_PADDING;
  const width = xScale.bandwidth() - (2 * SIDE_PADDING);
  const y = series.selectValue(datum);
  const yPos = yScale(y);
  const height = maxHeight - yPos;
  const fill = visualizationColors.main;

  return <rect
    className="bar-chart-bar"
    x={xPos}
    y={yPos}
    fill={fill}
    width={width}
    height={height} />;
};
