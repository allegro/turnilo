/*
 * Copyright 2017-2021 Allegro.pl
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

import * as d3 from "d3";
import { Dataset, Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { Stage } from "../../../common/models/stage/stage";
import { Binary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { Direction, ResizeHandle } from "../../components/resize-handle/resize-handle";
import { Scroller, ScrollerLayout, ScrollerPart } from "../../components/scroller/scroller";
import { HEADER_HEIGHT, ROW_HEIGHT, SEGMENT_WIDTH, SPACE_RIGHT } from "../../components/tabular-scroller/dimensions";
import { MeasuresHeader } from "../../components/tabular-scroller/header/measures/measures-header";
import { SplitColumnsHeader } from "../../components/tabular-scroller/header/splits/split-columns";
import { FlattenedSplits } from "../../components/tabular-scroller/splits/flattened-splits";
import { measureColumnsCount } from "../../components/tabular-scroller/utils/measure-columns-count";
import { visibleIndexRange } from "../../components/tabular-scroller/visible-rows/visible-index-range";
import { selectFirstSplitDatums } from "../../utils/dataset/selectors/selectors";
import { MeasureRows } from "./measure-rows";
import { mainSplit } from "./utils/main-split";

interface ScrolledGridProps {
  essence: Essence;
  data: Dataset;
  stage: Stage;
  handleClick: Ternary<number, number, ScrollerPart, void>;
  setScrollTop: Binary<number, number, void>;
  setSegmentWidth: Unary<number, void>;
  columnWidth: number;
  segmentWidth: number;
  availableWidth: number;
  scrollTop: number;
}

function getScalesForColumns(essence: Essence, flatData: PseudoDatum[]): Array<d3.scale.Linear<number, number>> {
  const concreteSeries = essence.getConcreteSeries().toArray();

  return concreteSeries.map(series => {
    const measureValues = flatData
      .map((d: Datum) => series.selectValue(d));

    return d3.scale.linear()
      // Ensure that 0 is in there
      .domain(d3.extent([0, ...measureValues]))
      .range([0, 100]);
  });
}

export const ScrolledGrid: React.SFC<ScrolledGridProps> = props => {
  const {
    essence,
    data,
    scrollTop,
    segmentWidth,
    setScrollTop,
    setSegmentWidth,
    handleClick,
    columnWidth,
    stage,
    availableWidth
  } = props;

  const datums = selectFirstSplitDatums(data);
  const rowsCount = datums.length;
  const visibleRowsRange = visibleIndexRange(rowsCount, stage.height, scrollTop);
  const columnsCount = measureColumnsCount(essence);
  const maxSegmentWidth = availableWidth || SEGMENT_WIDTH;
  const mainSort = mainSplit(essence).sort;

  const layout: ScrollerLayout = {
    bodyWidth: columnWidth * columnsCount + SPACE_RIGHT,
    bodyHeight: rowsCount * ROW_HEIGHT,
    bottom: 0,
    left: segmentWidth,
    right: 0,
    top: HEADER_HEIGHT
  };

  const { dataCube, splits } = essence;

  return <React.Fragment>
    <ResizeHandle
      direction={Direction.LEFT}
      onResize={setSegmentWidth}
      min={SEGMENT_WIDTH}
      max={maxSegmentWidth}
      value={segmentWidth}
    />
    <Scroller
      layout={layout}
      onScroll={setScrollTop}
      onClick={handleClick}
      topGutter={<MeasuresHeader
        cellWidth={columnWidth}
        series={essence.getConcreteSeries().toArray()}
        sort={mainSort}
        showPrevious={essence.hasComparison()}/>}

      leftGutter={<FlattenedSplits
        visibleRowsIndexRange={visibleRowsRange}
        essence={essence}
        data={datums}
        segmentWidth={segmentWidth}
        highlightedRowIndex={null}/>}

      topLeftCorner={<SplitColumnsHeader
        dataCube={dataCube}
        sort={mainSort}
        splits={splits} />}

      body={datums && <MeasureRows
        visibleRowsIndexRange={visibleRowsRange}
        essence={essence}
        highlightedRowIndex={null}
        scales={getScalesForColumns(essence, datums)}
        data={datums}
        cellWidth={columnWidth}
        rowWidth={columnWidth * columnsCount}/>}
    />
  </React.Fragment>;
};
