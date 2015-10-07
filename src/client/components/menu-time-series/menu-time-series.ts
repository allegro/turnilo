'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset, Datum, TimeRange, TimeBucketAction } from 'plywood';
import { Stage, Essence, VisStrategy, SplitCombine, Filter, Dimension, Measure, DataSource } from '../../../common/models/index';
import { SEGMENT, TIME_SORT_ACTION } from '../../config/constants';
import { ChartLine } from '../chart-line/chart-line';
import { TimeAxis } from '../time-axis/time-axis';

const X_AXIS_HEIGHT = 20;

function midpoint(timeRange: TimeRange): Date {
  return new Date((timeRange.start.valueOf() + timeRange.end.valueOf()) / 2);
}

export interface MenuTimeSeriesProps {
  essence: Essence;
  dimension: Dimension;
  stage: Stage;
}

export interface MenuTimeSeriesState {
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
    var measure = essence.getPreviewSortMeasure();

    var newEssence = essence.changeSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.FairGame);
    var timeSplit = newEssence.splits.last();
    var timeBucketAction = <TimeBucketAction>timeSplit.bucketAction;

    var query = $('main')
      .filter(essence.getEffectiveFilter().overQuery(timeBucketAction.duration, timeBucketAction.timezone, dataSource).toExpression())
      .split(timeSplit.toSplitExpression(), SEGMENT)
      .performAction(measure.toApplyAction())
      .performAction(TIME_SORT_ACTION);

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
    var measure = essence.getPreviewSortMeasure();

    var svgStage = stage;
    var lineStage = svgStage.within({ bottom: X_AXIS_HEIGHT });
    var xAxisStage = svgStage.within({ top: lineStage.height });

    var chartLine: React.ReactElement<any> = null;
    var timeAxis: React.ReactElement<any> = null;

    if (dataset) {
      var timeRange = essence.getEffectiveFilter().getTimeRange(essence.dataSource.timeAttribute);

      var getX = (d: Datum) => midpoint(d[SEGMENT]);

      var measureName = measure.name;
      var getY = (d: Datum) => d[measureName];
      var extentY = d3.extent(dataset.data, getY);

      if (isNaN(extentY[0])) {
        return null;
      }

      extentY[0] = Math.min(extentY[0] * 1.1, 0);
      extentY[1] = Math.max(extentY[1] * 1.1, 0);

      var scaleX = d3.time.scale()
        .domain([timeRange.start, timeRange.end])
        .range([0, lineStage.width]);

      var xTicks = scaleX.ticks(5);

      var scaleY = d3.scale.linear()
        .domain(extentY)
        .range([lineStage.height, 0]);

      chartLine = JSX(`
        <ChartLine
          dataset={dataset}
          getX={getX}
          getY={getY}
          scaleX={scaleX}
          scaleY={scaleY}
          stage={lineStage}
          showArea={true}
        />
      `);

      timeAxis = JSX(`
        <TimeAxis stage={xAxisStage} xTicks={xTicks} scaleX={scaleX}/>
      `);
    }

    return JSX(`
      <div className="menu-time-series">
        <svg className="graph" width={svgStage.width} height={svgStage.height}>
          {chartLine}
          <rect className="frame" width={lineStage.width} height={lineStage.height}/>
          {timeAxis}
        </svg>
      </div>
    `);
  }
}
