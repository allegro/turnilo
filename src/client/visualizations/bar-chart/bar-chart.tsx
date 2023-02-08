/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import React from "react";
import { or } from "../../../common/utils/functional/functional";
import { Predicates } from "../../../common/utils/rules/predicates";
import {
  TimeSeriesVisualizationControls
} from "../../components/timeseries-visualization-controls/visualization-controls";
import {
  ChartPanel,
  DefaultVisualizationControls,
  VisualizationProps
} from "../../views/cube-view/center-panel/center-panel";
import "./bar-chart.scss";
import { BarChart as ImprovedBarChart } from "./improved-bar-chart/bar-chart";
import { BarChart } from "./old-bar-chart/old-bar-chart";

const newVersionSupports = or(
  Predicates.areExactSplitKinds("time"),
  Predicates.areExactSplitKinds("*", "time"),
  Predicates.areExactSplitKinds("number"),
  Predicates.areExactSplitKinds("*", "number")
);

export default function BarChartVisualization(props: VisualizationProps) {
  if (newVersionSupports(props.essence)) {
    return <React.Fragment>
      <TimeSeriesVisualizationControls {...props} />
      <ChartPanel {...props} chartComponent={ImprovedBarChart} />
    </React.Fragment>;
  }
  return <React.Fragment>
    <DefaultVisualizationControls {...props} />
    <ChartPanel {...props} chartComponent={BarChart}/>
  </React.Fragment>;
}
