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
import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Stage } from "../../../../../common/models/stage/stage";
import { selectFirstSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import getScale from "../../../../utils/linear-scale/linear-scale";
import { calculateYAxisStage } from "../utils/layout";
import { SingleYAxis } from "./single-y-axis";

interface YAxisProps {
  stage: Stage;
  dataset: Dataset;
  essence: Essence;
}

export const YAxis: React.SFC<YAxisProps> = props => {
  const { essence, stage, dataset } = props;
  const seriesList = essence.getConcreteSeries().toArray();
  const datums = selectFirstSplitDatums(dataset);
  const axisStage = calculateYAxisStage(stage);
  return <React.Fragment>
    {seriesList.map(series => {
      const extent = d3.extent(datums, datum => series.selectValue(datum));
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
