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
import { Nullary } from "../../../../../common/utils/functional/functional";
import { LegendSpot } from "../../../../components/pinboard-panel/pinboard-panel";
import { BarsContainer } from "../bars/bars-container";
import { Interaction } from "../interactions/interaction";
import { Legend } from "../legend/Legend";
import { BarChartModel, isStacked } from "../utils/bar-chart-model";
import { XScale } from "../utils/x-scale";

interface BarChartsProps {
  interaction: Interaction;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  stage: Stage;
  scrollLeft: number;
  model: BarChartModel;
  datums: Datum[];
  totals: Datum;
  xScale: XScale;
}

export const BarCharts: React.FunctionComponent<BarChartsProps> = props => {
  const { dropHighlight, acceptHighlight, interaction, model, datums, xScale, scrollLeft, stage, totals } = props;
  const seriesList = model.series.toArray();
  return <React.Fragment>
    {isStacked(model) && <LegendSpot>
      <Legend model={model}/>
    </LegendSpot>}
    {seriesList.map(series => {
      const hasInteraction = !!interaction && interaction.key === series.plywoodKey();
      return <BarsContainer
        key={series.reactKey()}
        stage={stage}
        scrollLeft={scrollLeft}
        interaction={hasInteraction && interaction}
        series={series}
        xScale={xScale}
        datums={datums}
        totals={totals}
        model={model}
        acceptHighlight={acceptHighlight}
        dropHighlight={dropHighlight} />;
    })}
  </React.Fragment>;
};
