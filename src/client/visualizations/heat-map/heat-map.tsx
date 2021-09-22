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
import * as React from "react";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Split } from "../../../common/models/split/split";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { HEAT_MAP_MANIFEST } from "../../../common/visualization-manifests/heat-map/heat-map";
import { SPLIT } from "../../config/constants";
import { fillDatasetWithMissingValues } from "../../utils/dataset/sparse-dataset/dataset";
import { CenterPanel, CenterProps } from "../../views/cube-view/center-panel/center-panel";
import "./heat-map.scss";
import { LabelledHeatmap, TILE_SIZE } from "./labeled-heatmap";
import scales from "./utils/scales";

export function HeatMap(props: CenterProps) {
  return <CenterPanel {...props} visualizationComponent={HeatMapComponent} />;
}

export class HeatMapComponent extends React.Component<VisualizationProps> {
  protected className = HEAT_MAP_MANIFEST.name;

  getScales = memoizeOne(scales);
  prepareDataset = memoizeOne(
    (data: Dataset, series: ConcreteSeries, split: Split, timezone: Timezone) =>
    fillDatasetWithMissingValues((data.data[0][SPLIT] as Dataset), series.plywoodKey(), split, timezone),
    ([nextData], [oldData]) => nextData === oldData);

  render() {
    const { essence, stage, highlight, data, saveHighlight, acceptHighlight, dropHighlight } = this.props;
    const { timezone, splits: { splits } } = essence;
    const series = essence.getConcreteSeries().first();
    const secondSplit = splits.get(1);
    const dataset = this.prepareDataset(data, series, secondSplit, timezone);

    const { x, y, color } = this.getScales(dataset.data, TILE_SIZE, series);

    return <div className="heatmap-container" style={{ maxHeight: stage.height }}>
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
