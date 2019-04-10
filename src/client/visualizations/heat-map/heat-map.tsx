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

import { TooltipWithBounds, withTooltip, WithTooltipProps } from "@vx/tooltip";
import memoize = require("memoizee");
import { Dataset } from "plywood";
import * as React from "react";
import { HEAT_MAP_MANIFEST } from "../../../common/manifests/heat-map/heat-map";
import { SortDirection } from "../../../common/models/sort/sort";
import { Split, SplitType } from "../../../common/models/split/split";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { formatValue } from "../../../common/utils/formatter/formatter";
import { SegmentBubbleContent } from "../../components/segment-bubble/segment-bubble";
import { SPLIT } from "../../config/constants";
import { fillDataset, Sort, sortByTimeDimensionDecreasing, sortByTimeDimensionIncreasing, sortByValueDecreasing, sortByValueIncreasing } from "../../utils/dataset/dataset";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./heat-map.scss";
import { RectangleData } from "./heatmap-rectangles";
import { LabelledHeatmap } from "./labelled-heatmap";

const memoizedFillDataset = memoize(fillDataset);

const splitToFillSort = memoize((split: Split): Sort<any> => {
  const sort = split.sort;
  switch (split.type) {
    case SplitType.string:
    case SplitType.number:
    default:
      if (sort.direction === SortDirection.ascending) {
        return sortByValueIncreasing;
      } else {
        return sortByValueDecreasing;
      }
    case SplitType.time:
      if (sort.direction === SortDirection.ascending) {
        return sortByTimeDimensionIncreasing;
      } else {
        return sortByTimeDimensionDecreasing;
      }
  }
});

class UndecoratedHeatMap extends BaseVisualization<BaseVisualizationState, WithTooltipProps<RectangleData>> {
  protected className = HEAT_MAP_MANIFEST.name;
  private container: HTMLDivElement | null = null;

  handleRectangleHover = (tooltipData: RectangleData) => {
    setTimeout(() => {
      if (!this.container) {
        return;
      }
      const { x, y } = tooltipData;
      const { top, left } = this.container.getBoundingClientRect();

      this.props.showTooltip({
        tooltipLeft: x - left,
        tooltipTop: y - top,
        tooltipData
      });
    }, 0);
  }

  renderInternals(dataset: Dataset) {
    const {
      tooltipData,
      tooltipLeft,
      tooltipTop,
      tooltipOpen,
      hideTooltip,
      essence
    } = this.props;

    const { timezone, series } = essence;
    const measure = essence.getEffectiveSelectedMeasures().toArray()[0];
    const [_, secondSplit] = essence.splits.splits.toArray();
    const preparedDataset = memoizedFillDataset(
      (dataset.data[0][SPLIT] as Dataset),
      measure.name,
      secondSplit.reference,
      splitToFillSort(secondSplit)
    ).data;

    return <div ref={container => this.container = container} className="internals heatmap-container" style={{ maxHeight: this.props.stage.height }}>
      <LabelledHeatmap
        dataset={preparedDataset}
        essence={this.props.essence}
        onHover={this.handleRectangleHover}
        onHoverStop={hideTooltip}
      />
      {tooltipOpen && (
        <TooltipWithBounds
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <SegmentBubbleContent
            title={`${formatValue(tooltipData.xLabel, timezone, { formatOnlyStartDate: true })} - ${formatValue(tooltipData.yLabel, timezone, { formatOnlyStartDate: true })}`}
            content={measure.formatDatum(tooltipData.datum, series.getSeries(measure.name).format)}
          />
        </TooltipWithBounds>
      )}
    </div>;
  }
}

export const HeatMap = withTooltip<VisualizationProps>(UndecoratedHeatMap, {
  style: {
    position: "relative",
    height: "100%"
  }
});
