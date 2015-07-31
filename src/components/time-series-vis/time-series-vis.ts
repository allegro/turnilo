'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as d3 from 'd3';
import * as numeral from 'numeral';
import { $, Dispatcher, Expression, NativeDataset, Datum, TimeRange } from 'plywood';
import { bindOne, bindMany } from "../../utils/render";
import { Stage, SplitCombine, Filter, Dimension, Measure, DataSource } from "../../models/index";
import { ChartLine } from '../chart-line/chart-line';
import { TimeAxis } from '../time-axis/time-axis';

const MAX_GRAPH_WIDTH = 500;

function midpoint(timeRange: TimeRange): Date {
  return new Date((timeRange.start.valueOf() + timeRange.end.valueOf()) / 2);
}

function getTimeExtent(dataset: NativeDataset, splits: List<SplitCombine>): [Date, Date] {
  if (!splits || !splits.size) return null;
  var extentData: Date[] = [];
  var lastSplitDatasets: NativeDataset[] = [dataset.data[0]['Split']];

  // ToDo: flatten / map

  var lastSplitDimension = splits.last().dimension;
  for (var lastSplitDataset of lastSplitDatasets) {
    var lastSplitData = lastSplitDataset.data;
    if (!lastSplitData.length) continue;
    extentData.push(
      lastSplitData[0][lastSplitDimension].start,
      lastSplitData[lastSplitData.length - 1][lastSplitDimension].end
    );
  }

  if (!extentData.length) return null;
  return d3.extent(extentData);
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
    var $main = $('main');

    var query: any = $()
      .apply('main', $main.filter(filter.toExpression()));

    measures.forEach((measure) => {
      query = query.apply(measure.name, measure.expression);
    });

    splits.forEach((split, i) => {
      var isLast = i === splits.size - 1;
      var subQuery = $main.split(split.splitOn, split.dimension);

      measures.forEach((measure) => {
        subQuery = subQuery.apply(measure.name, measure.expression);
      });
      if (isLast) {
        subQuery = subQuery.sort($(split.dimension), 'ascending');
      } else {
        subQuery = subQuery.sort($(measures.first().name), 'descending').limit(5);
      }

      query = query.apply('Split', subQuery);
    });

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

    if (!stage) {
      return JSX(`<div className="time-series-vis"></div>`);
    }

    var numberOfColumns = Math.ceil(stage.width / MAX_GRAPH_WIDTH);

    var measureGraphs: Array<React.ReactElement<any>> = null;
    var bottomAxes: Array<React.ReactElement<any>> = null;

    if (dataset && splits.size) {
      var extentX = getTimeExtent(dataset, splits);
      // if (!extentX)

      var myDatum: Datum = dataset.data[0];
      var myDataset: NativeDataset = myDatum['Split'];

      var splitName = splits.last().dimension;

      var width = Math.floor(stage.width / numberOfColumns);
      var height = 120;
      var innerHeight = 100;

      var scaleX = d3.time.scale()
        .domain(extentX)
        .range([0, width]);

      var measuresArray = measures.toArray();
      measureGraphs = measuresArray.map((measure) => {
        var measureName = measure.name;
        var getY = (d: Datum) => d[measureName];
        var extentY = d3.extent(myDataset.data, getY);

        if (isNaN(extentY[0])) {
          return JSX(`
            <svg className="measure-graph" key={measure.name} width={width} height={height}>
              <text x="5" y="15">{measure.title + ': Loading'}</text>
            </svg>
          `);
        }

        extentY[0] = Math.min(extentY[0] * 1.1, 0);
        extentY[1] = Math.max(extentY[1] * 1.1, 0);

        var scaleY = d3.scale.linear()
          .domain(extentY)
          .range([innerHeight, 0]);

        var getX = (d: Datum) => midpoint(d[splitName]);

        var lineStage: Stage = {
          width,
          height: innerHeight
        };

        return JSX(`
          <svg className="measure-graph" key={measure.name} width={width} height={height}>
            <g transform="translate(0,20)">
              <ChartLine
                dataset={myDataset}
                getX={getX}
                getY={getY}
                scaleX={scaleX}
                scaleY={scaleY}
                stage={lineStage}
              />
            </g>
            <text x="5" y="15">
              {measure.title + ': ' + numeral(myDatum[measureName]).format(measure.format)}
            </text>
          </svg>
        `);
      });

      bottomAxes = [];
      for (var i = 0; i < numberOfColumns; i++) {
        bottomAxes.push(JSX(`
          <svg className="bottom-axis" key={'bottom-axis-' + i} width={width} height={50}>
            <TimeAxis />
          </svg>
        `));
      }
    }

    return JSX(`
      <div className="time-series-vis">
        {measureGraphs}
        {bottomAxes}
      </div>
    `);
  }
}
