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

import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Stage } from "../../../../../common/models/stage/stage";
import { Bars } from "../bars/bars";
import { OrdinalScale } from "../utils/x-scale";

interface BarChartsProps {
  essence: Essence;
  dataset: Dataset;
  xScale: OrdinalScale;
}

export const BarCharts: React.SFC<BarChartsProps> = props => {
  const { essence, dataset, xScale } = props;
  const seriesList = essence.getConcreteSeries().toArray();
  return <React.Fragment>
    {seriesList.map(series =>
      <Bars
        key={series.reactKey()}
        stage={Stage.fromSize(1500, 300)}
        essence={essence}
        series={series}
        xScale={xScale}
        dataset={dataset} />)}
  </React.Fragment>;
};
