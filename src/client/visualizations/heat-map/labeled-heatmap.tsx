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

import { Timezone } from "chronoshift";
import { List } from "immutable";
import { Datum } from "plywood";
import React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Stage } from "../../../common/models/stage/stage";
import { formatSegment } from "../../../common/utils/formatter/formatter";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { ColorLegend } from "../../components/color-legend/color-legend";
import { LegendSpot } from "../../components/pinboard-panel/pinboard-panel";
import { Scroller, ScrollerLayout, ScrollerPart } from "../../components/scroller/scroller";
import { clamp } from "../../utils/dom/dom";
import { LinearScale } from "../../utils/linear-scale/linear-scale";
import { Highlight } from "../highlight-controller/highlight";
import "./heat-map.scss";
import { HeatmapCorner } from "./heatmap-corner";
import { HeatmapHighlightIndicator } from "./heatmap-highlight-indicator";
import { HeatmapHighlightModal } from "./heatmap-highlight-modal";
import { HeatmapHoverIndicator } from "./heatmap-hover-indicator";
import { HeatmapHoverTooltip } from "./heatmap-hover-tooltip";
import { HeatmapLabels } from "./heatmap-labels";
import { HeatMapRectangles } from "./heatmap-rectangles";
import createHighlightClauses, { isClickablePart } from "./utils/create-highlight-clauses";
import getHighlightPosition from "./utils/get-highlight-position";
import getHoverPosition, { HoverPosition } from "./utils/get-hover-position";
import { modalTitle } from "./utils/modal-title";
import { nestedDataset } from "./utils/nested-dataset";
import { ColorScale } from "./utils/scales";
import scrollerLayout from "./utils/scroller-layout";

interface LabelledHeatmapProps {
  stage: Stage;
  essence: Essence;
  dataset: Datum[];
  xScale: LinearScale;
  yScale: LinearScale;
  colorScale: ColorScale;

  highlight: Highlight | null;
  saveHighlight: Unary<List<FilterClause>, void>;
  dropHighlight: Fn;
  acceptHighlight: Fn;
}

interface LabelledHeatmapState {
  scrollLeft: number;
  scrollTop: number;
  hoverPosition: HoverPosition | null;
  leftLabelsWidth: number;
  topLabelsHeight: number;
}

export const TILE_SIZE = 25;
export const TILE_GAP = 2;
export const MIN_LEFT_LABELS_WIDTH = 100;
export const MAX_LEFT_LABELS_WIDTH = 200;
export const MIN_TOP_LABELS_HEIGHT = 100;
export const MAX_TOP_LABELS_HEIGHT = 150;

function formatSegments(dataset: Datum[], fieldName: string, timezone: Timezone): string[] {
  return dataset.map(datum => formatSegment(datum[fieldName], timezone));
}

export class LabelledHeatmap extends React.PureComponent<LabelledHeatmapProps, LabelledHeatmapState> {
  state: LabelledHeatmapState = {
    hoverPosition: null,
    leftLabelsWidth: 0,
    topLabelsHeight: 0,
    scrollLeft: 0,
    scrollTop: 0
  };

  saveHover = (x: number, y: number, part: ScrollerPart) => {
    const { xScale, yScale } = this.props;
    const hoverPosition = getHoverPosition(xScale, yScale, x, y, part, this.layout());
    this.setState({ hoverPosition });
  };

  resetHover = () => this.setState({ hoverPosition: null });

  saveScroll = (scrollTop: number, scrollLeft: number) => this.setState({ scrollLeft, scrollTop });

  saveLeftLabelWidth = (maxLabelWidth: number) => this.setState({ leftLabelsWidth: clamp(maxLabelWidth, MIN_LEFT_LABELS_WIDTH, MAX_LEFT_LABELS_WIDTH) });

  saveTopLabelHeight = (maxLabelHeight: number) => this.setState({ topLabelsHeight: clamp(maxLabelHeight, MIN_TOP_LABELS_HEIGHT, MAX_TOP_LABELS_HEIGHT) });

  handleHighlight = (x: number, y: number, part: ScrollerPart) => {
    if (!isClickablePart(part)) return;
    const { saveHighlight, essence, dataset } = this.props;
    const layout = this.layout();
    const clauses = createHighlightClauses({ x: x - layout.left, y: y - layout.top, part }, essence, dataset);
    if (clauses.length > 0) {
      saveHighlight(List(clauses));
    }
  };

  private layout(): ScrollerLayout {
    const { topLabelsHeight, leftLabelsWidth } = this.state;
    const { dataset } = this.props;
    return scrollerLayout(dataset, topLabelsHeight, leftLabelsWidth);
  }

  render() {
    const { stage, colorScale, xScale, yScale, dataset, essence, highlight, acceptHighlight, dropHighlight } = this.props;
    const { scrollLeft, scrollTop, hoverPosition, topLabelsHeight } = this.state;

    const series = essence.getConcreteSeries().first();
    const { splits: { splits }, timezone } = essence;
    const firstSplit = splits.get(0);
    const secondSplit = splits.get(1);

    const leftLabels = formatSegments(dataset, firstSplit.reference, timezone);
    const topLabels = formatSegments(nestedDataset(dataset[0]), secondSplit.reference, timezone);

    const highlightPosition = getHighlightPosition(highlight, essence, dataset);

    const layout = this.layout();

    return <React.Fragment>
      <Scroller
        onClick={this.handleHighlight}
        onMouseMove={this.saveHover}
        onMouseLeave={this.resetHover}
        onScroll={this.saveScroll}

        layout={layout}

        topLeftCorner={<HeatmapCorner
          width={layout.left}
          height={layout.top}
          essence={essence}/>}

        topGutter={<HeatmapLabels
          orientation="top"
          labels={topLabels}
          hoveredLabel={hoverPosition ? hoverPosition.column : -1}
          highlightedLabel={highlightPosition ? highlightPosition.column : -1}
          onMaxLabelSize={this.saveTopLabelHeight}
          labelSize={topLabelsHeight} />}

        leftGutter={<HeatmapLabels
          orientation="left"
          labels={leftLabels}
          hoveredLabel={hoverPosition ? hoverPosition.row : -1}
          highlightedLabel={highlightPosition ? highlightPosition.row : -1}
          onMaxLabelSize={this.saveLeftLabelWidth} />}

        body={<React.Fragment>
          <HeatMapRectangles
            key="heatmap"
            dataset={dataset}
            series={series}
            xScale={xScale}
            yScale={yScale}
            colorScale={colorScale}
            tileSize={TILE_SIZE}
            gap={TILE_GAP}
            leftLabelName={firstSplit.reference}
            topLabelName={secondSplit.reference} />
          {highlightPosition && <HeatmapHighlightIndicator
            position={highlightPosition}
            height={layout.bodyHeight}
            width={layout.bodyWidth}
            tileSize={TILE_SIZE}
            tileGap={TILE_GAP} />}
          {hoverPosition && <HeatmapHoverIndicator
            tileSize={TILE_SIZE}
            tileGap={TILE_GAP}
            hoverPosition={hoverPosition} />}
        </React.Fragment>}
      />
      <LegendSpot>
        <ColorLegend
          title={series.title()}
          formatter={series.formatter()}
          colorScale={colorScale} />
      </LegendSpot>
      {highlightPosition && <HeatmapHighlightModal
        title={modalTitle(highlightPosition, dataset, essence)}
        position={highlightPosition}
        stage={stage}
        layout={layout}
        scroll={{ left: scrollLeft, top: scrollTop }}
        dropHighlight={dropHighlight}
        acceptHighlight={acceptHighlight} />}
      {hoverPosition && <HeatmapHoverTooltip
        scroll={{ left: scrollLeft, top: scrollTop }}
        dataset={dataset}
        position={hoverPosition}
        essence={essence} />}
    </React.Fragment>;
  }
}
