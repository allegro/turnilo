'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as numeral from 'numeral';
import { $, Expression, Dispatcher, Dataset, Datum } from 'plywood';
import { formatterFromData } from '../../utils/formatter';
import { Filter, SplitCombine, Dimension, Measure, DataSource } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

const HEADER_HEIGHT = 25;
const SEGMENT_WIDTH = 200;
const MEASURE_WIDTH = 100;
const ROW_HEIGHT = 25;
const EXTRA_SPACE = 90;

interface NestedTableVisProps {
  dataSource: DataSource;
  filter: Filter;
  splits: List<SplitCombine>;
  measures: List<Measure>;
  stage: ClientRect;
}

interface NestedTableVisState {
  dataset?: Dataset;
  scrollLeft?: number;
  scrollTop?: number;
}

export class NestedTableVis extends React.Component<NestedTableVisProps, NestedTableVisState> {

  constructor() {
    super();
    this.state = {
      dataset: null,
      scrollLeft: 0,
      scrollTop: 0
    };
  }

  fetchData(filter: Filter, measures: List<Measure>, splits: List<SplitCombine>) {
    var { dataSource } = this.props;
    var $main = $('main');

    var query: any = $()
      .apply('main', $main.filter(filter.toExpression()));

    measures.forEach((measure) => {
      query = query.apply(measure.name, measure.expression);
    });

    splits.forEach((split) => {
      var subQuery = $main.split(split.splitOn, 'Split');

      measures.forEach((measure) => {
        subQuery = subQuery.apply(measure.name, measure.expression);
      });
      subQuery = subQuery.sort($(measures.first().name), 'descending').limit(100);

      query = query.apply('Split', subQuery);
    });

    dataSource.dispatcher(query).then((dataset) => {
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    var props = this.props;
    this.fetchData(props.filter, props.measures, props.splits);
  }

  componentWillReceiveProps(nextProps: NestedTableVisProps) {
    var props = this.props;
    if (props.filter !== nextProps.filter || props.measures !== nextProps.measures || props.splits !== nextProps.splits) {
      this.fetchData(nextProps.filter, nextProps.measures, nextProps.splits);
    }
  }

  componentWillUnmount() {

  }

  onScroll(e: UIEvent) {
    var target = <Element>e.target;
    this.setState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop
    });
  }

  render() {
    var { measures } = this.props;
    var { dataset, scrollLeft, scrollTop } = this.state;

    var measuresArray = measures.toArray();

    var headerColumns = measuresArray.map(measure => {
      return JSX(`<div className="measure" key={measure.name}>{measure.title}</div>`);
    });

    var segments: React.DOMElement<any>[] = [];
    var rows: React.DOMElement<any>[] = [];
    if (dataset) {
      var rowData = dataset.data[0]['Split'].data;

      var formatters = measuresArray.map(measure => {
        var measureName = measure.name;
        var measureValues = rowData.map((d: Datum) => d[measureName]);
        return formatterFromData(measureValues, measure.format);
      });

      segments = rowData.map((d: Datum, rowIndex: number) => {
        return JSX(`<div className="segment" key={'_' + rowIndex}>{String(d['Split'])}</div>`);
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

    var headerStyle = { left: -scrollLeft };
    var segmentsStyle = { top: -scrollTop };
    var bodyStyle = { left: -scrollLeft, top: -scrollTop };
    var scrollerStyle = {
      width: (SEGMENT_WIDTH + MEASURE_WIDTH * measuresArray.length + EXTRA_SPACE) + 'px',
      height: (HEADER_HEIGHT + ROW_HEIGHT * rows.length + EXTRA_SPACE) + 'px'
    };

    return JSX(`
      <div className="nested-table-vis">
        <div className="corner">Segment</div>
        <div className="header-cont">
          <div className="header" style={headerStyle}>{headerColumns}</div>
        </div>
        <div className="segments-cont">
          <div className="segments" style={segmentsStyle}>{segments}</div>
        </div>
        <div className="body-cont">
          <div className="body" style={bodyStyle}>{rows}</div>
        </div>
        <div className="scroller-cont" onScroll={this.onScroll.bind(this)}>
          <div className="scroller" style={scrollerStyle}></div>
        </div>
      </div>
    `);
  }
}
