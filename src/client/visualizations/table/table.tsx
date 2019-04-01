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

import { Timezone } from "chronoshift";
import * as d3 from "d3";
import { List, Set } from "immutable";
import { Dataset, Datum, NumberRange, PseudoDatum, TimeRange } from "plywood";
import * as React from "react";
import { TABLE_MANIFEST } from "../../../common/manifests/table/table";
import { DateRange } from "../../../common/models/date-range/date-range";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { FixedTimeFilterClause, NumberFilterClause, StringFilterAction, StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter } from "../../../common/models/filter/filter";
import { Measure } from "../../../common/models/measure/measure";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { SeriesSort, SortDirection } from "../../../common/models/sort/sort";
import { SplitType } from "../../../common/models/split/split";
import { Splits } from "../../../common/models/splits/splits";
import { formatNumberRange } from "../../../common/utils/formatter/formatter";
import { flatMap } from "../../../common/utils/functional/functional";
import { integerDivision } from "../../../common/utils/general/general";
import { formatStartOfTimeRange } from "../../../common/utils/time/time";
import { Delta } from "../../components/delta/delta";
import { HighlightModal } from "../../components/highlight-modal/highlight-modal";
import { Scroller, ScrollerLayout } from "../../components/scroller/scroller";
import { SvgIcon } from "../../components/svg-icon/svg-icon";
import { classNames } from "../../utils/dom/dom";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./table.scss";

const HEADER_HEIGHT = 38;
const SEGMENT_WIDTH = 300;
const THUMBNAIL_SEGMENT_WIDTH = 150;
const INDENT_WIDTH = 25;
const MEASURE_WIDTH = 130;
const ROW_HEIGHT = 30;
const SPACE_LEFT = 10;
const SPACE_RIGHT = 10;
const HIGHLIGHT_BUBBLE_V_OFFSET = -4;

function formatSegment(value: any, timezone: Timezone): string {
  if (TimeRange.isTimeRange(value)) {
    return formatStartOfTimeRange(value, timezone);
  } else if (NumberRange.isNumberRange(value)) {
    return formatNumberRange(value);
  }
  return String(value);
}

function getFilterFromDatum(splits: Splits, flatDatum: PseudoDatum): Filter {
  const splitNesting = flatDatum["__nest"];
  const { splits: splitCombines } = splits;

  if (splitNesting === 0 || splitNesting > splitCombines.size) return null;

  const filterClauses = splitCombines
    .take(splitNesting)
    .map(({ reference, type }) => {
      const segment: any = flatDatum[reference];

      switch (type) {
        case SplitType.number:
          return new NumberFilterClause({ reference, values: List.of(segment) });
        case SplitType.time:
          return new FixedTimeFilterClause({ reference, values: List.of(new DateRange(segment)) });
        case SplitType.string:
          return new StringFilterClause({ reference, action: StringFilterAction.IN, values: Set.of(segment) });
      }
    });

  return new Filter({ clauses: List(filterClauses) });
}

function indexToColumnType(index: number): ColumnType {
  return [ColumnType.CURRENT, ColumnType.PREVIOUS, ColumnType.DELTA][index % 3];
}

export enum ColumnType { CURRENT, PREVIOUS, DELTA }

export enum HoverElement { CORNER, ROW, HEADER, WHITESPACE, SPACE_LEFT }

export interface PositionHover {
  element: HoverElement;
  series?: ConcreteSeries;
  columnType?: ColumnType;
  row?: Datum;
}

export interface TableState extends BaseVisualizationState {
  flatData?: PseudoDatum[];
  hoverRow?: Datum;
}

export class Table extends BaseVisualization<TableState> {
  protected className = TABLE_MANIFEST.name;

  getDefaultState(): TableState {
    return { flatData: null, hoverRow: null, ...super.getDefaultState() };
  }

  getSegmentWidth(): number {
    const { isThumbnail } = this.props;

    return isThumbnail ? THUMBNAIL_SEGMENT_WIDTH : SEGMENT_WIDTH;
  }

  calculateMousePosition(x: number, y: number): PositionHover {
    const { essence } = this.props;
    const { flatData } = this.state;

    if (x <= SPACE_LEFT) return { element: HoverElement.SPACE_LEFT };
    x -= SPACE_LEFT;

    if (y <= HEADER_HEIGHT) {
      if (x <= this.getSegmentWidth()) return { element: HoverElement.CORNER };
      const seriesList = essence.getConcreteSeries();

      x = x - this.getSegmentWidth();
      const seriesWidth = this.getIdealColumnWidth(this.props.essence);
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

  private getSortPeriod(columnType: ColumnType): SeriesDerivation {
    switch (columnType) {
      case ColumnType.CURRENT:
        return SeriesDerivation.CURRENT;
      case ColumnType.PREVIOUS:
        return SeriesDerivation.PREVIOUS;
      case ColumnType.DELTA:
        return SeriesDerivation.DELTA;
    }
  }

  private setSort({ series, element, columnType }: PositionHover) {
    const { clicker, essence: { splits } } = this.props;
    if (element === HoverElement.CORNER) {
      clicker.changeSplits(splits.setSortToDimension(), VisStrategy.KeepAlways); // set each to dimension ascending
      return;
    }
    if (element === HoverElement.HEADER) {
      const period = this.getSortPeriod(columnType);
      const commonSort = this.props.essence.getCommonSort();
      const reference = series.series.key();
      const sort = new SeriesSort({ reference, period, direction: SortDirection.descending });
      const sortWithDirection = commonSort && commonSort.equals(sort) ? sort.set("direction", SortDirection.ascending) : sort;
      clicker.changeSplits(splits.changeSort(sortWithDirection), VisStrategy.KeepAlways); // set all to measure
      return;
    }
    throw new Error(`Can't create sort reference for position element: ${element}`);
  }

  onClick = (x: number, y: number) => {
    const { clicker, essence } = this.props;
    const { splits } = essence;

    const mousePos = this.calculateMousePosition(x, y);
    const { row, element } = mousePos;

    if (element === HoverElement.CORNER || element === HoverElement.HEADER) {
      this.setSort(mousePos);
      return;
    }
    if (element === HoverElement.ROW) {
      if (!clicker.dropHighlight || !clicker.changeHighlight) return;

      const rowHighlight = getFilterFromDatum(splits, row);

      if (!rowHighlight) return;

      if (essence.hasHighlight()) {
        if (rowHighlight.equals(essence.highlight.delta)) {
          clicker.dropHighlight();
          return;
        }
      }

      clicker.changeHighlight(null, rowHighlight);
    }
  }

  onMouseMove = (x: number, y: number) => {
    const { hoverMeasure, hoverRow } = this.state;
    const pos = this.calculateMousePosition(x, y);
    const measure = pos.series && pos.series.measure;
    if (hoverMeasure !== measure || hoverRow !== pos.row) {
      this.setState({
        hoverMeasure: measure,
        hoverRow: pos.row
      });
    }
  }

  onMouseLeave = () => {
    const { hoverMeasure, hoverRow } = this.state;
    if (hoverMeasure || hoverRow) {
      this.setState({
        hoverMeasure: null,
        hoverRow: null
      });
    }
  }

  deriveDatasetState(dataset: Dataset): Partial<TableState> {
    if (!this.props.essence.splits.length()) return {};
    const flatDataset = dataset.flatten({ order: "preorder", nestingName: "__nest" });
    const flatData = flatDataset.data;
    return { flatData };
  }

  getScalesForColumns(essence: Essence, flatData: PseudoDatum[]): Array<d3.scale.Linear<number, number>> {
    const concreteSeries = essence.getConcreteSeries().toArray();
    const splitLength = essence.splits.length();

    return concreteSeries.map(series => {
      let measureValues = flatData
        .filter((d: Datum) => d["__nest"] === splitLength)
        .map((d: Datum) => series.selectValue(d));

      // Ensure that 0 is in there
      measureValues.push(0);

      return d3.scale.linear()
        .domain(d3.extent(measureValues))
        .range([0, 100]); // really those are percents
    });
  }

  getIdealColumnWidth(essence: Essence): number {
    const availableWidth = this.props.stage.width - SPACE_LEFT - this.getSegmentWidth();
    const measuresCount = essence.series.count();
    const columnsCount = essence.hasComparison() ? measuresCount * 3 : measuresCount;

    return columnsCount * MEASURE_WIDTH >= availableWidth ? MEASURE_WIDTH : availableWidth / columnsCount;
  }

  makeBackground(width: number): JSX.Element {
    return <div className="background-container">
      <div className="background" style={{ width: width + "%" }} />
    </div>;
  }

  makeMeasuresRenderer(essence: Essence, hScales: Array<d3.scale.Linear<number, number>>): (datum: PseudoDatum) => JSX.Element[] {
    const concreteSeries = essence.getConcreteSeries().toArray();
    const idealWidth = this.getIdealColumnWidth(essence);

    const splitLength = essence.splits.length();
    const isSingleSeries = concreteSeries.length === 1;
    const className = classNames("measure", { "all-alone": isSingleSeries });

    return (datum: PseudoDatum): JSX.Element[] => {
      const lastLevel = datum["__nest"] === splitLength;

      return flatMap(concreteSeries, (series, i) => {
        const currentValue = series.selectValue(datum);

        const currentCell = <div className={className} key={series.reactKey()} style={{ width: idealWidth }}>
          {lastLevel && this.makeBackground(hScales[i](currentValue))}
          <div className="label">{series.formatValue(datum)}</div>
        </div>;

        if (!essence.hasComparison()) {
          return [currentCell];
        }

        const previousValue = series.selectValue(datum, SeriesDerivation.PREVIOUS);

        return [
          currentCell,
          <div className={className} key={series.reactKey(SeriesDerivation.PREVIOUS)} style={{ width: idealWidth }}>
            {lastLevel && this.makeBackground(hScales[i](previousValue))}
            <div className="label">{series.selectValue(datum, SeriesDerivation.PREVIOUS)}</div>
          </div>,
          <div className={className} key={series.reactKey(SeriesDerivation.DELTA)} style={{ width: idealWidth }}>
            <div className="label">{<Delta
              currentValue={currentValue}
              previousValue={previousValue}
              lowerIsBetter={series.measure.lowerIsBetter}
              formatter={series.formatter()}
            />}</div>
          </div>
        ];
      });
    };
  }

  renderRow(index: number, rowMeasures: JSX.Element[], style: React.CSSProperties, rowClass: string): JSX.Element {
    return <div
      className={"row " + rowClass}
      key={"_" + index}
      style={style}
    >{rowMeasures}</div>;
  }

  renderHeaderColumns(essence: Essence, hoverMeasure: Measure, measureWidth: number): JSX.Element[] {
    const commonSort = essence.getCommonSort();

    function isCommonSortedBy(series: ConcreteSeries, period = SeriesDerivation.CURRENT): boolean {
      return commonSort instanceof SeriesSort && commonSort.reference === series.series.key() && commonSort.period === period;
    }

    const sortArrowIcon = commonSort ? React.createElement(SvgIcon, {
      svg: require("../../icons/sort-arrow.svg"),
      className: "sort-arrow " + commonSort.direction
    }) : null;

    return flatMap(essence.getConcreteSeries().toArray(), series => {
      const isCurrentSorted = isCommonSortedBy(series);

      const currentMeasure = <div className="measure-name" key={series.reactKey()} style={{ width: measureWidth }}>
        <div className="title-wrap">{series.title()}</div>
        {isCurrentSorted ? sortArrowIcon : null}
      </div>;

      if (!essence.hasComparison()) {
        return [currentMeasure];
      }

      const isPreviousSorted = isCommonSortedBy(series, SeriesDerivation.PREVIOUS);
      const isDeltaSorted = isCommonSortedBy(series, SeriesDerivation.DELTA);
      return [
        currentMeasure,
        <div className="measure-name" key={series.reactKey(SeriesDerivation.PREVIOUS)} style={{ width: measureWidth }}>
          <div className="title-wrap">{series.title(SeriesDerivation.PREVIOUS)}</div>
          {isPreviousSorted ? sortArrowIcon : null}
        </div>,
        <div
          className="measure-name measure-delta" key={series.reactKey(SeriesDerivation.DELTA)} style={{ width: measureWidth }}>
          <div className="title-wrap">Difference</div>
          {isDeltaSorted ? sortArrowIcon : null}
        </div>
      ];
    });
  }

  onSimpleScroll = (scrollTop: number, scrollLeft: number) => {
    this.setState({ scrollLeft, scrollTop });
  }

  getVisibleIndices(rowCount: number, height: number): number[] {
    const { scrollTop } = this.state;

    return [
      Math.max(0, Math.floor(scrollTop / ROW_HEIGHT)),
      Math.min(rowCount, Math.ceil((scrollTop + height) / ROW_HEIGHT))
    ];
  }

  protected renderInternals() {
    const { clicker, essence, stage } = this.props;
    const { flatData, scrollTop, hoverMeasure, hoverRow } = this.state;
    const { splits, dataCube } = essence;

    const segmentTitle = splits.splits.map(split => essence.dataCube.getDimension(split.reference).title).join(", ");

    const idealWidth = this.getIdealColumnWidth(essence);

    const headerColumns = this.renderHeaderColumns(essence, hoverMeasure, idealWidth);

    const rowWidth = idealWidth * headerColumns.length;

    let segments: JSX.Element[] = [];
    let rows: JSX.Element[] = [];
    let highlighter: JSX.Element = null;
    let highlighterStyle: any = null;
    let highlightModal: JSX.Element = null;
    if (flatData) {
      const hScales = this.getScalesForColumns(essence, flatData);

      let highlightDelta: Filter = null;
      if (essence.hasHighlight()) {
        highlightDelta = essence.highlight.delta;
      }

      const [skipNumber, lastElementToShow] = this.getVisibleIndices(flatData.length, stage.height);

      const measuresRenderer = this.makeMeasuresRenderer(essence, hScales);

      let rowY = skipNumber * ROW_HEIGHT;
      for (let i = skipNumber; i < lastElementToShow; i++) {
        const d = flatData[i];

        const nest = d["__nest"];

        const split = nest > 0 ? splits.splits.get(nest - 1) : null;
        const dimension = split ? dataCube.getDimension(split.reference) : null;

        const segmentValue = dimension ? d[dimension.name] : "";
        const segmentName = nest ? formatSegment(segmentValue, essence.timezone) : "Total";
        const left = Math.max(0, nest - 1) * INDENT_WIDTH;
        const segmentStyle = { left, width: this.getSegmentWidth() - left, top: rowY };
        const hoverClass = d === hoverRow ? "hover" : null;

        let selected = false;
        let selectedClass = "";
        if (highlightDelta) {
          selected = highlightDelta.equals(getFilterFromDatum(splits, d));
          selectedClass = selected ? "selected" : "not-selected";
        }

        const nestClass = `nest${nest}`;
        segments.push(<div
          className={classNames("segment", nestClass, selectedClass, hoverClass)}
          key={"_" + i}
          style={segmentStyle}
        >{segmentName}</div>);

        let rowMeasures = measuresRenderer(d);
        let rowClass = classNames(nestClass, selectedClass, hoverClass);
        let rowStyle: React.CSSProperties = { top: rowY, width: rowWidth };

        rows.push(this.renderRow(i, rowMeasures, rowStyle, rowClass));

        if (!highlighter && selected) {
          highlighterStyle = {
            top: rowY - scrollTop,
            left
          };

          highlighter = <div className="highlighter" key="highlight" style={highlighterStyle} />;

          highlightModal = <HighlightModal
            clicker={clicker}
            left={stage.x + stage.width / 2}
            top={stage.y + HEADER_HEIGHT + rowY - scrollTop - HIGHLIGHT_BUBBLE_V_OFFSET}
            title={segmentName} />;
        }

        rowY += ROW_HEIGHT;
      }
    }

    const columnWidth = this.getIdealColumnWidth(essence);

    const segmentLabels = <div className="segment-labels">{segments}</div>;

    // added extra wrapping div for pin full and single parent
    const overlay = <div className="highlight-cont">
      <div className="highlight">{highlighter}</div>
    </div>;

    const corner = <div className="corner">
      <div className="corner-wrap">{segmentTitle}</div>
    </div>;

    const measuresCount = essence.getConcreteSeries().size;
    const columnsCount = essence.hasComparison() ? measuresCount * 3 : measuresCount;
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

    return <div className="internals table-inner">
      <Scroller
        ref="scroller"
        layout={scrollerLayout}

        topGutter={headerColumns}
        leftGutter={segmentLabels}

        topLeftCorner={corner}

        body={rows}
        overlay={overlay}

        onClick={this.onClick}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.onMouseLeave}
        onScroll={this.onSimpleScroll}

      />

      {highlightModal}
    </div>;
  }
}
