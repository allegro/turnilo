/*
 * Copyright 2017-2022 Allegro.pl
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
import { Essence } from "../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../common/models/series/concrete-series";
import { Stage } from "../../../../common/models/stage/stage";
import { selectFirstSplitDatums } from "../../../utils/dataset/selectors/selectors";
import { LinearScale } from "../../../utils/linear-scale/linear-scale";
import { dodge } from "./dodge";
import { getExtent, getTicksForAvailableSpace, MARGIN, TICK_COUNT, X_AXIS_HEIGHT } from "./get-scatterplot-data";

export function calculateBeeswarmPlottingStage(stage: Stage): Stage {
  return Stage.fromJS({
    x: MARGIN,
    y: MARGIN,
    width: stage.width - 2 * MARGIN,
    height: stage.height - X_AXIS_HEIGHT - 2 * MARGIN
  });
}

export function calculateBeeswarmXAxisStage(stage: Stage): Stage {
  return Stage.fromJS({
    x: MARGIN,
    y: stage.height + MARGIN,
    width: stage.width,
    height: X_AXIS_HEIGHT
  });
}

interface BeeswarmData {
  plottingStage: Stage;
  ticks: number[];
  scale: LinearScale;
  series: ConcreteSeries;
  beeswarmData: Datum[];
}

export function getBeeswarmData(data: Dataset, essence: Essence, stage: Stage): BeeswarmData  {
  const series = essence.getConcreteSeries().first();
  const beeswarmData = selectFirstSplitDatums(data);
  const extent = getExtent(beeswarmData, series);

  const plottingStage = calculateBeeswarmPlottingStage(stage);
  const scale = d3.scale.linear().domain(extent).nice().range([0, plottingStage.width]);

  const ticks = getTicksForAvailableSpace(scale.ticks(TICK_COUNT), plottingStage.width);

  return { plottingStage, scale, series, ticks, beeswarmData };
}

interface Point {
  r: number;
  x: number;
  y: number;
  data: Datum;
}

interface GetPoints {
  data: Datum[];
  series: ConcreteSeries;
  scale: LinearScale;
  pointRadius: number;
  stage: Stage;
}

export function getPoints({ data, series, scale, pointRadius, stage }: GetPoints): Point[] {
  const padding = 3;
  const yOffset = stage.height / 2;
  const yValues = dodge(data.map(i => scale(series.selectValue(i))), pointRadius * 2 + padding);

  return data.map((datum, index) => ({
    data: datum,
    r: pointRadius,
    x: scale(series.selectValue(datum)),
    y: yValues[index] + yOffset
  }));
}
