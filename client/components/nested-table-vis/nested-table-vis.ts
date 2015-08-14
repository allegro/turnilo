'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as numeral from 'numeral';
import { $, Expression, Dispatcher, Dataset, Datum } from 'plywood';
import { formatterFromData } from '../../utils/formatter';
import { Filter, SplitCombine, Dimension, Measure, DataSource } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

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
}

export class NestedTableVis extends React.Component<NestedTableVisProps, NestedTableVisState> {

  constructor() {
    super();
    this.state = {
      dataset: null,
      scrollLeft: 0
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
    this.setState({
      scrollLeft: (<Element>e.target).scrollLeft
    });
  }

  render() {
    var { measures } = this.props;
    var { dataset, scrollLeft } = this.state;

    var measuresArray = measures.toArray();

    var headerColumns = [
      JSX(`<div className="segment" key="_segment">Segment</div>`)
    ].concat(measuresArray.map(measure => {
        return JSX(`<div className="measure" key={measure.name}>{measure.title}</div>`);
      }));

    var rows: React.DOMElement<any>[] = [];
    if (dataset) {
      var rowData = dataset.data[0]['Split'].data;

      var formatters = measuresArray.map(measure => {
        var measureName = measure.name;
        var measureValues = rowData.map((d: Datum) => d[measureName]);
        return formatterFromData(measureValues, measure.format);
      });

      rows = rowData.map((d: Datum, rowIndex: number) => {
        var row = [
          JSX(`<div className="segment" key="_segment">{String(d['Split'])}</div>`)
        ].concat(measuresArray.map((measure, i) => {
            var measureValue = d[measure.name];
            var measureValueStr = formatters[i](measureValue);
            return JSX(`<div className="measure" key={measure.name}>{measureValueStr}</div>`);
          }));

        return JSX(`<div className="row" key={'_' + rowIndex}>{row}</div>`);
      });
    }

    var headerRowStyle = { left: -scrollLeft };
    return JSX(`
      <div className="nested-table-vis">
        <div className="header">
          <div className="header-row" style={headerRowStyle}>{headerColumns}</div>
        </div>
        <div className="table-body" onScroll={this.onScroll.bind(this)}>
          <div className="rows">{rows}</div>
        </div>
      </div>
    `);
  }
}
