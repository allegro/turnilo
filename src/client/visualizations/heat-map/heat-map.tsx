/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Dataset } from "plywood";
import * as React from "react";
import { MeasureDerivation } from "../../../common/models/measure/measure";
import { seriesFormatter } from "../../../common/utils/formatter/formatter";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./heat-map.scss";
import { Total } from "../totals/total";
import { HEAT_MAP_MANIFEST } from "../../../common/manifests/heat-map/heat-map";
import { HeatMapRectangles } from "./heatmap-rectangles";

export class HeatMap extends BaseVisualization<BaseVisualizationState> {
  protected className = HEAT_MAP_MANIFEST.name;

  renderTotals(dataset: Dataset): JSX.Element[] {
    const { essence } = this.props;
    const measures = essence.getSeriesWithMeasures();
    const datum = dataset.data[0];
    return measures.map(({ series, measure }) => {
      const currentValue = datum[measure.name] as number;
      const previousValue = essence.hasComparison() && datum[measure.getDerivedName(MeasureDerivation.PREVIOUS)] as number;

      return <Total
        key={measure.name}
        name={measure.title}
        value={currentValue}
        previous={previousValue}
        lowerIsBetter={measure.lowerIsBetter}
        formatter={seriesFormatter(series.format, measure)}
      />;
    }).toArray();

  }

  renderInternals(dataset: Dataset) {
    return (
      <HeatMapRectangles />
    );  
  }
}
