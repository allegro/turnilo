'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import * as numeral from 'numeral';
import { $, ply, Expression, Executor, Dataset, Datum, TimeRange, Set } from 'plywood';
import { listsEqual } from '../../utils/general';
import { formatterFromData } from '../../utils/formatter';
import { Stage, Filter, Essence, Splits, SplitCombine, Dimension, Measure, DataSource, Clicker, VisualizationProps, Resolve } from '../../models/index';
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
    segments.unshift(flatDatum['Segment']);
    flatDatum = flatDatum['__parent'];
  }
  return new Filter(List(segments.map((segment, i) => {
    return splits.get(i).expression.in([segment]);
  })));
}

interface PositionHover {
  what: string;
  measure?: Measure;
  row?: Datum;
}

interface TableState {
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
    if (splits.length()) return Resolve.READY;
    var someDimension = dataSource.dimensions.get(1);
    return Resolve.manual('Please add at least one split', [
      {
        description: `Add a split on ${someDimension.title}`,
        adjustment: () => Splits.fromSplitCombine(someDimension.getSplitCombine())
      }
    ]);
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
      query = query.apply(measure.name, measure.expression);
    });

    var limit = splits.length() > 1 ? 10 : 50;
    function makeQuery(i: number): Expression {
      var split = splits.get(i);
      var subQuery = $main.split(split.toSplitExpression(), 'Segment');

      measures.forEach((measure) => {
        subQuery = subQuery.apply(measure.name, measure.expression);
      });
      subQuery = subQuery.sort($(measures.first().name), 'descending').limit(limit);

      if (i + 1 < splits.length()) {
        subQuery = subQuery.apply('Split', makeQuery(i + 1));
      }

      return subQuery;
    }

    query = query.apply('Split', makeQuery(0));

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
      essence.differentEffectiveFilter(nextEssence, Table.id) ||
      essence.differentSplits(nextEssence) ||
      essence.differentSelectedMeasures(nextEssence)
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
    var rect = React.findDOMNode(this.refs['base']).getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

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

    if (pos.what === 'header') {
      console.log('header click', pos.measure);

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

    var measuresArray = essence.getMeasures().toArray();

    var headerColumns = measuresArray.map((measure, i) => {
      var sortArrow: React.ReactElement<any> = null;
      if (i === 0) {
        sortArrow = React.createElement(Icon, {
          name: 'sort-arrow',
          className: 'arrow',
          width: 8
        });
      }
      return JSX(`
        <div
          className={'measure-name' + (measure === hoverMeasure ? ' hover' : '')}
          key={measure.name}
        >{measure.title}{sortArrow}</div>
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
        var segmentValue = d['Segment'];
        var segmentName = nest ? formatSegment(segmentValue) : 'Total';
        var left = Math.max(0, nest - 1) * INDENT_WIDTH;
        var segmentStyle = { left: left, width: SEGMENT_WIDTH - left, top: rowY };
        var hoverClass = d === hoverRow ? ' hover' : '';
        segments.push(JSX(`
          <div
            className={'segment nest' + nest + hoverClass}
            key={'_' + i}
            style={segmentStyle}
          >{segmentName}</div>
        `));

        var selected = highlightDelta && highlightDelta.equals(getFilterFromDatum(splits, d));

        var row = measuresArray.map((measure, j) => {
          var measureValue = d[measure.name];
          var measureValueStr = formatters[j](measureValue);
          return JSX(`<div className="measure" key={measure.name}>{measureValueStr}</div>`);
        });

        var rowStyle = { top: rowY };
        rows.push(JSX(`
          <div
            className={'row nest' + nest + ' ' + (selected ? 'selected' : 'not-selected') + hoverClass}
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
        <div className="corner">{segmentTitle}</div>
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
