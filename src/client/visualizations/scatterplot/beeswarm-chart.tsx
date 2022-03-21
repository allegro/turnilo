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
import * as React from "react";
import { ChartProps } from "../../../common/models/chart-props/chart-props";

import { GridLines } from "../../components/grid-lines/grid-lines";
import { XAxis } from "./x-axis";

import { Point } from "./point";
import { HoveredPoint } from "./scatterplot";
import { Tooltip } from "./tooltip";
import { calculateBeeswarmXAxisStage, getBeeswarmData, getPoints } from "./utils/get-beeswarm-data";
import { isTruthy } from "../../../common/utils/general/general";
import { Timezone } from "chronoshift";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Datum } from "plywood";
import { useCallback, useState } from "react";
import { Modal } from "../../components/modal/modal";

const TICK_SIZE = 10;
const THRESHOLD = 0.04;

interface BeeswarmChartProps  extends ChartProps {
  hoveredPoint: HoveredPoint | null;
  setPointHover(point: HoveredPoint): void;
  resetPointHover(): void;
}

interface HoveredArea {
  data: Datum[];
  x: number;
  y: number;
}

export const BeeswarmChart: React.FunctionComponent<BeeswarmChartProps> = ({ data, essence, stage, setPointHover, resetPointHover, hoveredPoint }) =>{
  const mainSplit = essence.splits.splits.first();

  const [hoveredArea, setHoveredArea] = useState<HoveredArea>(null); // ?? Rename to what ??
  const handleAreaClick = useCallback((hoveredArea: HoveredArea): void => setHoveredArea(hoveredArea), [setHoveredArea]);
  const handleModalClose = useCallback((): void => setHoveredArea(null), [setHoveredArea]);

  const { plottingStage, scale, series, ticks, beeswarmData } = getBeeswarmData(data, essence, stage);
  const points = getPoints({ data: beeswarmData, series, scale, pointRadius: 3, stage: plottingStage });

  const lowerThreshold = plottingStage.height * THRESHOLD;
  const upperThreshold = plottingStage.height - lowerThreshold;
  const topYAreaPosition = lowerThreshold / 2;
  const bottomYAreaPosition = plottingStage.height - topYAreaPosition;

  console.log(plottingStage.height, Math.round(lowerThreshold), Math.round(upperThreshold))

  const pointsAboveThreshold = points.map(point => point.y >= upperThreshold ? point : undefined).filter(Boolean); // high Y, lower on screen
  const pointsBelowThreshold = points.map(point => point.y <= lowerThreshold ? point : undefined).filter(Boolean);
  const pointsBetweenThresholds = points.map(point => (point.y > lowerThreshold && point.y < upperThreshold) ? point : undefined).filter(Boolean);

  const topXAreaPosition = pointsBelowThreshold.length > 0 ? pointsBelowThreshold[0].x as number : 0;
  const bottomXAreaPosition = pointsAboveThreshold.length > 0 ? pointsAboveThreshold[0].x as number : 0;
  // FIXME: I know this is wrong - I place all points above threshold in one X position, although there could be more.

  const areaBelowThreshold = pointsBelowThreshold.map(area => area.data);
  const areaAboveThreshold = pointsBetweenThresholds.map(area => area.data);

  return <div className="scatterplot-container" style={stage.getWidthHeight()}>
    <span className="axis-title axis-title-x" style={{ bottom: 150, right: 10 }}>{series.title()}</span>
    <AreaTooltip
      hoveredArea={hoveredArea}
      stage={plottingStage}
      xSeries={series}
      split={mainSplit}
      timezone={essence.timezone}
      handleModalClose={handleModalClose}
      showPrevious={essence.hasComparison()}/>
    <Tooltip
      hoveredPoint={hoveredPoint}
      stage={plottingStage}
      xSeries={series}
      split={mainSplit}
      timezone={essence.timezone}
      showPrevious={essence.hasComparison()}/>
    <svg viewBox={stage.getViewBox()}>
      <GridLines orientation={"vertical"} stage={plottingStage} ticks={ticks} scale={scale}/>
      <XAxis
        scale={scale}
        stage={calculateBeeswarmXAxisStage(plottingStage)}
        ticks={ticks}
        formatter={series.formatter()}
        tickSize={TICK_SIZE}/>
      <g transform={plottingStage.getTransform()}>
        {pointsBetweenThresholds.map((datum) =>
          <Point key={`point-${mainSplit.selectValue(datum.data)}`} datum={datum.data} x={datum.x} y={datum.y} r={datum.r} setHover={setPointHover} resetHover={resetPointHover}/>
        )}
        {areaAboveThreshold.length > 0 && <Area data={areaAboveThreshold} x={bottomXAreaPosition} y={bottomYAreaPosition} onClick={handleAreaClick} />}
        {areaBelowThreshold.length > 0 && <Area data={areaBelowThreshold} x={topXAreaPosition} y={topYAreaPosition} onClick={handleAreaClick} />}
      </g>
    </svg>
  </div>;
}

interface AreaTooltipProps {
  split: Split;
  hoveredArea: HoveredArea | null;
  stage: Stage;
  xSeries: ConcreteSeries;
  showPrevious: boolean;
  timezone: Timezone;
  handleModalClose(): void;
}

export const AreaTooltip: React.FunctionComponent<AreaTooltipProps> = ({
  hoveredArea,
  xSeries,
  split,
  showPrevious,
  timezone,
  handleModalClose
}) => {
  if (!isTruthy(hoveredArea)) return null;

  const {data} = hoveredArea;

  return <Modal title={xSeries.title()} onClose={handleModalClose}>
    { // TODO: Timeshift support
      data.map(datum =>
        <span>{split.formatValue(datum, timezone)} {xSeries.formatValue(datum)}<br/></span>
      )
    }
  </Modal>;
};

interface AreaProps {
  data: Datum[];
  x: number;
  y: number;
  r?: number;
  onClick(area: HoveredArea): void;
}

const AREA_RADIUS = 12;

export const Area: React.FunctionComponent<AreaProps> =  ({ data, x, y, r = AREA_RADIUS, onClick }) => {
  return (
      <circle
        onClick={() => onClick({ x, y, data })}
        cx={x}
        cy={y}
        r={r}
        fillOpacity="0.5"
        className="area"
      />

  );
};
