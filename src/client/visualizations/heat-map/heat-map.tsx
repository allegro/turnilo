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

// For some reason tsc compiler does not see this file.
// Remove when issue is identified.
// tslint:disable-next-line: no-reference
/// <reference path="../../index.d.ts" />

import { Timezone } from "chronoshift";
import memoizeOne from "memoize-one";
import { Dataset } from "plywood";
import React from "react";
import { ChartProps } from "../../../common/models/chart-props/chart-props";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Split } from "../../../common/models/split/split";
import { HEAT_MAP_MANIFEST } from "../../../common/visualization-manifests/heat-map/heat-map";
import { SPLIT } from "../../config/constants";
import { fillDatasetWithMissingValues } from "../../utils/dataset/sparse-dataset/dataset";
import {
  ChartPanel,
  DefaultVisualizationControls,
  VisualizationProps
} from "../../views/cube-view/center-panel/center-panel";
import { SettingsContext, SettingsContextValue } from "../../views/cube-view/settings-context";
import "./heat-map.scss";
import { LabelledHeatmap, TILE_SIZE } from "./labeled-heatmap";
import scales from "./utils/scales";

export default function HeatMapVisualization(props: VisualizationProps) {
  return <React.Fragment>
    <DefaultVisualizationControls {...props} />
    <ChartPanel {...props} chartComponent={HeatMap}/>
  </React.Fragment>;
}

class HeatMap extends React.Component<ChartProps> {
  static contextType = SettingsContext;
  protected className = HEAT_MAP_MANIFEST.name;

  context: SettingsContextValue;

  getScales = memoizeOne(scales);
  prepareDataset = memoizeOne(
    (data: Dataset, series: ConcreteSeries, split: Split, timezone: Timezone) =>
      fillDatasetWithMissingValues((data.data[0][SPLIT] as Dataset), series.plywoodKey(), split, timezone),
    ([nextData], [oldData]) => nextData === oldData);

  render() {
    const { customization: { visualizationColors } } = this.context;
    const { essence, stage, highlight, data, saveHighlight, acceptHighlight, dropHighlight } = this.props;
    const { timezone, splits: { splits } } = essence;
    const series = essence.getConcreteSeries().first();
    const secondSplit = splits.get(1);
    const dataset = this.prepareDataset(data, series, secondSplit, timezone);

    const { x, y, color } = this.getScales(dataset.data, TILE_SIZE, visualizationColors.main, series);

    return <div className="heatmap-container" style={{ height: stage.height }}>
      <LabelledHeatmap
        stage={stage}
        dataset={dataset.data}
        xScale={x}
        yScale={y}
        colorScale={color}
        saveHighlight={saveHighlight}
        highlight={highlight}
        acceptHighlight={acceptHighlight}
        dropHighlight={dropHighlight}
        essence={essence}
      />
    </div>;
  }
}
