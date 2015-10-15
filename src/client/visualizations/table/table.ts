'use strict';
require('./table.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, ply, Expression, RefExpression, Executor, Dataset, Datum, TimeRange, SortAction } from 'plywood';
import { listsEqual } from '../../../common/utils/general/general';
import { formatterFromData } from '../../../common/utils/formatter/formatter';
import { Stage, Filter, Essence, VisStrategy, Splits, SplitCombine, Dimension, Measure, DataSource, Clicker, VisualizationProps, Resolve } from '../../../common/models/index';
import { SPLIT, SEGMENT } from '../../config/constants';
import { getXFromEvent, getYFromEvent } from '../../utils/dom/dom';
import { SvgIcon } from '../../components/svg-icon/svg-icon';
import { HighlightControls } from '../../components/highlight-controls/highlight-controls';
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';

const HEADER_HEIGHT = 38;
const SEGMENT_WIDTH = 300;
const INDENT_WIDTH = 25;
const MEASURE_WIDTH = 100;
const ROW_HEIGHT = 30;
const SPACE_LEFT = 10;
const SPACE_RIGHT = 10;

const ROW_PADDING_RIGHT = 50;
const BODY_PADDING_BOTTOM = 90;

const HIGHLIGHT_CONTROLS_TOP = -34;

function formatSegment(value: any): string {
  if (TimeRange.isTimeRange(value)) {
    return value.start.toISOString();
  }
  return String(value);
}

function getFilterFromDatum(splits: Splits, flatDatum: Datum): Filter {
  if (flatDatum['__nest'] === 0) return null;
  var segments: any[] = [];
  while (flatDatum['__nest'] > 0) {
    segments.unshift(flatDatum[SEGMENT]);
    flatDatum = flatDatum['__parent'];
  }
  return new Filter(List(segments.map((segment, i) => {
    return splits.get(i).expression.in(TimeRange.isTimeRange(segment) ? segment : [segment]);
  })));
}

export interface PositionHover {
  what: string;
  measure?: Measure;
  row?: Datum;
}

export interface TableState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
  flatData?: Datum[];
  scrollLeft?: number;
  scrollTop?: number;
  hoverMeasure?: Measure;
  hoverRow?: Datum;
}

export class Table extends React.Component<VisualizationProps, TableState> {
  static id = 'table';
  static title = 'Table';
  static handleCircumstance(dataSource: DataSource, splits: Splits): Resolve {
    // Must have at least one dimension
    if (splits.length() < 1) {
      var someDimensions = dataSource.dimensions.toArray().filter(d => d.type !== 'TIME').slice(0, 2);
      return Resolve.manual(
        'This visualization requires at least one split',
        someDimensions.map((someDimension) => {
          return {
            description: `Add a split on ${someDimension.title}`,
            adjustment: Splits.fromSplitCombine(SplitCombine.fromExpression(someDimension.expression))
          };
        })
      );
    }

    // Auto adjustment
    var autoChanged = false;
    splits = splits.map((split, i) => {
      var splitDimension = dataSource.getDimensionByExpression(split.expression);

      if (!split.sortAction) {
        split = split.changeSortAction(dataSource.getDefaultSortAction());
        autoChanged = true;
      }

      if (!split.limitAction && (autoChanged || splitDimension.type !== 'TIME')) {
        split = split.changeLimit(i ? 5 : 50);
        autoChanged = true;
      }

      return split;
    });

    return autoChanged ? Resolve.automatic(splits) : Resolve.READY;
  }

  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      loading: false,
      dataset: null,
      error: null,
      flatData: null,
      scrollLeft: 0,
      scrollTop: 0,
      hoverMeasure: null,
      hoverRow: null
    };
  }

  fetchData(essence: Essence): void {
    var { splits, dataSource } = essence;
    var measures = essence.getMeasures();

    var $main = $('main');

    var query = ply()
      .apply('main', $main.filter(essence.getEffectiveFilter(Table.id).toExpression()));

    measures.forEach((measure) => {
      query = query.performAction(measure.toApplyAction());
    });

    function makeQuery(i: number): Expression {
      var split = splits.get(i);
      var { sortAction, limitAction } = split;
      if (!sortAction) throw new Error('something went wrong in table query generation');

      var subQuery = $main.split(split.toSplitExpression(), SEGMENT);

      measures.forEach((measure) => {
        subQuery = subQuery.performAction(measure.toApplyAction());
      });

      var applyForSort = essence.getApplyForSort(sortAction);
      if (applyForSort) {
        subQuery = subQuery.performAction(applyForSort);
      }
      subQuery = subQuery.performAction(sortAction);

      if (limitAction) {
        subQuery = subQuery.performAction(limitAction);
      }

      if (i + 1 < splits.length()) {
        subQuery = subQuery.apply(SPLIT, makeQuery(i + 1));
      }

      return subQuery;
    }

    query = query.apply(SPLIT, makeQuery(0));

    this.setState({ loading: true });
    dataSource.executor(query)
      .then(
        (dataset) => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset,
            error: null,
            flatData: dataset.flatten({
              order: 'preorder',
              nestingName: '__nest',
              parentName: '__parent'
            })
          });
        },
        (error) => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset: null,
            error,
            flatData: null
          });
        }
      );
  }

  componentDidMount() {
    this.mounted = true;
    var { essence } = this.props;
    this.fetchData(essence);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    var { essence } = this.props;
    var nextEssence = nextProps.essence;
    if (
      nextEssence.differentDataSource(essence) ||
      nextEssence.differentEffectiveFilter(essence, Table.id) ||
      nextEssence.differentSplits(essence) ||
      nextEssence.newSelectedMeasures(essence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onScroll(e: UIEvent) {
    var target = <Element>e.target;
    this.setState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop
    });
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
      var measure = essence.getMeasures().get(measureIndex);
      if (!measure) return { what: 'whitespace' };
      return { what: 'header', measure };
    }

    y = y - HEADER_HEIGHT + scrollTop;
    var rowIndex = Math.floor(y / ROW_HEIGHT);
    var datum = flatData ? flatData[rowIndex] : null;
    if (!datum) return { what: 'whitespace' };
    return { what: 'row', row: datum };
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
    var pos = this.calculateMousePosition(e);

    if (pos.what === 'corner' || pos.what === 'header') {
      var sortExpression = $(pos.what === 'corner' ? SEGMENT : pos.measure.name);
      var commonSort = essence.getCommonSort();
      var myDescending = (commonSort && commonSort.expression.equals(sortExpression) && commonSort.direction === SortAction.DESCENDING);
      clicker.changeSplits(essence.splits.changeSortAction(new SortAction({
        expression: sortExpression,
        direction: myDescending ? SortAction.ASCENDING : SortAction.DESCENDING
      })), VisStrategy.KeepAlways);

    } else if (pos.what === 'row') {
      var rowHighlight = getFilterFromDatum(essence.splits, pos.row);

      if (essence.highlightOn(Table.id)) {
        if (rowHighlight.equals(essence.highlight.delta)) {
          clicker.dropHighlight();
          return;
        }
      }

      clicker.changeHighlight(Table.id, rowHighlight);
    }
  }

  render() {
    var { clicker, essence, stage } = this.props;
    var { loading, error, flatData, scrollLeft, scrollTop, hoverMeasure, hoverRow } = this.state;
    var { splits } = essence;

    var segmentTitle = splits.getTitle(essence.dataSource);
    var commonSort = essence.getCommonSort();
    var commonSortName = commonSort ? (<RefExpression>commonSort.expression).name : null;

    var sortArrowIcon = commonSort ? React.createElement(SvgIcon, {
      svg: require('../../icons/sort-arrow.svg'),
      className: 'sort-arrow ' + commonSort.direction
    }) : null;

    var cornerSortArrow: React.ReactElement<any> = null;
    if (commonSortName === SEGMENT) {
      cornerSortArrow = sortArrowIcon;
    }

    var measuresArray = essence.getMeasures().toArray();

    var headerColumns = measuresArray.map((measure, i) => {
      return JSX(`
        <div
          className={'measure-name' + (measure === hoverMeasure ? ' hover' : '')}
          key={measure.name}
        >
          <div className="title-wrap">{measure.title}</div>
          {commonSortName === measure.name ? sortArrowIcon : null}
        </div>
      `);
    });

    var segments: React.DOMElement<any>[] = [];
    var rows: React.DOMElement<any>[] = [];
    var highlighter: React.DOMElement<any> = null;
    var highlighterStyle: any = null;
    if (flatData) {
      var formatters = measuresArray.map(measure => {
        var measureName = measure.name;
        var measureValues = flatData.map((d: Datum) => d[measureName]);
        return formatterFromData(measureValues, measure.format);
      });

      var highlightDelta: Filter = null;
      if (essence.highlightOn(Table.id)) {
        highlightDelta = essence.highlight.delta;
      }

      const skipNumber = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT));
      const lastElementToShow = Math.min(flatData.length, Math.ceil((scrollTop + stage.height) / ROW_HEIGHT));

      var rowY = skipNumber * ROW_HEIGHT;
      for (var i = skipNumber; i < lastElementToShow; i++) {
        var d = flatData[i];
        var nest = d['__nest'];
        var segmentValue = d[SEGMENT];
        var segmentName = nest ? formatSegment(segmentValue) : 'Total';
        var left = Math.max(0, nest - 1) * INDENT_WIDTH;
        var segmentStyle = { left: left, width: SEGMENT_WIDTH - left, top: rowY };
        var hoverClass = d === hoverRow ? ' hover' : '';

        var selected = false;
        var selectedClass = '';
        if (highlightDelta) {
          selected = highlightDelta && highlightDelta.equals(getFilterFromDatum(splits, d));
          selectedClass = selected ? 'selected' : 'not-selected';
        }

        segments.push(JSX(`
          <div
            className={'segment nest' + nest + ' ' + selectedClass + hoverClass}
            key={'_' + i}
            style={segmentStyle}
          >{segmentName}</div>
        `));

        var row = measuresArray.map((measure, j) => {
          var measureValue = d[measure.name];
          var measureValueStr = formatters[j](measureValue);
          return JSX(`<div className="measure" key={measure.name}>{measureValueStr}</div>`);
        });

        var rowStyle = { top: rowY };
        rows.push(JSX(`
          <div
            className={'row nest' + nest + ' ' + selectedClass + hoverClass}
            key={'_' + i}
            style={rowStyle}
          >{row}</div>
        `));

        if (!highlighter && selected) {
          highlighterStyle = {
            top: rowY,
            left
          };
          highlighter = JSX(`<div className='highlighter' key='highlight' style={highlighterStyle}></div>`);
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

    const headerStyle = {
      width: rowWidthExtended,
      left: -scrollLeft
    };

    const segmentsStyle = {
      top: -scrollTop
    };

    const bodyHeight = flatData ? flatData.length * ROW_HEIGHT : 0;
    const bodyStyle = {
      left: -scrollLeft,
      top: -scrollTop,
      width: rowWidthExtended,
      height: bodyHeight
    };

    const highlightStyle = {
      top: -scrollTop
    };

    var horizontalScrollShadowStyle: any = { display: 'none' };
    if (scrollTop) {
      horizontalScrollShadowStyle = {
        width: SEGMENT_WIDTH + rowWidthExtended - scrollLeft
      };
    }

    var verticalScrollShadowStyle: any = { display: 'none' };
    if (scrollLeft) {
      verticalScrollShadowStyle = {};
    }

    const scrollerStyle = {
      width: SPACE_LEFT + SEGMENT_WIDTH + rowWidth + SPACE_RIGHT,
      height: HEADER_HEIGHT + bodyHeight + BODY_PADDING_BOTTOM
    };

    var highlightControls: React.ReactElement<any> = null;
    if (highlighter) {
      highlightControls = React.createElement(HighlightControls, {
        clicker,
        orientation: 'horizontal',
        style: {
          top: HEADER_HEIGHT + highlighterStyle.top - scrollTop + HIGHLIGHT_CONTROLS_TOP
        }
      });
    }

    var loader: React.ReactElement<any> = null;
    if (loading) {
      loader = React.createElement(Loader, null);
    }

    var queryError: React.ReactElement<any> = null;
    if (error) {
      queryError = React.createElement(QueryError, { error });
    }

    return JSX(`
      <div className="table">
        <div className="corner">
          <div className="corner-wrap">{segmentTitle}</div>
          {cornerSortArrow}
        </div>
        <div className="header-cont">
          <div className="header" style={headerStyle}>{headerColumns}</div>
        </div>
        <div className="segments-cont">
          <div className="segments" style={segmentsStyle}>{segments}</div>
        </div>
        <div className="body-cont">
          <div className="body" style={bodyStyle}>{rows}</div>
        </div>
        <div className="highlight-cont">
          <div className="highlight" style={highlightStyle}>{highlighter}</div>
        </div>
        <div className="horizontal-scroll-shadow" style={horizontalScrollShadowStyle}></div>
        <div className="vertical-scroll-shadow" style={verticalScrollShadowStyle}></div>
        {queryError}
        {loader}
        <div
          className="scroller-cont"
          ref="base"
          onScroll={this.onScroll.bind(this)}
          onMouseLeave={this.onMouseLeave.bind(this)}
          onMouseMove={this.onMouseMove.bind(this)}
          onClick={this.onClick.bind(this)}
        >
          <div className="scroller" style={scrollerStyle}></div>
        </div>
        {highlightControls}
      </div>
    `);
  }
}
