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

import { Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../common/models/essence/essence";
import { Stage } from "../../../../common/models/stage/stage";
import { Binary, Nullary, Ternary, Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { HighlightModal } from "../../../components/highlight-modal/highlight-modal";
import { Direction, ResizeHandle } from "../../../components/resize-handle/resize-handle";
import { Scroller, ScrollerLayout, ScrollerPart } from "../../../components/scroller/scroller";
import { HEADER_HEIGHT, ROW_HEIGHT, SEGMENT_WIDTH, SPACE_RIGHT } from "../../../components/tabular-scroller/dimensions";
import { MeasuresHeader } from "../../../components/tabular-scroller/header/measures/measures-header";
import { MeasureRows } from "../../../components/tabular-scroller/measures/measure-rows";
import { measureColumnsCount } from "../../../components/tabular-scroller/utils/measure-columns-count";
import { visibleIndexRange } from "../../../components/tabular-scroller/visible-rows/visible-index-range";
import { Highlight } from "../../highlight-controller/highlight";
import { nestedSplitName } from "../body/splits/nested-split-name";
import { SplitRows } from "../body/splits/split-rows";
import { SplitsHeader } from "../header/splits/splits-header";
import { Highlighter } from "../highlight/highlight";
import { getRowIndexForHighlight } from "../utils/get-row-index-for-highlight";
import { getScalesForColumns } from "../utils/get-scales-for-columns";

const HIGHLIGHT_BUBBLE_V_OFFSET = -4;

interface ScrolledTableProps {
  flatData: PseudoDatum[];
  essence: Essence;
  stage: Stage;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  highlight: Highlight | null;
  onClick: Ternary<number, number, ScrollerPart, void>;
  onMouseMove: Ternary<number, number, ScrollerPart, void>;
  onMouseLeave: Fn;
  onScroll: Binary<number, number, void>;
  setSegmentWidth: Unary<number, void>;
  columnWidth: number;
  segmentWidth: number;
  scrollTop: number;
  hoverRow?: Datum;
  collapseRows: boolean;
  availableWidth?: number;
}

export const ScrolledTable: React.SFC<ScrolledTableProps> = props => {
  const {
    essence,
    stage,
    flatData,
    onClick,
    onMouseMove,
    onMouseLeave,
    onScroll,
    setSegmentWidth,
    segmentWidth,
    columnWidth,
    scrollTop,
    acceptHighlight,
    highlight,
    hoverRow,
    collapseRows,
    dropHighlight,
    availableWidth
  } = props;
  const columnsCount = measureColumnsCount(essence);
  const rowsCount = flatData ? flatData.length : 0;
  const visibleRowsRange = visibleIndexRange(rowsCount, stage.height, scrollTop);
  const scrollerLayout: ScrollerLayout = {
    // Inner dimensions
    bodyWidth: columnWidth * columnsCount + SPACE_RIGHT,
    bodyHeight: rowsCount * ROW_HEIGHT,

    // Gutters
    top: HEADER_HEIGHT,
    right: 0,
    bottom: 0,
    left: segmentWidth
  };

  const highlightedRowIndex = getRowIndexForHighlight(essence, highlight, flatData);
  const showHighlight = highlightedRowIndex !== null && flatData;
  const maxSegmentWidth = availableWidth || SEGMENT_WIDTH;

  return <React.Fragment>
    <ResizeHandle
      direction={Direction.LEFT}
      onResize={setSegmentWidth}
      min={SEGMENT_WIDTH}
      max={maxSegmentWidth}
      value={segmentWidth}
    />
    <Scroller
      layout={scrollerLayout}

      topGutter={
        <MeasuresHeader
          cellWidth={columnWidth}
          series={essence.getConcreteSeries().toArray()}
          commonSort={essence.getCommonSort()}
          showPrevious={essence.hasComparison()}
        />
      }

      leftGutter={<SplitRows
        collapseRows={collapseRows}
        highlightedRowIndex={highlightedRowIndex}
        visibleRowsIndexRange={visibleRowsRange}
        hoverRow={hoverRow}
        essence={essence}
        data={flatData}
        segmentWidth={segmentWidth}/>
      }

      topLeftCorner={<SplitsHeader essence={essence} collapseRows={collapseRows}/>}

      body={flatData &&
      <MeasureRows
        hoverRow={hoverRow}
        visibleRowsIndexRange={visibleRowsRange}
        essence={essence}
        highlightedRowIndex={highlightedRowIndex}
        scales={getScalesForColumns(essence, flatData)}
        data={flatData}
        cellWidth={columnWidth}
        rowWidth={columnWidth * columnsCount}/>}

      overlay={showHighlight && <Highlighter
        highlightedIndex={highlightedRowIndex}
        highlightedNesting={flatData[highlightedRowIndex].__nest}
        scrollTopOffset={scrollTop}
        collapseRows={collapseRows}/>}

      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onScroll={onScroll}

    />
    {highlightedRowIndex !== null &&
    <HighlightModal
      title={nestedSplitName(flatData[highlightedRowIndex], essence)}
      left={stage.x + stage.width / 2}
      top={stage.y + HEADER_HEIGHT + (highlightedRowIndex * ROW_HEIGHT) - scrollTop - HIGHLIGHT_BUBBLE_V_OFFSET}
      acceptHighlight={acceptHighlight}
      dropHighlight={dropHighlight}/>}
  </React.Fragment>;
};
