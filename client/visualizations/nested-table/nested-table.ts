'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import * as numeral from 'numeral';
import { $, Expression, Executor, Dataset, Datum } from 'plywood';
import { listsEqual } from '../../utils/general';
import { formatterFromData } from '../../utils/formatter';
import { Stage, Filter, Essence, Splits, SplitCombine, Dimension, Measure, DataSource, Clicker, VisualizationProps, Resolve } from '../../models/index';

const HEADER_HEIGHT = 38;
const SEGMENT_WIDTH = 300;
const INDENT_WIDTH = 25;
const MEASURE_WIDTH = 100;
const ROW_HEIGHT = 30;
const SPACE_LEFT = 10;
const SPACE_RIGHT = 10;

const ROW_PADDING_RIGHT = 50;
const BODY_PADDING_BOTTOM = 90;

interface NestedTableState {
  dataset?: Dataset;
  scrollLeft?: number;
  scrollTop?: number;
}

export class NestedTable extends React.Component<VisualizationProps, NestedTableState> {
  static id = 'nested-table';
  static title = 'Nested Table';
  static handleCircumstance(dataSource: DataSource, splits: Splits): Resolve {
    return splits.length() ? Resolve.READY : Resolve.MANUAL;
  }

  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      dataset: null,
      scrollLeft: 0,
      scrollTop: 0
    };
  }

  fetchData(essence: Essence): void {
    var { filter, splits, dataSource } = essence;
    var measures = essence.getMeasures();

    var $main = $('main');

    var query: any = $()
      .apply('main', $main.filter(filter.toExpression()));

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

    dataSource.executor(query).then((dataset) => {
      if (!this.mounted) return;
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    this.mounted = true;
    var { essence } = this.props;
    this.fetchData(essence);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    var { essence } = this.props;
    var nextEssence = nextProps.essence;
    if (essence.differentOn(nextEssence, 'filter', 'splits', 'selectedMeasures')) {
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

  render() {
    var { essence, stage } = this.props;
    var { dataset, scrollLeft, scrollTop } = this.state;

    var segmentTitle = essence.splits.getTitle(essence.dataSource);

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
      return JSX(`<div className="measure-name" key={measure.name}>{measure.title}{sortArrow}</div>`);
    });

    var segments: React.DOMElement<any>[] = [];
    var rows: React.DOMElement<any>[] = [];
    if (dataset) {
      var rowData = dataset.flatten({
        order: 'preorder',
        nestingName: '__nest'
      });

      var formatters = measuresArray.map(measure => {
        var measureName = measure.name;
        var measureValues = rowData.map((d: Datum) => d[measureName]);
        return formatterFromData(measureValues, measure.format);
      });

      segments = rowData.map((d: Datum, rowIndex: number) => {
        var nest = d['__nest'];
        var segmentName = nest ? String(d['Segment']) : 'Total';
        var left = nest * INDENT_WIDTH;
        var style = { left: left, width: SEGMENT_WIDTH - left };
        return JSX(`<div className="segment" key={'_' + rowIndex} style={style}>{segmentName}</div>`);
      });

      rows = rowData.map((d: Datum, rowIndex: number) => {
        var row = measuresArray.map((measure, i) => {
          var measureValue = d[measure.name];
          var measureValueStr = formatters[i](measureValue);
          return JSX(`<div className="measure" key={measure.name}>{measureValueStr}</div>`);
        });

        return JSX(`<div className="row" key={'_' + rowIndex}>{row}</div>`);
      });
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

    const bodyStyle = {
      left: -scrollLeft,
      top: -scrollTop,
      width: rowWidthExtended
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
      height: HEADER_HEIGHT + ROW_HEIGHT * rows.length + BODY_PADDING_BOTTOM
    };

    return JSX(`
      <div className="nested-table">
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
        <div className="horizontal-scroll-shadow" style={horizontalScrollShadowStyle}></div>
        <div className="vertical-scroll-shadow" style={verticalScrollShadowStyle}></div>
        <div className="scroller-cont" onScroll={this.onScroll.bind(this)}>
          <div className="scroller" style={scrollerStyle}></div>
        </div>
      </div>
    `);
  }
}
