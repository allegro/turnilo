'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Dispatcher, Dataset, Datum, TimeRange } from 'plywood';
import { Stage, SplitCombine, Filter, Dimension, Measure, DataSource } from '../../models/index';
import { ChartLine } from '../chart-line/chart-line';
import { TimeAxis } from '../time-axis/time-axis';

function midpoint(timeRange: TimeRange): Date {
  return new Date((timeRange.start.valueOf() + timeRange.end.valueOf()) / 2);
}

interface MenuTimeSeriesProps {
  dataSource: DataSource;
  filter: Filter;
  dimension: Dimension;
}

interface MenuTimeSeriesState {
  dataset: Dataset;
}

export class MenuTimeSeries extends React.Component<MenuTimeSeriesProps, MenuTimeSeriesState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      dataset: null
    };
  }

  fetchData(filter: Filter, dimension: Dimension) {
    var { dataSource } = this.props;
    var measure = dataSource.getSortMeasure(dimension);

    var query: any = $('main')
      .filter(filter.toExpression())
      .split(dimension.getSplitCombine().splitOn, dimension.name)
      .apply(measure.name, measure.expression)
      .sort($(dimension.name), 'ascending');

    dataSource.dispatcher(query).then((dataset) => {
      if (!this.mounted) return;
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    this.mounted = true;
    var { filter, dimension } = this.props;
    this.fetchData(filter, dimension);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: MenuTimeSeriesProps) {
    var props = this.props;
    if (
      props.filter.equals(nextProps.filter) &&
      props.dimension.equals(nextProps.dimension)
    ) return;
    this.fetchData(nextProps.filter, nextProps.dimension);
  }

  render() {
    var { dataSource, dimension } = this.props;
    var { dataset } = this.state;
    var measure = dataSource.getSortMeasure(dimension);

    var width = 240;
    var height = 200;

    var svg: React.ReactElement<any> = null;
    if (dataset) {
      var dimensionName = dimension.name;
      var getX = (d: Datum) => midpoint(d[dimensionName]);
      var extentX = d3.extent(dataset.data, <any>getX);

      var measureName = measure.name;
      var getY = (d: Datum) => d[measureName];
      var extentY = d3.extent(dataset.data, getY);

      if (isNaN(extentY[0])) {
        console.log('isNaN(extentY[0])');
      }

      extentY[0] = Math.min(extentY[0] * 1.1, 0);
      extentY[1] = Math.max(extentY[1] * 1.1, 0);

      var scaleX = d3.time.scale()
        .domain(extentX)
        .range([0, width]);

      var scaleY = d3.scale.linear()
        .domain(extentY)
        .range([height, 0]);

      var lineStage: Stage = {
        width,
        height: height
      };

      svg = JSX(`
        <svg className="graph" width={width} height={height}>
          <g transform="translate(0,20)">
            <ChartLine
              dataset={dataset}
              getX={getX}
              getY={getY}
              scaleX={scaleX}
              scaleY={scaleY}
              stage={lineStage}
            />
          </g>
        </svg>
      `);
    }


    return JSX(`
      <div className="menu-time-series">
        {svg}
      </div>
    `);
  }
}
