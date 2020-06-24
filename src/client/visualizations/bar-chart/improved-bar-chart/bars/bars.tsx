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
import { Nullary } from "../../../../../common/utils/functional/functional";
import { VisMeasureLabel } from "../../../../components/vis-measure-label/vis-measure-label";
import { selectFirstSplitDatums, selectMainDatum } from "../../../../utils/dataset/selectors/selectors";
import getScale from "../../../../utils/linear-scale/linear-scale";
import { Foreground } from "../foreground/foreground";
import { Interaction } from "../interactions/interaction";
import { calculateChartStage } from "../utils/layout";
import { firstSplitRef } from "../utils/splits";
import { xGetter, XScale } from "../utils/x-scale";
import { yExtent } from "../utils/y-extent";
import { Background } from "./background";
import { Bar } from "./bar";
import "./bars.scss";

interface BarsProps {
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  essence: Essence;
  interaction?: Interaction;
  series: ConcreteSeries;
  dataset: Dataset;
  xScale: XScale;
  stage: Stage;
  scrollLeft: number;
}

const TOTAL_LABEL_OFFSET = 10;

export class Bars extends React.Component<BarsProps> {

  private container = React.createRef<HTMLDivElement>();

  render() {
    const { dropHighlight, acceptHighlight, interaction, stage, scrollLeft, series, dataset, essence, xScale } = this.props;
    const chartStage = calculateChartStage(stage);
    const firstSplitReference = firstSplitRef(essence);
    const getX = xGetter(firstSplitReference);
    const datums = selectFirstSplitDatums(dataset);
    const extent = yExtent(datums, series, essence);
    const yScale = getScale(extent, chartStage.height);

    return <div
      ref={this.container}
      className="bar-chart-bars"
      style={stage.getWidthHeight()}>
      <div className="bar-chart-total" style={{ left: scrollLeft + TOTAL_LABEL_OFFSET }}>
        <VisMeasureLabel
          series={series}
          datum={selectMainDatum(dataset)}
          showPrevious={essence.hasComparison()} />
      </div>
      {yScale && <React.Fragment>
        <svg viewBox={chartStage.getViewBox()}>
          <Background gridStage={chartStage} yScale={yScale} />
          <g transform={chartStage.getTransform()}>
            {datums.map((datum: Datum, index: number) => <Bar
              key={index}
              datum={datum}
              yScale={yScale}
              xScale={xScale}
              series={series}
              showPrevious={essence.hasComparison()}
              getX={getX}
              maxHeight={chartStage.height} />)}
          </g>
        </svg>
        {interaction && <Foreground
          interaction={interaction}
          container={this.container}
          stage={chartStage}
          dropHighlight={dropHighlight}
          acceptHighlight={acceptHighlight}
          essence={essence}
          xScale={xScale}
          series={series}
          getX={getX}
          yScale={yScale} />}
      </React.Fragment>}
    </div>;
  }
}
