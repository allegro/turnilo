'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset, Datum, TimeRange } from 'plywood';
import { Stage, Essence, SplitCombine, Filter, Dimension, Measure, DataSource } from '../../models/index';
import { ChartLine } from '../chart-line/chart-line';
import { TimeAxis } from '../time-axis/time-axis';
import { VerticalAxis } from '../vertical-axis/vertical-axis';

const Y_AXIS_WIDTH = 60;

function midpoint(timeRange: TimeRange): Date {
  return new Date((timeRange.start.valueOf() + timeRange.end.valueOf()) / 2);
}

interface MenuTimeSeriesProps {
  essence: Essence;
  dimension: Dimension;
  stage: Stage;
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
    var { essence } = this.props;
    var { dataSource } = essence;
    var measure = dataSource.getSortMeasure(dimension);

    var query: any = $('main')
      .filter(filter.toExpression())
      .split(dimension.getSplitCombine().toSplitExpression(), dimension.name)
      .apply(measure.name, measure.expression)
      .sort($(dimension.name), 'ascending');

    dataSource.executor(query).then((dataset) => {
      if (!this.mounted) return;
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    this.mounted = true;
    var { essence, dimension } = this.props;
    this.fetchData(essence.filter, dimension);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: MenuTimeSeriesProps) {
    var essence = this.props.essence;
    var nextEssence = nextProps.essence;
    if (
      essence.filter.equals(nextEssence.filter) &&
      this.props.dimension.equals(nextProps.dimension)
    ) return;
    this.fetchData(nextEssence.filter, nextProps.dimension);
  }

  render() {
    var { stage, essence, dimension } = this.props;
    var { dataset } = this.state;
    var measure = essence.dataSource.getSortMeasure(dimension);

    var svgStage = stage;

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

      var lineStage = svgStage.within({ right: Y_AXIS_WIDTH });
      var yAxisStage = svgStage.within({ left: lineStage.width });

      var scaleX = d3.time.scale()
        .domain(extentX)
        .range([0, lineStage.width]);

      var scaleY = d3.scale.linear()
        .domain(extentY)
        .range([lineStage.height, 0]);

      var yTicks = scaleY.ticks().filter((n: number, i: number) => n !== 0 && i % 2 === 0);

      svg = JSX(`
        <svg className="graph" width={svgStage.width} height={svgStage.height}>
          <ChartLine
            dataset={dataset}
            getX={getX}
            getY={getY}
            scaleX={scaleX}
            scaleY={scaleY}
            stage={lineStage}
          />
          <VerticalAxis
            stage={yAxisStage}
            yTicks={yTicks}
            scaleY={scaleY}
          />
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
