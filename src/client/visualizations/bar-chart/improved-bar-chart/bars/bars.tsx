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
import getScale, { LinearScale } from "../../../../utils/linear-scale/linear-scale";
import { SingleBar } from "../bar/single-bar";
import { SingleTimeShiftBar } from "../bar/single-time-shift-bar";
import { StackedBar } from "../bar/stacked-bar";
import { StackedTimeShiftBar } from "../bar/stacked-time-shift-bar";
import { BarChartModel, isStacked } from "../utils/bar-chart-model";
import { XScale } from "../utils/x-scale";
import { yExtent } from "../utils/y-extent";
import { Background } from "./background";

interface BarProps {
  model: BarChartModel;
  datum: Datum;
  yScale: LinearScale;
  xScale: XScale;
  series: ConcreteSeries;
}

const Bar: React.FunctionComponent<BarProps> = props => {
  const { model, ...rest } = props;
  const showPrevious = model.hasComparison;
  if (isStacked(model)) {
    return showPrevious
      ? <StackedTimeShiftBar {...rest} model={model} />
      : <StackedBar {...rest} model={model} />;
  }
  return showPrevious
    ? <SingleTimeShiftBar {...rest} model={model} />
    : <SingleBar {...rest} model={model} />;
};

interface BarsProps {
  model: BarChartModel;
  stage: Stage;
  xScale: XScale;
  series: ConcreteSeries;
  datums: Datum[];
}

export const Bars: React.FunctionComponent<BarsProps> = props => {
  const { model, stage, xScale, series, datums } = props;
  const extent = yExtent(datums, series, model.hasComparison);
  const yScale = getScale(extent, stage.height);
  if (!yScale) return null;
  return <React.Fragment>
    <svg viewBox={stage.getViewBox()}>
      <Background gridStage={stage} yScale={yScale} />
      <g transform={stage.getTransform()}>
        {datums.map((datum: Datum, index: number) => <Bar
          key={index}
          datum={datum}
          model={model}
          yScale={yScale}
          xScale={xScale}
          series={series}
        />)}
      </g>
    </svg>
  </React.Fragment>;
};
