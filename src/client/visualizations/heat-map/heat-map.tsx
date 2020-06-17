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

import memoizeOne from "memoize-one";
import { Dataset } from "plywood";
import * as React from "react";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { HEAT_MAP_MANIFEST } from "../../../common/visualization-manifests/heat-map/heat-map";
import { SPLIT } from "../../config/constants";
import { fillDatasetWithMissingValues } from "../../utils/dataset/sparse-dataset/dataset";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./heat-map.scss";
import { LabelledHeatmap, TILE_SIZE } from "./labeled-heatmap";
import scales from "./utils/scales";

interface HeatmapState extends BaseVisualizationState {
  preparedDataset: Dataset;
}

export class HeatMap extends BaseVisualization<HeatmapState> {
  protected className = HEAT_MAP_MANIFEST.name;

  getScales = memoizeOne(scales);

  series(): ConcreteSeries {
    return this.props.essence.getConcreteSeries().first();
  }

  renderInternals() {
    const { essence, stage } = this.props;

    const { preparedDataset: dataset } = this.state;

    const { x, y, color } = this.getScales(dataset.data, TILE_SIZE, this.series());

    return <div className="internals heatmap-container" style={{ maxHeight: stage.height }}>
      <LabelledHeatmap
        stage={stage}
        dataset={dataset.data}
        xScale={x}
        yScale={y}
        colorScale={color}
        saveHighlight={this.highlight}
        highlight={this.getHighlight()}
        acceptHighlight={this.acceptHighlight}
        dropHighlight={this.dropHighlight}
        essence={essence}
      />
    </div>;
  }

  deriveDatasetState(dataset: Dataset): Partial<HeatmapState> {
    const { essence } = this.props;
    const { timezone } = essence;
    const secondSplit = essence.splits.splits.get(1);

    const preparedDataset = fillDatasetWithMissingValues(
      (dataset.data[0][SPLIT] as Dataset),
      this.series().plywoodKey(),
      secondSplit,
      timezone
    );

    return { preparedDataset };
  }
}
