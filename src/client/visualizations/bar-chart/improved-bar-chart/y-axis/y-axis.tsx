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
import { Stage } from "../../../../../common/models/stage/stage";
import getScale from "../../../../utils/linear-scale/linear-scale";
import { BarChartModel } from "../utils/bar-chart-model";
import { calculateYAxisStage } from "../utils/layout";
import { yExtent } from "../utils/y-extent";
import { SingleYAxis } from "./single-y-axis";

interface YAxisProps {
  stage: Stage;
  datums: Datum[];
  model: BarChartModel;
}

export const YAxis: React.FunctionComponent<YAxisProps> = props => {
  const { model, stage, datums } = props;
  const axisStage = calculateYAxisStage(stage);
  const seriesList = model.series.toArray();
  return <React.Fragment>
    {seriesList.map(series => {
      const extent = yExtent(datums, series, model.hasComparison);
      const scale = getScale(extent, axisStage.height);
      return <div
        style={stage.getWidthHeight()}
        key={series.reactKey()}>
        {scale && <SingleYAxis
          series={series}
          scale={scale}
          stage={axisStage} />}
      </div>;
    })}
  </React.Fragment>;
};
