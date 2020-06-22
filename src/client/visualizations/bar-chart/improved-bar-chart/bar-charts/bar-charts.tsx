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
import { Nullary } from "../../../../../common/utils/functional/functional";
import { Bars } from "../bars/bars";
import { Interaction } from "../interactions/interaction";
import { XScale } from "../utils/x-scale";

interface BarChartsProps {
  interaction: Interaction;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  stage: Stage;
  scrollLeft: number;
  essence: Essence;
  dataset: Dataset;
  xScale: XScale;
}

export const BarCharts: React.SFC<BarChartsProps> = props => {
  const { dropHighlight, acceptHighlight, interaction, essence, dataset, xScale, scrollLeft, stage } = props;
  const seriesList = essence.getConcreteSeries().toArray();
  return <React.Fragment>
    {seriesList.map(series => {
      const hasInteraction = !!interaction && interaction.key === series.plywoodKey();
      return <Bars
        key={series.reactKey()}
        stage={stage}
        scrollLeft={scrollLeft}
        interaction={hasInteraction && interaction}
        essence={essence}
        series={series}
        xScale={xScale}
        dataset={dataset}
        acceptHighlight={acceptHighlight}
        dropHighlight={dropHighlight} />;
    })}
  </React.Fragment>;
};
