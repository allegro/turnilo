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

import d3 from "d3";
import { Dataset, Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Stage } from "../../../../../common/models/stage/stage";
import { selectFirstSplitDatums } from "../../../line-chart/utils/dataset";
import { OrdinalScale } from "../utils/x-scale";

interface BarsProps {
  essence: Essence;
  series: ConcreteSeries;
  dataset: Dataset;
  xScale: OrdinalScale;
  stage: Stage;
}

export const Bars: React.SFC<BarsProps> = props => {
  const { stage, series, dataset, essence, xScale } = props;
  const firstSplitReference = essence.splits.splits.first().reference;
  // TODO: helper for getters, which could serialize PlywoodValues to desired d3 representation (string | number)
  const getX = (datum: Datum) => datum[firstSplitReference].toString();
  const datums = selectFirstSplitDatums(dataset);
  const yExtent = d3.extent(datums, datum => series.selectValue(datum));
  const yScale = d3.scale.linear()
    .domain(yExtent)
    .range([0, 100])
    .nice(5);
  return <svg height={stage.height} width={stage.width}>
    {datums.map(datum => {
      const x = getX(datum);
      const xPos = xScale(x);
      const width = xScale.rangeBand();
      const y = series.selectValue(datum);
      const height = yScale(y);
      const yPos = 200 - height;

      return <rect
        key={x}
        x={xPos}
        y={yPos}
        width={width}
        height={height} />;
    })}
  </svg>;
};
