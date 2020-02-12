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

import * as d3 from "d3";
import { Dataset, Datum, FlattenOptions, PseudoDatum } from "plywood";
import * as React from "react";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { SeriesDerivation } from "../../../common/models/series/concrete-series";
import { Series } from "../../../common/models/series/series";
import { SeriesSort, SortDirection } from "../../../common/models/sort/sort";
import { integerDivision } from "../../../common/utils/general/general";
import { ImmutableRecord } from "../../../common/utils/immutable-utils/immutable-utils";
import { TableSettings } from "../../../common/visualization-manifests/table/settings";
import { TABLE_MANIFEST } from "../../../common/visualization-manifests/table/table";
import { HighlightModal } from "../../components/highlight-modal/highlight-modal";
import { Direction, ResizeHandle } from "../../components/resize-handle/resize-handle";
import { Scroller, ScrollerLayout } from "../../components/scroller/scroller";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import { MeasureRows } from "./body/measures/measure-rows";
import { nestedSplitName } from "./body/splits/nested-split-name";
import { SplitRows } from "./body/splits/split-rows";
import { MeasuresHeader } from "./header/measures/measures-header";
import { SplitsHeader } from "./header/splits/splits-header";
import { Highlighter } from "./highlight/highlight";
import "./table.scss";
import { getFilterFromDatum } from "./utils/filter-for-datum";

const HIGHLIGHT_BUBBLE_V_OFFSET = -4;
const HEADER_HEIGHT = 38;
const SEGMENT_WIDTH = 300;
const THUMBNAIL_SEGMENT_WIDTH = 150;
export const INDENT_WIDTH = 25;
const MEASURE_WIDTH = 130;
export const ROW_HEIGHT = 30;
export const SPACE_LEFT = 10;
const SPACE_RIGHT = 10;
const MIN_DIMENSION_WIDTH = 100;

function indexToColumnType(index: number): ColumnType {
  return [ColumnType.CURRENT, ColumnType.PREVIOUS, ColumnType.DELTA][index % 3];
}

function getSortPeriod(columnType: ColumnType): SeriesDerivation {
  switch (columnType) {
    case ColumnType.CURRENT:
      return SeriesDerivation.CURRENT;
    case ColumnType.PREVIOUS:
      return SeriesDerivation.PREVIOUS;
    case ColumnType.DELTA:
      return SeriesDerivation.DELTA;
  }
}

export enum ColumnType { CURRENT, PREVIOUS, DELTA }

export enum HoverElement { CORNER, ROW, HEADER, WHITESPACE, SPACE_LEFT }

export interface PositionHover {
  element: HoverElement;
  series?: Series;
  columnType?: ColumnType;
  row?: Datum;
}

export interface TableState extends BaseVisualizationState {
  flatData?: PseudoDatum[];
  hoverRow?: Datum;
  segmentWidth: number;
}

export class Table extends BaseVisualization<TableState> {
  protected className = TABLE_MANIFEST.name;
  protected innerTableRef = React.createRef<HTMLDivElement>();

  getDefaultState(): TableState {
    return {
      flatData: null,
      hoverRow: null,
      segmentWidth: this.defaultSegmentWidth(),
      ...super.getDefaultState()
    };
  }

  defaultSegmentWidth(): number {
    const { isThumbnail } = this.props;

    return isThumbnail ? THUMBNAIL_SEGMENT_WIDTH : SEGMENT_WIDTH;
  }

  maxSegmentWidth(): number {
    if (this.innerTableRef.current) {
      return this.innerTableRef.current.clientWidth - MIN_DIMENSION_WIDTH;
    }

    return this.defaultSegmentWidth();
  }

  getSegmentWidth(): number {
    const { segmentWidth } = this.state;
    return segmentWidth || this.defaultSegmentWidth();
  }

  calculateMousePosition(x: number, y: number): PositionHover {
    const { essence } = this.props;
    const { flatData } = this.state;

    if (x <= SPACE_LEFT) return { element: HoverElement.SPACE_LEFT };
    x -= SPACE_LEFT;

    if (y <= HEADER_HEIGHT) {
      if (x <= this.getSegmentWidth()) return { element: HoverElement.CORNER };
      const seriesList = essence.series.series;

      x = x - this.getSegmentWidth();
      const seriesWidth = this.getIdealColumnWidth();
      const seriesIndex = Math.floor(x / seriesWidth);
      if (essence.hasComparison()) {
        const nominalIndex = integerDivision(seriesIndex, 3);
        const series = seriesList.get(nominalIndex);
        if (!series) return { element: HoverElement.WHITESPACE };
        const columnType = indexToColumnType(seriesIndex);
        return { element: HoverElement.HEADER, series, columnType };
      }
      const series = seriesList.get(seriesIndex);
      if (!series) return { element: HoverElement.WHITESPACE };
      return { element: HoverElement.HEADER, series, columnType: ColumnType.CURRENT };
    }

    y = y - HEADER_HEIGHT;
    const rowIndex = Math.floor(y / ROW_HEIGHT);
    const datum = flatData ? flatData[rowIndex] : null;
    if (!datum) return { element: HoverElement.WHITESPACE };
    return { element: HoverElement.ROW, row: datum };
  }

  private setSort({ series, element, columnType }: PositionHover) {
    const { clicker, essence } = this.props;
    const { splits } = essence;
    switch (element) {
      case HoverElement.CORNER:
        clicker.changeSplits(splits.setSortToDimension(), VisStrategy.KeepAlways); // set each to dimension ascending
        return;
      case HoverElement.HEADER:
        const period = getSortPeriod(columnType);
        const commonSort = essence.getCommonSort();
        const reference = series.key();
        const sort = new SeriesSort({ reference, period, direction: SortDirection.descending });
        const sortWithDirection = commonSort && commonSort.equals(sort) ? sort.set("direction", SortDirection.ascending) : sort;
        clicker.changeSplits(splits.changeSort(sortWithDirection), VisStrategy.KeepAlways); // set all to measure
        return;
    }
    throw new Error(`Can't create sort reference for position element: ${element}`);
  }

  onClick = (x: number, y: number) => {
    const { essence: { splits } } = this.props;

    const mousePos = this.calculateMousePosition(x, y);
    const { row, element } = mousePos;

    switch (element) {
      case HoverElement.CORNER:
        this.setSort(mousePos);
        return;
      case HoverElement.HEADER:
        this.setSort(mousePos);
        return;
      case HoverElement.ROW:
        const rowHighlight = getFilterFromDatum(splits, row);

        if (!rowHighlight) return;

        if (this.hasHighlight()) {
          if (rowHighlight.equals(this.getHighlightClauses())) {
            this.dropHighlight();
            return;
          }
        }

        this.highlight(rowHighlight, null);
        return;
      default:
        return;
    }
  }

  setHoverRow = (x: number, y: number) => {
    const { hoverRow } = this.state;
    const { row } = this.calculateMousePosition(x, y);
    if (hoverRow !== row) {
      this.setState({ hoverRow: row });
    }
  }

  resetHover = () => {
    const { hoverRow } = this.state;
    if (hoverRow) {
      this.setState({ hoverRow: null });
    }
  }

  setScroll = (scrollTop: number, scrollLeft: number) => this.setState({ scrollLeft, scrollTop });

  setSegmentWidth = (segmentWidth: number) => this.setState({ segmentWidth });

  private flattenOptions(): FlattenOptions {
    if (this.shouldCollapseRows()) {
      return { order: "inline", nestingName: "__nest" };
    }
    return { order: "preorder", nestingName: "__nest" };
  }

  deriveDatasetState(dataset: Dataset): Partial<TableState> {
    if (!this.props.essence.splits.length()) return {};
    const flatDataset = dataset.flatten(this.flattenOptions());
    const flatData = flatDataset.data;
    return { flatData };
  }

  private getScalesForColumns(essence: Essence, flatData: PseudoDatum[]): Array<d3.scale.Linear<number, number>> {
    const concreteSeries = essence.getConcreteSeries().toArray();
    const splitLength = essence.splits.length();

    return concreteSeries.map(series => {
      const measureValues = flatData
        .filter((d: Datum) => d["__nest"] === splitLength)
        .map((d: Datum) => series.selectValue(d));

      return d3.scale.linear()
      // Ensure that 0 is in there
        .domain(d3.extent([0, ...measureValues]))
        .range([0, 100]);
    });
  }

  private getIdealColumnWidth(): number {
    const availableWidth = this.props.stage.width - SPACE_LEFT - this.getSegmentWidth();
    const columnsCount = this.columnsCount();

    return columnsCount * MEASURE_WIDTH >= availableWidth ? MEASURE_WIDTH : availableWidth / columnsCount;
  }

  private getVisibleIndices(rowCount: number, height: number): [number, number] {
    const { scrollTop } = this.state;

    return [
      Math.max(0, Math.floor(scrollTop / ROW_HEIGHT)),
      Math.min(rowCount, Math.ceil((scrollTop + height) / ROW_HEIGHT))
    ];
  }

  private columnsCount(): number {
    const { essence } = this.props;
    const seriesCount = essence.getConcreteSeries().count();
    return essence.hasComparison() ? seriesCount * 3 : seriesCount;
  }

  private shouldCollapseRows(): boolean {
    const { essence: { visualizationSettings } } = this.props;
    const { collapseRows } = visualizationSettings as ImmutableRecord<TableSettings>;
    return collapseRows;
  }

  private selectedRowIdx(): number | null {
    const { essence } = this.props;
    const { flatData } = this.state;
    if (!flatData) return null;
    if (!this.hasHighlight()) return null;
    const { splits } = essence;
    const idx = flatData.findIndex(d => this.getHighlightClauses().equals(getFilterFromDatum(splits, d)));
    if (idx >= 0) return idx;
    return null;
  }

  protected renderInternals() {
    const { essence, stage } = this.props;
    const { flatData, scrollTop, hoverRow, segmentWidth } = this.state;
    const collapseRows = this.shouldCollapseRows();

    const selectedIdx = this.selectedRowIdx();
    const columnWidth = this.getIdealColumnWidth();

    const columnsCount = this.columnsCount();
    const visibleRows = this.getVisibleIndices(flatData.length, stage.height);
    const showHighlight = selectedIdx !== null && flatData;

    const scrollerLayout: ScrollerLayout = {
      // Inner dimensions
      bodyWidth: columnWidth * columnsCount + SPACE_RIGHT,
      bodyHeight: flatData ? flatData.length * ROW_HEIGHT : 0,

      // Gutters
      top: HEADER_HEIGHT,
      right: 0,
      bottom: 0,
      left: this.getSegmentWidth()
    };

    return <div className="internals table-inner" ref={this.innerTableRef}>
      <ResizeHandle
        direction={Direction.LEFT}
        onResize={this.setSegmentWidth}
        min={this.defaultSegmentWidth()}
        max={this.maxSegmentWidth()}
        value={segmentWidth}
      />
      <Scroller
        ref="scroller"
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
          selectedIdx={selectedIdx}
          visibleRows={visibleRows}
          hoverRow={hoverRow}
          essence={essence}
          data={flatData}
          segmentWidth={this.getSegmentWidth()} />
        }

        topLeftCorner={<SplitsHeader essence={essence} collapseRows={collapseRows} />}

        body={flatData &&
        <MeasureRows
          hoverRow={hoverRow}
          visibleRows={visibleRows}
          essence={essence}
          selectedIdx={selectedIdx}
          scales={this.getScalesForColumns(essence, flatData)}
          data={flatData}
          cellWidth={columnWidth}
          rowWidth={columnWidth * columnsCount} />}

        overlay={showHighlight && <Highlighter
          highlightedIndex={selectedIdx}
          highlightedNesting={flatData[selectedIdx].__nest}
          scrollTopOffset={scrollTop}
          collapseRows={collapseRows} />}

        onClick={this.onClick}
        onMouseMove={this.setHoverRow}
        onMouseLeave={this.resetHover}
        onScroll={this.setScroll}

      />

      {selectedIdx !== null &&
      <HighlightModal
        title={nestedSplitName(flatData[selectedIdx], essence)}
        left={stage.x + stage.width / 2}
        top={stage.y + HEADER_HEIGHT + (selectedIdx * ROW_HEIGHT) - scrollTop - HIGHLIGHT_BUBBLE_V_OFFSET}
        acceptHighlight={this.acceptHighlight}
        dropHighlight={this.dropHighlight} />}
    </div>;
  }
}
