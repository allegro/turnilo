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
import { selectSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import { LinearScale } from "../../../../utils/linear-scale/linear-scale";
import { StackedBarChartModel } from "../utils/bar-chart-model";
import { selectBase } from "../utils/stack-layout";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";
import { SIDE_PADDING } from "./padding";

interface StackedBarProps {
  model: StackedBarChartModel;
  datum: Datum;
  yScale: LinearScale;
  xScale: XScale;
  series: ConcreteSeries;
}

export const StackedBar: React.FunctionComponent<StackedBarProps> = props => {
  const { datum, xScale, yScale, series, model: { colors, continuousSplit, nominalSplit } } = props;
  const datums = selectSplitDatums(datum);

  const x = continuousSplit.selectValue<DomainValue>(datum);
  const xPos = xScale.calculate(x) + SIDE_PADDING;
  const width = xScale.bandwidth() - (2 * SIDE_PADDING);
  const color = (d: Datum) => colors.get(String(nominalSplit.selectValue(d)));
  return <React.Fragment>
    {datums.map(datum => {
      const key = String(nominalSplit.selectValue(datum));
      const y = series.selectValue(datum);
      const y0 = selectBase(datum, series);
      const yPos = yScale(y + y0);
      const height = yScale(y0) - yScale(y + y0);

      return <rect
        className="bar-chart-bar-segment"
        key={String(key)}
        x={xPos}
        y={yPos}
        width={width}
        height={height}
        fill={color(datum)}
      />;
    })}
  </React.Fragment>;
};
