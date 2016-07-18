/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./table.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, ply, r, Expression, RefExpression, Executor, Dataset, Datum, PseudoDatum, TimeRange, Set, SortAction, NumberRange } from 'plywood';
import { formatterFromData, formatNumberRange, Formatter } from '../../../common/utils/formatter/formatter';
import { Stage, Filter, FilterClause, Essence, VisStrategy, Splits, SplitCombine, Dimension,
  Measure, Colors, DataCube, VisualizationProps, DatasetLoad } from '../../../common/models/index';
import { TABLE_MANIFEST } from '../../../common/manifests/table/table';
import { getXFromEvent, getYFromEvent, classNames } from '../../utils/dom/dom';
import { SvgIcon } from '../../components/svg-icon/svg-icon';
import { SegmentBubble } from '../../components/segment-bubble/segment-bubble';
import { Scroller, ScrollerLayout } from '../../components/scroller/scroller';

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';

const HEADER_HEIGHT = 38;
const SEGMENT_WIDTH = 300;
const INDENT_WIDTH = 25;
const MEASURE_WIDTH = 130;
const ROW_HEIGHT = 30;
const SPACE_LEFT = 10;
const SPACE_RIGHT = 10;
const HIGHLIGHT_BUBBLE_V_OFFSET = -4;

function formatSegment(value: any): string {
  if (TimeRange.isTimeRange(value)) {
    return value.start.toISOString();
  } else if (NumberRange.isNumberRange(value)) {
    return formatNumberRange(value);
  }
  return String(value);
}

function getFilterFromDatum(splits: Splits, flatDatum: PseudoDatum, dataCube: DataCube): Filter {
  if (flatDatum['__nest'] === 0) return null;
  var segments: any[] = [];
  while (flatDatum['__nest'] > 0) {
    segments.unshift(flatDatum[splits.get(flatDatum['__nest'] - 1).getDimension(dataCube.dimensions).name]);
    flatDatum = flatDatum['__parent'];
  }
  return new Filter(List(segments.map((segment, i) => {
    return new FilterClause({
      expression: splits.get(i).expression,
      selection: r(TimeRange.isTimeRange(segment) ? segment : Set.fromJS([segment]))
    });
  })));
}

export interface PositionHover {
  what: string;
  measure?: Measure;
  row?: Datum;
}

export interface TableState extends BaseVisualizationState {
  flatData?: PseudoDatum[];
  hoverRow?: Datum;
}

export class Table extends BaseVisualization<TableState> {
  public static id = TABLE_MANIFEST.name;

  constructor() {
    super();
  }

  getDefaultState(): TableState {
    var s = super.getDefaultState() as TableState;

    s.flatData = null;
    s.hoverRow = null;

    return s;
  }

  calculateMousePosition(x: number, y: number): PositionHover {
    var { essence } = this.props;
    var { flatData } = this.state;

    if (x <= SPACE_LEFT) return { what: 'space-left' };
    x -= SPACE_LEFT;

    if (y <= HEADER_HEIGHT) {
      if (x <= SEGMENT_WIDTH) return { what: 'corner' };

      x = x - SEGMENT_WIDTH;
      var measureWidth = this.getIdealMeasureWidth(this.props.essence);
      var measureIndex = Math.floor(x / measureWidth);
      var measure = essence.getEffectiveMeasures().get(measureIndex);
      if (!measure) return { what: 'whitespace' };
      return { what: 'header', measure };
    }

    y = y - HEADER_HEIGHT;
    var rowIndex = Math.floor(y / ROW_HEIGHT);
    var datum = flatData ? flatData[rowIndex] : null;
    if (!datum) return { what: 'whitespace' };
    return { what: 'row', row: datum };
  }

  onClick(x: number, y: number) {
    var { clicker, essence } = this.props;
    var { splits, dataCube } = essence;
    var pos = this.calculateMousePosition(x, y);

    if (pos.what === 'corner' || pos.what === 'header') {
      var sortExpression = $(pos.what === 'corner' ? SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER : pos.measure.name);
      var commonSort = essence.getCommonSort();
      var myDescending = (commonSort && commonSort.expression.equals(sortExpression) && commonSort.direction === SortAction.DESCENDING);
      clicker.changeSplits(essence.splits.changeSortActionFromNormalized(new SortAction({
        expression: sortExpression,
        direction: myDescending ? SortAction.ASCENDING : SortAction.DESCENDING
      }), essence.dataCube.dimensions), VisStrategy.KeepAlways);

    } else if (pos.what === 'row') {
      var rowHighlight = getFilterFromDatum(essence.splits, pos.row, dataCube);

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

  onMouseMove(x: number, y: number) {
    var { hoverMeasure, hoverRow } = this.state;
    var pos = this.calculateMousePosition(x, y);
    if (hoverMeasure !== pos.measure || hoverRow !== pos.row) {
      this.setState({
        hoverMeasure: pos.measure,
        hoverRow: pos.row
      });
    }
  }

  onMouseLeave() {
    var { hoverMeasure, hoverRow } = this.state;
    if (hoverMeasure || hoverRow) {
      this.setState({
        hoverMeasure: null,
        hoverRow: null
      });
    }
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence } = props;
    const { splits } = essence;

    var existingDatasetLoad = this.state.datasetLoad;
    var newState: TableState = {};
    if (datasetLoad) {
      // Always keep the old dataset while loading (for now)
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      datasetLoad = this.state.datasetLoad;
    }

    var { dataset } = datasetLoad;

    if (dataset && splits.length()) {
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);

      newState.flatData = dataset.flatten({
        order: 'preorder',
        nestingName: '__nest',
        parentName: '__parent'
      });
    }

    this.setState(newState);
  }

  getScalesForColumns(essence: Essence, flatData: PseudoDatum[]): d3.scale.Linear<number, number>[] {
    var measuresArray = essence.getEffectiveMeasures().toArray();
    var splitLength = essence.splits.length();

    return measuresArray.map(measure => {
      var measureValues = flatData
        .filter((d: Datum) => d['__nest'] === splitLength)
        .map((d: Datum) => d[measure.name] as number);

      // Ensure that 0 is in there
      measureValues.push(0);

      return d3.scale.linear()
        .domain(d3.extent(measureValues))
        .range([0, 100]); // really those are percents
    });
  }

  getFormattersFromMeasures(essence: Essence, flatData: PseudoDatum[]): Formatter[] {
    var measuresArray = essence.getEffectiveMeasures().toArray();

    return measuresArray.map(measure => {
      var measureName = measure.name;
      var measureValues = flatData.map((d: Datum) => d[measureName] as number);
      return formatterFromData(measureValues, measure.format);
    });
  }

  getIdealMeasureWidth(essence: Essence): number {
    var availableWidth = this.props.stage.width - SPACE_LEFT - SEGMENT_WIDTH;
    var columnsCount = essence.getEffectiveMeasures().size;

    return columnsCount * MEASURE_WIDTH >= availableWidth ? MEASURE_WIDTH : availableWidth / columnsCount;
  }

  makeMeasuresRenderer(essence: Essence, formatters: Formatter[], hScales: d3.scale.Linear<number, number>[]): (datum: PseudoDatum) => JSX.Element[] {
    var measuresArray = essence.getEffectiveMeasures().toArray();
    var idealWidth = this.getIdealMeasureWidth(essence);

    var splitLength = essence.splits.length();
    var isSingleMeasure = measuresArray.length === 1;
    var className = classNames('measure', {'all-alone': !!isSingleMeasure});

    return (datum: PseudoDatum): JSX.Element[] => {

      return measuresArray.map((measure, i) => {
        var measureValue = datum[measure.name];
        var measureValueStr = formatters[i](measureValue);

        var background: JSX.Element = null;
        if (datum['__nest'] === splitLength) {
          let backgroundWidth = hScales[i](measureValue);
          background = <div className="background-container">
            <div className="background" style={{width: backgroundWidth + '%'}}></div>
          </div>;
        }

        return <div className={className} key={measure.name} style={{width: idealWidth}}>
          {background}
          <div className="label">{measureValueStr}</div>
        </div>;
      });
    };
  }

  renderRow(index: number, rowMeasures: JSX.Element[], style: React.CSSProperties, rowClass: string): JSX.Element {
    return <div
      className={'row ' + rowClass}
      key={'_' + index}
      style={style}
    >{rowMeasures}</div>;
  }

  renderHeaderColumns(essence: Essence, hoverMeasure: Measure, measureWidth: number): JSX.Element[] {
    var commonSort = essence.getCommonSort();
    var commonSortName = commonSort ? (commonSort.expression as RefExpression).name : null;

    var sortArrowIcon = commonSort ? React.createElement(SvgIcon, {
      svg: require('../../icons/sort-arrow.svg'),
      className: 'sort-arrow ' + commonSort.direction
    }) : null;

    return essence.getEffectiveMeasures().toArray().map((measure, i) => {
      let amISorted = commonSortName === measure.name;

      return <div
        className={classNames('measure-name', {hover: measure === hoverMeasure, sorted: amISorted})}
        key={measure.name}
        style={{width: measureWidth}}
      >
        <div className="title-wrap">{measure.title}</div>
        {amISorted ? sortArrowIcon : null}
      </div>;
    });
  }

  renderCornerSortArrow(essence: Essence): JSX.Element {
    var commonSort = essence.getCommonSort();
    if (!commonSort) return null;

    if (commonSort.refName() === SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER) {
      return <SvgIcon
        svg={require('../../icons/sort-arrow.svg')}
        className={'sort-arrow ' + commonSort.direction}
      />;
    }

    return null;
  }

  onSimpleScroll(scrollTop: number, scrollLeft: number) {
    this.setState({scrollLeft, scrollTop});
  }

  getVisibleIndices(rowCount: number, height: number): number[] {
    const { scrollTop } = this.state;

    return [
      Math.max(0, Math.floor(scrollTop / ROW_HEIGHT)),
      Math.min(rowCount, Math.ceil((scrollTop + height) / ROW_HEIGHT))
    ];
  }

  renderInternals() {
    var { clicker, essence, stage, openRawDataModal } = this.props;
    var { flatData, scrollTop, hoverMeasure, hoverRow } = this.state;
    var { splits, dataCube } = essence;

    var segmentTitle = splits.getTitle(essence.dataCube.dimensions);

    var cornerSortArrow: JSX.Element = this.renderCornerSortArrow(essence);
    var idealWidth = this.getIdealMeasureWidth(essence);

    var headerColumns = this.renderHeaderColumns(essence, hoverMeasure, idealWidth);

    var rowWidth = idealWidth * headerColumns.length;

    var segments: JSX.Element[] = [];
    var rows: JSX.Element[] = [];
    var highlighter: JSX.Element = null;
    var highlighterStyle: any = null;
    var highlightBubble: JSX.Element = null;
    if (flatData) {
      var formatters = this.getFormattersFromMeasures(essence, flatData);
      var hScales = this.getScalesForColumns(essence, flatData);

      var highlightDelta: Filter = null;
      if (essence.highlightOn(Table.id)) {
        highlightDelta = essence.highlight.delta;
      }

      const [skipNumber, lastElementToShow] = this.getVisibleIndices(flatData.length, stage.height);

      const measuresRenderer = this.makeMeasuresRenderer(essence, formatters, hScales);

      var rowY = skipNumber * ROW_HEIGHT;
      for (var i = skipNumber; i < lastElementToShow; i++) {
        var d = flatData[i];

        var nest = d['__nest'];

        var split = nest > 0 ? splits.get(nest - 1) : null;
        var dimension = split ? split.getDimension(dataCube.dimensions) : null;

        var segmentValue = dimension ? d[dimension.name] : '';
        var segmentName = nest ? formatSegment(segmentValue) : 'Total';
        var left = Math.max(0, nest - 1) * INDENT_WIDTH;
        var segmentStyle = { left: left, width: SEGMENT_WIDTH - left, top: rowY };
        var hoverClass = d === hoverRow ? 'hover' : null;

        var selected = false;
        var selectedClass = '';
        if (highlightDelta) {
          selected = highlightDelta.equals(getFilterFromDatum(splits, d, dataCube));
          selectedClass = selected ? 'selected' : 'not-selected';
        }

        var nestClass = `nest${nest}`;
        segments.push(<div
          className={classNames('segment', nestClass, selectedClass, hoverClass)}
          key={'_' + i}
          style={segmentStyle}
        >{segmentName}</div>);

        let rowMeasures = measuresRenderer(d);
        let rowClass = classNames(nestClass, selectedClass, hoverClass);
        let rowStyle: React.CSSProperties = {top: rowY, width: rowWidth};

        rows.push(this.renderRow(i, rowMeasures, rowStyle, rowClass));

        if (!highlighter && selected) {
          highlighterStyle = {
            top: rowY - scrollTop,
            left
          };

          var dimension = essence.dataCube.getDimensionByExpression(splits.splitCombines.get(nest - 1).expression);

          highlighter = <div className='highlighter' key='highlight' style={highlighterStyle}></div>;

          highlightBubble = <SegmentBubble
            left={stage.x + stage.width / 2}
            top={stage.y + HEADER_HEIGHT + rowY - scrollTop - HIGHLIGHT_BUBBLE_V_OFFSET}
            segmentLabel={segmentName}
            dimension={dimension}
            clicker={clicker}
            openRawDataModal={openRawDataModal}
          />;
        }

        rowY += ROW_HEIGHT;
      }
    }

    var measureWidth = this.getIdealMeasureWidth(essence);

    const segmentLabels = <div className="segment-labels">{segments}</div>;

    // added extra wrapping div for pin full and single parent
    const overlay = <div className="highlight-cont">
      <div className="highlight">{highlighter}</div>
    </div>;

    const corner = <div className="corner">
      <div className="corner-wrap">{segmentTitle}</div>
      {cornerSortArrow}
    </div>;


    const scrollerLayout: ScrollerLayout = {
      // Inner dimensions
      bodyWidth: measureWidth * essence.getEffectiveMeasures().size + SPACE_RIGHT,
      bodyHeight: flatData ? flatData.length * ROW_HEIGHT : 0,

      // Gutters
      top: HEADER_HEIGHT,
      right: 0,
      bottom: 0,
      left: SEGMENT_WIDTH
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

        onClick={this.onClick.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onScroll={this.onSimpleScroll.bind(this)}

      />

      {highlightBubble}
    </div>;
  }
}
