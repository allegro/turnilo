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

import { TooltipProps, TooltipWithBounds, withTooltip } from "@vx/tooltip";
import { Dataset, Datum } from "plywood";
import * as React from "react";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { SortDirection } from "../../../common/models/sort/sort";
import { Split, SplitType } from "../../../common/models/split/split";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { formatSegment } from "../../../common/utils/formatter/formatter";
import { HEAT_MAP_MANIFEST } from "../../../common/visualization-manifests/heat-map/heat-map";
import { MeasureBubbleContent } from "../../components/measure-bubble-content/measure-bubble-content";
import { SegmentBubbleContent } from "../../components/segment-bubble/segment-bubble";
import { SPLIT } from "../../config/constants";
import {
  fillDatasetWithMissingValues,
  Order,
  orderByNumberRangeDimensionDecreasing,
  orderByNumberRangeDimensionIncreasing,
  orderByTimeDimensionDecreasing,
  orderByTimeDimensionIncreasing,
  orderByValueDecreasing,
  orderByValueIncreasing
} from "../../utils/dataset/dataset";
import { JSXNode } from "../../utils/dom/dom";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./heat-map.scss";
import { RectangleData } from "./heatmap-rectangles";
import { LabelledHeatmap } from "./labelled-heatmap";

type HeatmapState = BaseVisualizationState & { preparedDataset: Dataset };

export class HeatMap extends BaseVisualization<HeatmapState> {
  protected className = HEAT_MAP_MANIFEST.name;

  renderInternals() {
    return <HeatmapWithTooltip {...this.props} dataset={this.state.preparedDataset} />;
  }

  deriveDatasetState(dataset: Dataset): Partial<HeatmapState> {
    const { essence } = this.props;
    const { timezone } = essence;
    const concreteSeries = essence.getConcreteSeries().first();
    const secondSplit = essence.splits.splits.get(1);

    const preparedDataset = fillDatasetWithMissingValues(
      (dataset.data[0][SPLIT] as Dataset),
      concreteSeries.plywoodKey(),
      secondSplit.reference,
      splitToFillOrder(secondSplit),
      timezone
    );

    return { preparedDataset };
  }
}

const splitToFillOrder = (split: Split): Order<any> => {
  const sort = split.sort;
  switch (split.type) {
    case SplitType.string:
    default:
      if (sort.direction === SortDirection.ascending) {
        return orderByValueIncreasing;
      } else {
        return orderByValueDecreasing;
      }
    case SplitType.time:
      if (sort.direction === SortDirection.ascending) {
        return orderByTimeDimensionIncreasing;
      } else {
        return orderByTimeDimensionDecreasing;
      }
    case SplitType.number:
      if (sort.direction === SortDirection.ascending) {
        return orderByNumberRangeDimensionIncreasing;
      } else {
        return orderByNumberRangeDimensionDecreasing;
      }
  }
};

export class UndecoratedHeatmapWithTooltip extends React.Component<VisualizationProps & TooltipProps<RectangleData> & { dataset: Dataset }> {
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
  };

  renderDatum(datum: Datum, concreteSeries: ConcreteSeries): JSXNode {
    if (!this.props.essence.hasComparison()) {
      return concreteSeries.formatValue(datum);
    }
    const currentValue = concreteSeries.selectValue(datum);
    const previousValue = concreteSeries.selectValue(datum, SeriesDerivation.PREVIOUS);
    const formatter = concreteSeries.formatter();

    return <MeasureBubbleContent
      lowerIsBetter={concreteSeries.measure.lowerIsBetter}
      formatter={formatter}
      current={currentValue}
      previous={previousValue}
    />;
  }

  render() {
    const {
      tooltipData,
      tooltipLeft,
      tooltipTop,
      tooltipOpen,
      hideTooltip,
      essence,
      dataset
    } = this.props;

    const { timezone } = essence;
    const concreteSeries = essence.getConcreteSeries().first();

    return <div ref={container => this.container = container} className="internals heatmap-container" style={{ maxHeight: this.props.stage.height }}>
      <LabelledHeatmap
        dataset={dataset.data}
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
            title={`${formatSegment(tooltipData.xLabel, timezone)} - ${formatSegment(tooltipData.yLabel, timezone)}`}
            content={this.renderDatum(tooltipData.datum, concreteSeries)}
          />
        </TooltipWithBounds>
      )}
    </div>;
  }
}

export const HeatmapWithTooltip = withTooltip<VisualizationProps & { dataset: Dataset }>(UndecoratedHeatmapWithTooltip, {
  style: {
    position: "relative",
    height: "100%"
  }
});
