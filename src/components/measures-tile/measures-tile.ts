'use strict';

import { List, OrderedSet } from 'immutable';
import * as React from 'react/addons';
import * as numeral from 'numeral';
import { $, Expression, Dispatcher, Dataset } from 'plywood';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { TileHeader } from '../tile-header/tile-header';

var objectHasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj: any, key: string): boolean {
  return objectHasOwnProperty.call(obj, key);
}

interface MeasuresTileProps {
  clicker: Clicker;
  dataSource: DataSource;
  filter: Filter;
  selectedMeasures: OrderedSet<string>;
}

interface MeasuresTileState {
  dataset?: Dataset;
}

export class MeasuresTile extends React.Component<MeasuresTileProps, MeasuresTileState> {

  constructor() {
    super();
    this.state = {
      dataset: null
    };
  }

  fetchData(filter: Filter) {
    var { dataSource } = this.props;
    var measures = dataSource.measures;
    var $main = $('main');

    var query: any = $()
      .apply('main', $main.filter(filter.toExpression()));

    measures.forEach((measure) => {
      query = query.apply(measure.name, measure.expression);
    });

    dataSource.dispatcher(query).then((dataset) => {
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    var { filter } = this.props;
    this.fetchData(filter);
  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: MeasuresTileProps) {
    var props = this.props;
    if (props.filter !== nextProps.filter) {
      this.fetchData(nextProps.filter);
    }
  }

  render() {
    var { clicker, dataSource, selectedMeasures } = this.props;
    var { dataset } = this.state;

    var myDatum = dataset ? dataset.data[0] : null;

    var rows = dataSource.measures.map(measure => {
      var measureName = measure.name;
      var selected = selectedMeasures.has(measureName);

      var measureValueStr = '-';
      if (myDatum && hasOwnProperty(myDatum, measureName)) {
        measureValueStr = numeral(myDatum[measureName]).format(measure.format);
      }

      return JSX(`
        <div className={'row' + (selected ? ' selected' : '')} key={measureName}>
          <div className="measure-name" onClick={clicker.toggleMeasure.bind(clicker, measure)}>
            <div className="checkbox"></div>
            <div className="label">{measure.title}</div>
          </div>
          <div className="measure-value">{measureValueStr}</div>
        </div>
      `);
    });


    return JSX(`
      <div className="measures-tile">
        <TileHeader title="Measures"/>
        <div className="rows">{rows}</div>
      </div>
    `);
  }
}
