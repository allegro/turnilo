'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as d3 from 'd3';
import { $, Dispatcher, Expression, NativeDataset, Datum } from 'plywood';
import { bindOne, bindMany } from "../../utils/render";
import { Stage, SplitCombine, Filter, Dimension, Measure, DataSource } from "../../models/index";
import { ChartLine } from '../chart-line/chart-line';

function between(start: Date, end: Date) {
  return new Date((start.valueOf() + end.valueOf()) / 2);
}

interface TimeSeriesVisProps {
  dataSource: DataSource;
  filter: Filter;
  splits: List<SplitCombine>;
  measures: List<Measure>;
  stage: ClientRect;
}

interface TimeSeriesVisState {
  dataset: NativeDataset;
}

export class TimeSeriesVis extends React.Component<TimeSeriesVisProps, TimeSeriesVisState> {

  constructor() {
    super();
    this.state = {
      dataset: null
    };
  }

  fetchData(filter: Filter, measures: List<Measure>) {
    var { dataSource, splits } = this.props;

    var query: any = $('main')
      .filter(filter.toExpression());

    var firstSplit = splits.first();
    query = query.split(firstSplit.splitOn, firstSplit.dimension);

    measures.forEach((measure) => {
      query = query.apply(measure.name, measure.expression);
    });
    query = query.sort($(firstSplit.dimension), 'ascending');

    dataSource.dispatcher(query).then((dataset) => {
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    var { filter, measures } = this.props;
    this.fetchData(filter, measures);
  }

  componentWillReceiveProps(nextProps: TimeSeriesVisProps) {
    var props = this.props;
    if (props.filter !== nextProps.filter || props.measures !== nextProps.measures) {
      this.fetchData(nextProps.filter, nextProps.measures);
    }
  }

  componentWillUnmount() {

  }

  render() {
    var { filter, splits, measures, stage } = this.props;
    var { dataset } = this.state;

    var measureGraphs: Array<React.ReactElement<any>> = null;
    if (dataset && splits.size) {
      var firstSplit = splits.first();
      var splitName = firstSplit.dimension;
      var minTime = d3.min(dataset.data, (d) => d[splitName].start);
      var maxTime = d3.max(dataset.data, (d) => d[splitName].end);

      var scaleX = d3.time.scale()
        .domain([minTime, maxTime])
        .range([0, stage.width]);

      var height = 100;

      measureGraphs = measures.toArray().map((measure) => {
        var measureName = measure.name;
        var extentY = d3.extent(dataset.data, (d) => d[measureName]);
        extentY[0] = Math.min(extentY[0] * 1.1, 0);
        extentY[1] = Math.max(extentY[1] * 1.1, 0);

        var scaleY = d3.scale.linear()
          .domain(extentY)
          .range([height, 0]);

        var getX = (d: Datum) => {
          var timeRange = d[splitName];
          return between(timeRange.start, timeRange.end);
        };

        var getY = (d: Datum) => {
          return d[measureName];
        };

        var lineStage: Stage = {
          width: stage.width,
          height: height
        };

        return JSX(`
          <svg className="measure-graph" key={measure.name} width={lineStage.width} height={lineStage.height}>
            <ChartLine
              dataset={dataset}
              getX={getX}
              getY={getY}
              scaleX={scaleX}
              scaleY={scaleY}
              stage={lineStage}
            />
          </svg>
        `);
      });
    }

    return JSX(`
      <div className="time-series-vis">
        {measureGraphs}
      </div>
    `);
  }
}
