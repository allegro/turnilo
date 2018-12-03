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

import { Duration, Timezone } from "chronoshift";
import * as d3 from "d3";
import { List, Set } from "immutable";
import * as moment from "moment-timezone";
import { Datum, NumberRange, PseudoDatum, TimeRange } from "plywood";
import * as React from "react";
import { TABLE_MANIFEST } from "../../../common/manifests/table/table";
import { DataSeries } from "../../../common/models/data-series/data-series";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { FixedTimeFilterClause, NumberFilterClause, StringFilterAction, StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter } from "../../../common/models/filter/filter";
import { SeriesDerivation } from "../../../common/models/series/series";
import { Sort, SORT_ON_DIMENSION_PLACEHOLDER } from "../../../common/models/sort/sort";
import { Split, SplitType } from "../../../common/models/split/split";
import { Splits } from "../../../common/models/splits/splits";
import { DatasetLoad, VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { formatNumberRange } from "../../../common/utils/formatter/formatter";
import { integerDivision } from "../../../common/utils/general/general";
import { SortDirection } from "../../../common/view-definitions/version-4/split-definition";
import { Delta } from "../../components/delta/delta";
import { Scroller, ScrollerLayout } from "../../components/scroller/scroller";
import { SegmentActionButtons } from "../../components/segment-action-buttons/segment-action-buttons";
import { SegmentBubble } from "../../components/segment-bubble/segment-bubble";
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

function formatSegment(value: any, timezone: Timezone, split?: Split): string {
  if (TimeRange.isTimeRange(value)) {
    const time = moment(value.start, timezone.toString()).toDate();
    if (split && split.bucket instanceof Duration) {
      const duration = split.bucket;
      switch (duration.getSingleSpan()) {
        case "year":
          return d3.time.format("%Y")(time);
        case "month":
          return d3.time.format("%Y %B")(time);
        case "week":
        case "day":
          return d3.time.format("%Y-%m-%d")(time);
        default:
          return d3.time.format("%Y-%m-%d %H:%M %p")(time);
      }
    }
    return d3.time.format("%Y-%m-%d %H:%M %p")(time);
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
          return new FixedTimeFilterClause({ reference, values: List.of(segment) });
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
  series?: DataSeries;
  columnType?: ColumnType;
  row?: Datum;
}

export interface TableState extends BaseVisualizationState {
  flatData?: PseudoDatum[];
  hoverRow?: Datum;
}

export class Table extends BaseVisualization<TableState> {
  public static id = TABLE_MANIFEST.name;

  getDefaultState(): TableState {
    let s = super.getDefaultState() as TableState;

    s.flatData = null;
    s.hoverRow = null;

    return s;
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
      const effectiveSeries = essence.getDataSeries();

      x = x - this.getSegmentWidth();
      const seriesWidth = this.getIdealColumnWidth(this.props.essence);
      const seriesIndex = Math.floor(x / seriesWidth);
      if (essence.hasComparison()) {
        const nominalIndex = integerDivision(seriesIndex, 3);
        const series = effectiveSeries.get(nominalIndex);
        if (!series) return { element: HoverElement.WHITESPACE };
        const columnType = indexToColumnType(seriesIndex);
        return { element: HoverElement.HEADER, series, columnType };
      }
      const series = effectiveSeries.get(seriesIndex);
      if (!series) return { element: HoverElement.WHITESPACE };
      return { element: HoverElement.HEADER, series, columnType: ColumnType.CURRENT };
    }

    y = y - HEADER_HEIGHT;
    const rowIndex = Math.floor(y / ROW_HEIGHT);
    const datum = flatData ? flatData[rowIndex] : null;
    if (!datum) return { element: HoverElement.WHITESPACE };
    return { element: HoverElement.ROW, row: datum };
  }

  private getSortRef({ element, columnType, series }: PositionHover): string {
    if (element === HoverElement.CORNER) {
      return SORT_ON_DIMENSION_PLACEHOLDER;
    }
    if (element === HoverElement.HEADER) {
      switch (columnType) {
        case ColumnType.CURRENT:
          return series.fullName();
        case ColumnType.PREVIOUS:
          return series.fullName(SeriesDerivation.PREVIOUS);
        case ColumnType.DELTA:
          return series.fullName(SeriesDerivation.DELTA);
      }
    }
    throw new Error(`Can't create sort reference for position element: ${element}`);
  }

  private getSortExpression(position: PositionHover): Sort {
    const reference = this.getSortRef(position);
    const commonSort = this.props.essence.getCommonSort();
    const isDesc = (commonSort && commonSort.reference === reference && commonSort.direction === SortDirection.descending);
    const direction = isDesc ? SortDirection.ascending : SortDirection.descending;
    return new Sort({ reference, direction });
  }

  onClick = (x: number, y: number) => {
    const { clicker, essence } = this.props;
    const { splits } = essence;

    const mousePos = this.calculateMousePosition(x, y);
    const { row, element } = mousePos;

    if (element === HoverElement.CORNER || element === HoverElement.HEADER) {
      if (!clicker.changeSplits) return;

      const sortExpression = this.getSortExpression(mousePos);
      clicker.changeSplits(
        splits.changeSortExpressionFromNormalized(sortExpression),
        VisStrategy.KeepAlways
      );
    } else if (element === HoverElement.ROW) {
      if (!clicker.dropHighlight || !clicker.changeHighlight) return;

      const rowHighlight = getFilterFromDatum(splits, row);

      if (!rowHighlight) return;

      if (essence.highlightOn(Table.id)) {
        if (rowHighlight.equals(essence.highlight.delta)) {
          clicker.dropHighlight();
          return;
        }
      }

      clicker.changeHighlight(Table.id, null, rowHighlight);
    }
  }

  onMouseMove = (x: number, y: number) => {
    const { hoverSeries, hoverRow } = this.state;
    const { series, row } = this.calculateMousePosition(x, y);
    if (hoverSeries !== series || hoverRow !== row) {
      this.setState({
        hoverSeries: series,
        hoverRow: row
      });
    }
  }

  onMouseLeave = () => {
    const { hoverSeries, hoverRow } = this.state;
    if (hoverSeries || hoverRow) {
      this.setState({
        hoverSeries: null,
        hoverRow: null
      });
    }
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence } = props;
    const { splits } = essence;

    const existingDatasetLoad = this.state.datasetLoad;
    let newState: TableState = {};
    if (datasetLoad) {
      // Always keep the old dataset while loading (for now)
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      datasetLoad = this.state.datasetLoad;
    }

    const { dataset } = datasetLoad;

    if (dataset && splits.length()) {
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);

      newState.flatData = dataset.flatten({
        order: "preorder",
        nestingName: "__nest"
      }).data;
    }

    this.setState(newState);
  }

  getScalesForColumns(essence: Essence, flatData: PseudoDatum[]): Array<d3.scale.Linear<number, number>> {
    const dataSeries = essence.getDataSeries().toArray();
    const splitLength = essence.splits.length();

    return dataSeries.map(series => {
      const measureValues = flatData
        .filter((d: Datum) => d["__nest"] === splitLength)
        .map((d: Datum) => series.getDatum(d));

      return d3.scale.linear()
        .domain(d3.extent([0, ...measureValues]))
        .range([0, 100]); // really those are percents
    });
  }

  getIdealColumnWidth(essence: Essence): number {
    const availableWidth = this.props.stage.width - SPACE_LEFT - this.getSegmentWidth();
    const seriesCount = essence.getDataSeries().count();
    const columnsCount = essence.hasComparison() ? seriesCount * 3 : seriesCount;

    return columnsCount * MEASURE_WIDTH >= availableWidth ? MEASURE_WIDTH : availableWidth / columnsCount;
  }

  makeBackground(width: number): JSX.Element {
    return <div className="background-container">
      <div className="background" style={{ width: width + "%" }} />
    </div>;
  }

  makeMeasuresRenderer(essence: Essence, hScales: Array<d3.scale.Linear<number, number>>): (datum: PseudoDatum) => JSX.Element[] {
    const dataSeries = essence.getDataSeries();
    const idealWidth = this.getIdealColumnWidth(essence);

    const splitLength = essence.splits.length();
    const isSingleMeasure = dataSeries.count() === 1;
    const className = classNames("measure", { "all-alone": isSingleMeasure });

    return (datum: PseudoDatum): JSX.Element[] => {
      const lastLevel = datum["__nest"] === splitLength;

      return dataSeries.flatMap((dataSeries, i) => {
        const currentValue = dataSeries.getDatum(datum);
        const formatter = dataSeries.datumFormatter();

        const currentCell = <div className={className} key={dataSeries.fullName()} style={{ width: idealWidth }}>
          {lastLevel && this.makeBackground(hScales[i](currentValue))}
          <div className="label">{formatter(datum)}</div>
        </div>;

        if (!essence.hasComparison()) {
          return [currentCell];
        }

        const previousValue = dataSeries.getDatum(datum, SeriesDerivation.PREVIOUS);

        return [
          currentCell,
          <div className={className} key={dataSeries.fullName(SeriesDerivation.PREVIOUS)} style={{ width: idealWidth }}>
            {lastLevel && this.makeBackground(hScales[i](previousValue))}
            <div className="label">{formatter(datum, SeriesDerivation.PREVIOUS)}</div>
          </div>,
          <div className={className} key={dataSeries.fullName(SeriesDerivation.DELTA)} style={{ width: idealWidth }}>
            <div className="label">
              {<Delta series={dataSeries} datum={datum} />}
            </div>
          </div>
        ];
      }).toArray();
    };
  }

  renderRow(index: number, rowMeasures: JSX.Element[], style: React.CSSProperties, rowClass: string): JSX.Element {
    return <div
      className={"row " + rowClass}
      key={"_" + index}
      style={style}
    >{rowMeasures}</div>;
  }

  renderHeaderColumns(essence: Essence, hoverSeries: DataSeries, columnWidth: number): JSX.Element[] {
    const commonSort = essence.getCommonSort();
    const commonSortName = commonSort ? commonSort.reference : null;

    const sortArrowIcon = commonSort &&
      <SvgIcon svg={require("../../icons/sort-arrow.svg")}
               className={classNames("sort-arrow", commonSort.direction)} />;

    return essence.getDataSeries().flatMap(series => {
      const isCurrentSorted = commonSortName === series.fullName();

      const currentSeries = <div
        className={classNames("measure-name", { hover: series.equals(hoverSeries), sorted: isCurrentSorted })}
        key={series.fullName()}
        style={{ width: columnWidth }}
      >
        <div className="title-wrap">{series.title()}</div>
        {isCurrentSorted ? sortArrowIcon : null}
      </div>;

      if (!essence.hasComparison()) {
        return [currentSeries];
      }

      const isPreviousSorted = commonSortName === series.fullName(SeriesDerivation.PREVIOUS);
      const isDeltaSorted = commonSortName === series.fullName(SeriesDerivation.DELTA);
      return [
        currentSeries,
        <div
          className={classNames("measure-name", { hover: series.equals(hoverSeries), sorted: isPreviousSorted })}
          key={series.fullName(SeriesDerivation.PREVIOUS)}
          style={{ width: columnWidth }}
        >
          <div className="title-wrap">{series.title(SeriesDerivation.PREVIOUS)}</div>
          {isPreviousSorted ? sortArrowIcon : null}
        </div>,
        <div
          className={classNames("measure-name measure-delta", { hover: series.equals(hoverSeries), sorted: isDeltaSorted })}
          key={series.fullName(SeriesDerivation.DELTA)}
          style={{ width: columnWidth }}
        >
          <div className="title-wrap">Difference</div>
          {isDeltaSorted ? sortArrowIcon : null}
        </div>
      ];
    }).toArray();
  }

  renderCornerSortArrow(essence: Essence): JSX.Element {
    const commonSort = essence.getCommonSort();
    if (!commonSort) return null;

    if (commonSort.reference === SORT_ON_DIMENSION_PLACEHOLDER) {
      return <SvgIcon
        svg={require("../../icons/sort-arrow.svg")}
        className={"sort-arrow " + commonSort.direction}
      />;
    }

    return null;
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

  renderInternals() {
    const { clicker, essence, stage, openRawDataModal } = this.props;
    const { flatData, scrollTop, hoverSeries, hoverRow } = this.state;
    const { splits, dataCube } = essence;

    const segmentTitle = splits.splits.map(split => essence.dataCube.getDimension(split.reference).title).join(", ");

    const cornerSortArrow: JSX.Element = this.renderCornerSortArrow(essence);
    const idealWidth = this.getIdealColumnWidth(essence);

    const headerColumns = this.renderHeaderColumns(essence, hoverSeries, idealWidth);

    const rowWidth = idealWidth * headerColumns.length;

    let segments: JSX.Element[] = [];
    let rows: JSX.Element[] = [];
    let highlighter: JSX.Element = null;
    let highlighterStyle: any = null;
    let highlightBubble: JSX.Element = null;
    if (flatData) {
      const hScales = this.getScalesForColumns(essence, flatData);

      let highlightDelta: Filter = null;
      if (essence.highlightOn(Table.id)) {
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
        const segmentName = nest ? formatSegment(segmentValue, essence.timezone, split) : "Total";
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

          const dimension = essence.dataCube.getDimension(splits.splits.get(nest - 1).reference);

          highlighter = <div className="highlighter" key="highlight" style={highlighterStyle} />;

          highlightBubble = <SegmentBubble
            left={stage.x + stage.width / 2}
            top={stage.y + HEADER_HEIGHT + rowY - scrollTop - HIGHLIGHT_BUBBLE_V_OFFSET}
            title={segmentName}
            actions={<SegmentActionButtons
              clicker={clicker}
              segmentLabel={segmentName}
              dimension={dimension}
              openRawDataModal={openRawDataModal}
            />}
          />;
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
      {cornerSortArrow}
    </div>;

    const seriesCount = essence.getDataSeries().count();
    const columnsCount = essence.hasComparison() ? seriesCount * 3 : seriesCount;
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

      {highlightBubble}
    </div>;
  }
}
