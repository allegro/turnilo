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

import { Dataset, Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { formatSegment } from "../../../common/utils/formatter/formatter";
import { noop } from "../../../common/utils/functional/functional";
import { Scroller } from "../../components/scroller/scroller";
import { SPLIT } from "../../config/constants";
import "./heat-map.scss";
import { HeatmapLabels } from "./heatmap-labels";
import { HeatMapRectangles, RectangleData } from "./heatmap-rectangles";

interface LabelledHeatmapProps {
  essence: Essence;
  dataset: Datum[];
  onHover?(data: RectangleData): void;
  onHoverStop?(): void;
}

interface LabelledHeatmapState {
  hoveredRectangle: RectangleData | null;
  leftLabelsWidth: number | null;
  topLabelsHeight: number | null;
}

const TILE_SIZE = 25;
const MAX_LEFT_LABELS_WIDTH = 200;
const MAX_TOP_LABELS_HEIGHT = 150;

export class LabelledHeatmap extends React.PureComponent<LabelledHeatmapProps, LabelledHeatmapState> {
  state: LabelledHeatmapState = {
    hoveredRectangle: null,
    leftLabelsWidth: null,
    topLabelsHeight: null
  };

  handleHover = (data: RectangleData) => {
    if (!this.state.hoveredRectangle || this.state.hoveredRectangle.datum !== data.datum) {
      this.setState({ hoveredRectangle: data });
    }
    const { onHover = noop } = this.props;
    onHover(data);
  };

  handleHoverStop = () => {
    this.setState({ hoveredRectangle: null });
    const { onHoverStop = noop } = this.props;
    onHoverStop();
  };

  handleMaxLabelWidth = (maxLabelWidth: number) => {
    this.setState({ leftLabelsWidth: Math.min(maxLabelWidth, MAX_LEFT_LABELS_WIDTH) });
  };

  handleMaxLabelHeight = (maxLabelHeight: number) => {
    this.setState({ topLabelsHeight: Math.min(maxLabelHeight, MAX_TOP_LABELS_HEIGHT) });
  };

  render() {
    const { dataset, essence } = this.props;
    const { hoveredRectangle, leftLabelsWidth, topLabelsHeight } = this.state;

    const series = essence.getConcreteSeries().first();
    const firstSplit = essence.splits.splits.get(0);
    const secondSplit = essence.splits.splits.get(1);

    const leftLabels = dataset.map(datum => formatSegment(
      datum[firstSplit.reference],
      this.props.essence.timezone
    ));
    const topLabels = (dataset[0][SPLIT] as Dataset).data.map(datum => formatSegment(
      datum[secondSplit.reference],
      this.props.essence.timezone
    ));

    return (
      <Scroller
        layout={{
          bodyHeight: leftLabels.length * TILE_SIZE,
          bodyWidth: topLabels.length * TILE_SIZE,
          top: topLabelsHeight || MAX_TOP_LABELS_HEIGHT,
          right: 0,
          bottom: 0,
          left: leftLabelsWidth || MAX_LEFT_LABELS_WIDTH
        }}
        topGutter={
          <HeatmapLabels
            orientation="top"
            labels={topLabels}
            hoveredLabel={hoveredRectangle ? hoveredRectangle.row : -1}
            onMaxLabelSize={this.handleMaxLabelHeight}
            labelSize={topLabelsHeight}
          />
        }
        leftGutter={
          <HeatmapLabels
            orientation="left"
            labels={leftLabels}
            hoveredLabel={hoveredRectangle ? hoveredRectangle.column : -1}
            onMaxLabelSize={this.handleMaxLabelWidth}
          />
        }
        topLeftCorner={<div className="top-left-corner-mask" />}
        body={[
          <HeatMapRectangles
            key="heatmap"
            onHover={this.handleHover}
            onHoverStop={this.handleHoverStop}
            dataset={dataset}
            series={series}
            hoveredRectangle={this.state.hoveredRectangle}
            leftLabelName={firstSplit.reference}
            topLabelName={secondSplit.reference}
            tileSize={TILE_SIZE}
          />
        ]}
      />
    );
  }
}
