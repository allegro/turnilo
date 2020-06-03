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
import { Dataset, Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Stage } from "../../../../../common/models/stage/stage";
import getScale from "../../../line-chart/base-chart/y-scale";
import { selectFirstSplitDatums } from "../../../line-chart/utils/dataset";
import { calculateChartStage } from "../utils/layout";
import { firstSplitRef } from "../utils/splits";
import { xGetter, XScale } from "../utils/x-scale";
import { Background } from "./background";
import { Bar } from "./bar";
import "./bars.scss";

interface BarsProps {
  essence: Essence;
  series: ConcreteSeries;
  dataset: Dataset;
  xScale: XScale;
  stage: Stage;
}

export const Bars: React.SFC<BarsProps> = props => {
  const { stage, series, dataset, essence, xScale } = props;
  const chartStage = calculateChartStage(stage);
  const firstSplitReference = firstSplitRef(essence);
  const getX = xGetter(firstSplitReference);
  const getY = (datum: Datum) => series.selectValue(datum);
  // TODO: move outside line chart
  const datums = selectFirstSplitDatums(dataset);

  const yExtent = d3.extent(datums, getY);
  const yScale = getScale(yExtent, chartStage.height);

  return <div className="bar-chart-bars" style={stage.getWidthHeight()}>
    <svg viewBox={chartStage.getViewBox()}>
      <Background gridStage={chartStage} yScale={yScale} />
      <g transform={chartStage.getTransform()}>
        {datums.map((datum: Datum, index: number) => <Bar
          key={index}
          datum={datum}
          yScale={yScale}
          xScale={xScale}
          getY={getY}
          getX={getX}
          maxHeight={chartStage.height} />)}
      </g>
    </svg>
  </div>;
};
