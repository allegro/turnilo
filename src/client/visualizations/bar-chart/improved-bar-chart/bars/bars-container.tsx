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
import { Stage } from "../../../../../common/models/stage/stage";
import { Nullary } from "../../../../../common/utils/functional/functional";
import { VisMeasureLabel } from "../../../../components/vis-measure-label/vis-measure-label";
import getScale from "../../../../utils/linear-scale/linear-scale";
import { Foreground } from "../foreground/foreground";
import { Interaction } from "../interactions/interaction";
import { BarChartModel } from "../utils/bar-chart-model";
import { calculateChartStage } from "../utils/layout";
import { XScale } from "../utils/x-scale";
import { yExtent } from "../utils/y-extent";
import { Bars } from "./bars";
import "./bars.scss";

interface BarsContainerProps {
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  interaction?: Interaction;
  series: ConcreteSeries;
  model: BarChartModel;
  datums: Datum[];
  totals: Datum;
  xScale: XScale;
  stage: Stage;
  scrollLeft: number;
}

const TOTAL_LABEL_OFFSET = 10;

export class BarsContainer extends React.Component<BarsContainerProps> {

  private container = React.createRef<HTMLDivElement>();

  render() {
    const { dropHighlight, acceptHighlight, interaction, model, stage, scrollLeft, series, totals, datums, xScale } = this.props;
    const hasComparison = model.hasComparison;
    const chartStage = calculateChartStage(stage);
    const extent = yExtent(datums, series, hasComparison);
    const yScale = getScale(extent, chartStage.height);

    return <React.Fragment>
      <div
        ref={this.container}
        className="bar-chart-bars"
        style={stage.getWidthHeight()}>
        <div className="bar-chart-total" style={{ left: scrollLeft + TOTAL_LABEL_OFFSET }}>
          <VisMeasureLabel
            series={series}
            datum={totals}
            showPrevious={hasComparison} />
        </div>
        <Bars
          model={model}
          stage={chartStage}
          xScale={xScale}
          series={series}
          datums={datums} />
        {interaction && <Foreground
          interaction={interaction}
          container={this.container}
          stage={chartStage}
          dropHighlight={dropHighlight}
          acceptHighlight={acceptHighlight}
          model={model}
          xScale={xScale}
          series={series}
          yScale={yScale} />}
      </div>
    </React.Fragment>;
  }
}
