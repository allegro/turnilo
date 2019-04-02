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
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./heat-map.scss";
import { HEAT_MAP_MANIFEST } from "../../../common/manifests/heat-map/heat-map";
import { HeatMapRectangles } from "./heatmap-rectangles";
import { SPLIT } from "../../config/constants";
import { formatValue } from "../../../common/utils/formatter/formatter";
import { Scroller } from "../../components/scroller/scroller";

export class HeatMap extends BaseVisualization<BaseVisualizationState> {
  protected className = HEAT_MAP_MANIFEST.name;

  renderInternals(dataset: Dataset) {
    // console.log(dataset);
    const [measure] = this.props.essence.getEffectiveSelectedMeasures().toArray();
    const [firstSplit, secondSplit] = this.props.essence.splits.splits.toArray();
    const leftLabels = (dataset.data[0][SPLIT] as Dataset).data.map(datum => formatValue(datum[firstSplit.reference], this.props.essence.timezone, { formatOnlyStartDate: true }));
    const topLabels = ((dataset.data[0][SPLIT] as Dataset).data[0][SPLIT] as Dataset).data.map(datum => formatValue(datum[secondSplit.reference], this.props.essence.timezone, { formatOnlyStartDate: true }));

    return <div className="internals heatmap-container" style={{ maxHeight: this.props.stage.height }}>
      <Scroller
        layout={{
          bodyHeight: leftLabels.length * 25,
          bodyWidth: topLabels.length * 25,
          top: 120,
          right: 0,
          bottom: 0,
          left: 200
        }}
        topGutter={
          <div className="top-labels">
            {topLabels.map(label => <span key={label as string}><span>{label}</span></span>)}
          </div>
        }
        leftGutter={
          <div className="left-labels">
            {leftLabels.map(label => <div key={label as string}><span>{label}</span></div>)}
          </div>
        }
        topLeftCorner={<div className="top-left-corner-mask" />}
        body={[
          <HeatMapRectangles key="heat-map" data={dataset} measureName={measure.name} />
        ]}
      />
    </div>;
  }
}
