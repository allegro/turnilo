'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset, Datum, TimeRange } from 'plywood';
import { Stage, Essence, SplitCombine, Filter, Dimension, Measure, DataSource } from '../../../common/models/index';
import { ChartLine } from '../chart-line/chart-line';
import { TimeAxis } from '../time-axis/time-axis';

const X_AXIS_HEIGHT = 20;

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

  fetchData(essence: Essence, dimension: Dimension): void {
    var { dataSource } = essence;
    var measure = dataSource.getSortMeasure(dimension);

    var newEssence = essence.changeSplit(SplitCombine.fromExpression(dimension.expression));

    var query = $('main')
      .filter(essence.getEffectiveFilter().toExpression())
      .split(newEssence.splits.get(0).toSplitExpression(), dimension.name)
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
    this.fetchData(essence, dimension);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: MenuTimeSeriesProps) {
    var { essence, dimension } = this.props;
    var nextEssence = nextProps.essence;
    var nextDimension = nextProps.dimension;

    if (
      essence.differentDataSource(nextEssence) ||
      essence.differentEffectiveFilter(nextEssence) ||
      !dimension.equals(nextDimension)
    ) {
      this.fetchData(nextEssence, nextDimension);
    }
  }

  render() {
    var { stage, essence, dimension } = this.props;
    var { dataset } = this.state;
    var measure = essence.dataSource.getSortMeasure(dimension);

    var svgStage = stage;

    var svg: React.ReactElement<any> = null;
    if (dataset) {
      var timeRange = essence.getEffectiveFilter().getTimeRange(essence.dataSource.timeAttribute);

      var dimensionName = dimension.name;
      var getX = (d: Datum) => midpoint(d[dimensionName]);

      var measureName = measure.name;
      var getY = (d: Datum) => d[measureName];
      var extentY = d3.extent(dataset.data, getY);

      if (isNaN(extentY[0])) {
        return null;
      }

      extentY[0] = Math.min(extentY[0] * 1.1, 0);
      extentY[1] = Math.max(extentY[1] * 1.1, 0);

      var lineStage = svgStage.within({ bottom: X_AXIS_HEIGHT });
      var xAxisStage = svgStage.within({ top: lineStage.height });

      var scaleX = d3.time.scale()
        .domain([timeRange.start, timeRange.end])
        .range([0, lineStage.width]);

      var xTicks = scaleX.ticks(5);

      var scaleY = d3.scale.linear()
        .domain(extentY)
        .range([lineStage.height, 0]);

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
          <TimeAxis stage={xAxisStage} xTicks={xTicks} scaleX={scaleX}/>
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
