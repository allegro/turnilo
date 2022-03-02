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

const MARGIN = 40;
const X_AXIS_HEIGHT = 50;
const Y_AXIS_WIDTH = 50;
const BREAKPOINT_SMALL = 768;
const TICK_COUNT = 10;
const EXTENT_EXTEND_FACTOR = 0.05;
const X_AXIS_LABEL_OFFSET = 55;

interface PlottingData {
  xSeries: ConcreteSeries;
  ySeries: ConcreteSeries;
  xScale: LinearScale;
  yScale: LinearScale;
  xTicks: number[];
  yTicks: number[];
  plottingStage: Stage;
  scatterplotData: Datum[];
}

export function preparePlottingData(data: Dataset, essence: Essence, stage: Stage): PlottingData {
  const [xSeries, ySeries] = essence.getConcreteSeries().toArray();
  const scatterplotData = selectFirstSplitDatums(data);
  const xExtent = getExtent(scatterplotData, xSeries);
  const yExtent = getExtent(scatterplotData, ySeries);

  const plottingStage = calculatePlottingStage(stage);
  const yScale = d3.scaleLinear().domain(yExtent).nice().range([plottingStage.height, 0]);
  const xScale = d3.scaleLinear().domain(xExtent).nice().range([0, plottingStage.width]);

  const xTicks = xScale.ticks(TICK_COUNT);
  const yTicks = yScale.ticks(TICK_COUNT);

  return { xSeries, ySeries, xScale, yScale, xTicks, yTicks, plottingStage, scatterplotData };
}

function getExtent(data: Datum[], series: ConcreteSeries): number[] {
  const selectValues = (d: Datum) => series.selectValue(d);
  const extent =  d3.extent(data, selectValues);

  return extendExtentIfNeeded(extent);
}

export function extendExtentIfNeeded(extent: number[]): number[] {
  const [rangeStart, rangeEnd] = extent;

  if (rangeStart !== rangeEnd) {
    return extent;
  }

  const loweredRangeStart = rangeStart - rangeStart * EXTENT_EXTEND_FACTOR;
  const raisedRangeEnd = rangeEnd + rangeEnd * EXTENT_EXTEND_FACTOR;
  return [loweredRangeStart, raisedRangeEnd];
}

export function getXAxisLabelPosition(stage: Stage, plottingStage: Stage): {bottom: number, right: number} {
  const right = stage.width - (plottingStage.width + plottingStage.x);
  const bottom = stage.height - (plottingStage.height + plottingStage.y - X_AXIS_LABEL_OFFSET);

  return { bottom, right };
}

export function getTicksForAvailableSpace(ticks: number[], size: number): number[] {
  if (size > BREAKPOINT_SMALL) {
    return ticks;
  }

  return ticks.filter((_, index) => index % 2 === 0);
}

function calculatePlottingStageBasedOnWidth(stage: Stage): Stage {
  return Stage.fromJS({
    x: Y_AXIS_WIDTH + MARGIN,
    y: MARGIN,
    width: stage.width - Y_AXIS_WIDTH - 2 * MARGIN,
    height: stage.width - X_AXIS_HEIGHT - 2 * MARGIN
  });
}

function calculatePlottingStageBasedOnHeight(stage: Stage): Stage {
  return Stage.fromJS({
    x: Y_AXIS_WIDTH + MARGIN,
    y: MARGIN,
    width: stage.height - Y_AXIS_WIDTH - 2 * MARGIN,
    height: stage.height - X_AXIS_HEIGHT - 2 * MARGIN
  });
}

function calculateRegularPlottingStage(stage: Stage): Stage {
  return Stage.fromJS({
    x: Y_AXIS_WIDTH + MARGIN,
    y: MARGIN,
    width: stage.width - Y_AXIS_WIDTH - 2 * MARGIN,
    height: stage.height - X_AXIS_HEIGHT - 2 * MARGIN
  });
}

export function calculatePlottingStage(stage: Stage): Stage {
  const ratio = stage.width / stage.height;

  if (ratio <= 1 ) return calculatePlottingStageBasedOnWidth(stage);
  if (ratio >= 2 ) return calculatePlottingStageBasedOnHeight(stage);
  return calculateRegularPlottingStage(stage);
}

export function calculateXAxisStage(stage: Stage): Stage {
  return Stage.fromJS({
    x: Y_AXIS_WIDTH + MARGIN,
    y: stage.height + MARGIN,
    width: stage.width,
    height: X_AXIS_HEIGHT
  });
}

export function calculateYAxisStage(stage: Stage): Stage {
  return Stage.fromJS({
    x: MARGIN,
    y: MARGIN,
    width: Y_AXIS_WIDTH,
    height: stage.height
  });
}
