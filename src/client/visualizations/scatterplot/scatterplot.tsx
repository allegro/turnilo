/*
 * Copyright 2017-2022 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use file except in compliance with the License.
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
import React, { useCallback, useState } from "react";
import { ChartProps } from "../../../common/models/chart-props/chart-props";
import { ScatterplotChart } from "./scatterplot-chart";

import makeQuery from "../../../common/utils/query/visualization-query";
import {
  ChartPanel,
  DefaultVisualizationControls,
  VisualizationProps
} from "../../views/cube-view/center-panel/center-panel";
import { BeeswarmChart } from "./beeswarm-chart";

import "./scatterplot.scss";

export interface HoveredPoint {
  datum: Datum;
  x: number;
  y: number;
}

export const Scatterplot: React.FunctionComponent<ChartProps> = props => {
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint>(null);

  const setPointHover = useCallback((hoveredPoint: HoveredPoint): void => setHoveredPoint(hoveredPoint), [setHoveredPoint]);

  const resetPointHover = useCallback((): void => setHoveredPoint(null), [setHoveredPoint]);

  if (props.essence.series.count() === 1) {
      return <BeeswarmChart {...props} setPointHover={setPointHover} resetPointHover={resetPointHover} hoveredPoint={hoveredPoint}/>;
    }

  return <ScatterplotChart {...props} setPointHover={setPointHover} resetPointHover={resetPointHover} hoveredPoint={hoveredPoint}/>;
};

export default function ScatterplotVisualization(props: VisualizationProps) {
  return <React.Fragment>
    <DefaultVisualizationControls {...props} />
    <ChartPanel {...props} queryFactory={makeQuery} chartComponent={Scatterplot}/>
  </React.Fragment>;
}
