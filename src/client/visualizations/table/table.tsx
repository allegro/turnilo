require('./table.css');

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, ply, r, Expression, RefExpression, Executor, Dataset, Datum, PseudoDatum, TimeRange, Set, SortAction } from 'plywood';
import { formatterFromData } from '../../../common/utils/formatter/formatter';
import { Stage, Filter, FilterClause, Essence, VisStrategy, Splits, SplitCombine, Dimension,
  Measure, Colors, DataSource, VisualizationProps, DatasetLoad, Resolve, MeasureModeNeeded } from '../../../common/models/index';
import { SPLIT } from '../../config/constants';
import { getXFromEvent, getYFromEvent } from '../../utils/dom/dom';
import { SvgIcon } from '../../components/svg-icon/svg-icon';
import { SegmentBubble } from '../../components/segment-bubble/segment-bubble';
import { Scroller } from '../../components/scroller/scroller';
import { SimpleTable, InlineStyle } from '../../components/simple-table/simple-table';

import { CircumstancesHandler } from '../../../common/utils/circumstances-handler/circumstances-handler';

const HEADER_HEIGHT = 38;
const SEGMENT_WIDTH = 300;
const INDENT_WIDTH = 25;
const MEASURE_WIDTH = 100;
const ROW_HEIGHT = 30;
const SPACE_LEFT = 10;
const SPACE_RIGHT = 10;
const ROW_PADDING_RIGHT = 50;
const BODY_PADDING_BOTTOM = 90;
const HIGHLIGHT_BUBBLE_V_OFFSET = -4;

function formatSegment(value: any): string {
  if (TimeRange.isTimeRange(value)) {
    return value.start.toISOString();
  }
  return String(value);
}

function getFilterFromDatum(splits: Splits, flatDatum: PseudoDatum, dataSource: DataSource): Filter {
  if (flatDatum['__nest'] === 0) return null;
  var segments: any[] = [];
  while (flatDatum['__nest'] > 0) {
    segments.unshift(flatDatum[splits.get(flatDatum['__nest'] - 1).getDimension(dataSource.dimensions).name]);
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
  public static id = 'table';
  public static title = 'Table';

  public static measureModeNeed: MeasureModeNeeded = 'multi';

  private static handler = CircumstancesHandler.EMPTY()
    .needsAtLeastOneSplit()
    .otherwise(
      (splits: Splits, dataSource: DataSource, colors: Colors, current: boolean) => {
        var autoChanged = false;
        splits = splits.map((split, i) => {
          if (!split.sortAction) {
            split = split.changeSortAction(dataSource.getDefaultSortAction());
            autoChanged = true;
          }

          var splitDimension = splits.get(0).getDimension(dataSource.dimensions);

          // ToDo: review this
          if (!split.limitAction && (autoChanged || splitDimension.kind !== 'time')) {
            split = split.changeLimit(i ? 5 : 50);
            autoChanged = true;
          }

          return split;
        });

        if (colors) {
          colors = null;
          autoChanged = true;
        }

        return autoChanged ? Resolve.automatic(6, { splits }) : Resolve.ready(current ? 10 : 8);
      }
    );

  public static handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
    return this.handler.evaluate(dataSource, splits, colors, current);
  }


  constructor() {
    super();
  }

  getDefaultState(): TableState {
    var s = super.getDefaultState() as TableState;

    s.flatData = null;
    s.hoverRow = null;

    return s;
  }

  calculateMousePosition(e: MouseEvent): PositionHover {
    var { essence } = this.props;
    var { flatData, scrollLeft, scrollTop } = this.state;
    var rect = ReactDOM.findDOMNode(this.refs['base']).getBoundingClientRect();
    var x = getXFromEvent(e) - rect.left;
    var y = getYFromEvent(e) - rect.top;

    if (x <= SPACE_LEFT) return { what: 'space-left' };
    x -= SPACE_LEFT;

    if (y <= HEADER_HEIGHT) {
      if (x <= SEGMENT_WIDTH) return { what: 'corner' };

      x = x - SEGMENT_WIDTH + scrollLeft;
      var measureIndex = Math.floor(x / MEASURE_WIDTH);
      var measure = essence.getEffectiveMeasures().get(measureIndex);
      if (!measure) return { what: 'whitespace' };
      return { what: 'header', measure };
    }

    y = y - HEADER_HEIGHT + scrollTop;
    var rowIndex = Math.floor(y / ROW_HEIGHT);
    var datum = flatData ? flatData[rowIndex] : null;
    if (!datum) return { what: 'whitespace' };
    return { what: 'row', row: datum };
  }

  onMouseMove(e: MouseEvent) {
    var { hoverMeasure, hoverRow } = this.state;
    var pos = this.calculateMousePosition(e);
    if (hoverMeasure !== pos.measure || hoverRow !== pos.row) {
      this.setState({
        hoverMeasure: pos.measure,
        hoverRow: pos.row
      });
    }
  }

  onClick(e: MouseEvent) {
    var { clicker, essence } = this.props;
    var { splits, dataSource } = essence;
    var pos = this.calculateMousePosition(e);

    var splitDimension = splits.get(0).getDimension(dataSource.dimensions);

    if (pos.what === 'corner' || pos.what === 'header') {
      var sortExpression = $(pos.what === 'corner' ? splitDimension.name : pos.measure.name);
      var commonSort = essence.getCommonSort();
      var myDescending = (commonSort && commonSort.expression.equals(sortExpression) && commonSort.direction === SortAction.DESCENDING);
      clicker.changeSplits(essence.splits.changeSortAction(new SortAction({
        expression: sortExpression,
        direction: myDescending ? SortAction.ASCENDING : SortAction.DESCENDING
      })), VisStrategy.KeepAlways);

    } else if (pos.what === 'row') {
      var nest = pos.row['__nest'] as number;
      var rowHighlight = getFilterFromDatum(essence.splits, pos.row, dataSource);

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

  onMouseLeave() {
    var { hoverMeasure, hoverRow } = this.state;
    if (hoverMeasure || hoverRow) {
      this.setState({
        hoverMeasure: null,
        hoverRow: null
      });
    }
  }

  renderInternals() {
    var { clicker, essence, stage, openRawDataModal } = this.props;
    var { datasetLoad, flatData, scrollLeft, scrollTop, hoverMeasure, hoverRow } = this.state;
    var { splits, dataSource } = essence;
    var splitDimension = splits.get(0).getDimension(dataSource.dimensions);

    var segmentTitle = splits.getTitle(essence.dataSource.dimensions);
    var commonSort = essence.getCommonSort();
    var commonSortName = commonSort ? (commonSort.expression as RefExpression).name : null;

    var sortArrowIcon = commonSort ? React.createElement(SvgIcon, {
      svg: require('../../icons/sort-arrow.svg'),
      className: 'sort-arrow ' + commonSort.direction
    }) : null;

    var cornerSortArrow: JSX.Element = null;
    if (commonSortName === splitDimension.name) {
      cornerSortArrow = sortArrowIcon;
    }

    var measuresArray = essence.getEffectiveMeasures().toArray();

    var headerColumns = measuresArray.map((measure, i) => {
      return <div
        className={'measure-name' + (measure === hoverMeasure ? ' hover' : '')}
        key={measure.name}
      >
        <div className="title-wrap">{measure.title}</div>
        {commonSortName === measure.name ? sortArrowIcon : null}
      </div>;
    });

    var segments: JSX.Element[] = [];
    var rows: JSX.Element[] = [];
    var highlighter: JSX.Element = null;
    var highlighterStyle: any = null;
    var highlightBubble: JSX.Element = null;
    if (flatData) {
      var formatters = measuresArray.map(measure => {
        var measureName = measure.name;
        var measureValues = flatData.map((d: Datum) => d[measureName] as number);
        return formatterFromData(measureValues, measure.format);
      });

      var highlightDelta: Filter = null;
      if (essence.highlightOn(Table.id)) {
        highlightDelta = essence.highlight.delta;
      }

      const skipNumber = SimpleTable.getFirstElementToShow(ROW_HEIGHT, scrollTop);
      const lastElementToShow = SimpleTable.getLastElementToShow(ROW_HEIGHT, flatData.length, scrollTop, stage.height);

      var rowY = skipNumber * ROW_HEIGHT;
      for (var i = skipNumber; i < lastElementToShow; i++) {
        var d = flatData[i];
        var nest = d['__nest'];

        var split = nest > 0 ? splits.get(nest - 1) : null;
        var dimension = split ? split.getDimension(dataSource.dimensions) : null;

        var segmentValue = dimension ? d[dimension.name] : '';
        var segmentName = nest ? formatSegment(segmentValue) : 'Total';
        var left = Math.max(0, nest - 1) * INDENT_WIDTH;
        var segmentStyle = { left: left, width: SEGMENT_WIDTH - left, top: rowY };
        var hoverClass = d === hoverRow ? ' hover' : '';

        var selected = false;
        var selectedClass = '';
        if (highlightDelta) {
          selected = highlightDelta.equals(getFilterFromDatum(splits, d, dataSource));
          selectedClass = selected ? 'selected' : 'not-selected';
        }

        segments.push(<div
          className={'segment nest' + nest + ' ' + selectedClass + hoverClass}
          key={'_' + i}
          style={segmentStyle}
        >{segmentName}</div>);

        var row = measuresArray.map((measure, j) => {
          var measureValue = d[measure.name];
          var measureValueStr = formatters[j](measureValue);
          return <div className="measure" key={measure.name}>{measureValueStr}</div>;
        });

        var rowStyle = SimpleTable.getRowStyle(rowY);
        rows.push(<div
          className={'row nest' + nest + ' ' + selectedClass + hoverClass}
          key={'_' + i}
          style={rowStyle}
        >{row}</div>);

        if (!highlighter && selected) {
          highlighterStyle = {
            top: rowY,
            left
          };

          var dimension = essence.dataSource.getDimensionByExpression(splits.splitCombines.get(nest - 1).expression);

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

    var rowWidth = MEASURE_WIDTH * measuresArray.length + ROW_PADDING_RIGHT;

    // Extended so that the horizontal lines extend fully
    var rowWidthExtended = rowWidth;
    if (stage) {
      rowWidthExtended = Math.max(
        rowWidthExtended,
        stage.width - (SPACE_LEFT + SEGMENT_WIDTH + SPACE_RIGHT)
      );
    }

    const segmentsStyle = {
      top: -scrollTop
    };

    const bodyHeight = flatData ? flatData.length * ROW_HEIGHT : 0;

    const highlightStyle = {
      top: -scrollTop
    };

    var verticalScrollShadowStyle: any = { display: 'none' };
    if (scrollLeft) {
      verticalScrollShadowStyle = {};
    }

    const scrollerStyle = {
      width: SPACE_LEFT + SEGMENT_WIDTH + rowWidth + SPACE_RIGHT,
      height: HEADER_HEIGHT + bodyHeight + BODY_PADDING_BOTTOM
    };

    const preRows = <div className="segments-cont">
      <div className="segments" style={segmentsStyle}>{segments}</div>
    </div>;
    // added extra wrapping div for pin full and single parent
    const postRows = <div className="post-body">
      <div className="highlight-cont">
        <div className="highlight" style={highlightStyle}>{highlighter}</div>
      </div>
      <div className="vertical-scroll-shadow" style={verticalScrollShadowStyle}></div>
    </div>;

    return <div className="internals table-inner">
      <div className="corner">
        <div className="corner-wrap">{segmentTitle}</div>
        {cornerSortArrow}
      </div>
      <SimpleTable
        scrollLeft={scrollLeft}
        scrollTop={scrollTop}
        rowHeight={ROW_HEIGHT}
        dataLength={flatData ? flatData.length : 0}
        headerColumns={headerColumns}
        rowWidth={rowWidthExtended}
        preRows={preRows}
        rows={rows}
        rowLeftOffset={SEGMENT_WIDTH}
        postRows={postRows}
      />
      <Scroller
        style={scrollerStyle}
        ref="base"
        onScroll={this.onScroll.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onClick={this.onClick.bind(this)}
      />
      {highlightBubble}
    </div>;
  }
}
