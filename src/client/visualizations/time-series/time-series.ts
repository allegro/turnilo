'use strict';
require('./time-series.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as d3 from 'd3';
import * as numeral from 'numeral';
import { $, ply, Executor, Expression, Dataset, Datum, TimeRange, TimeBucketAction, SortAction, ChainExpression } from 'plywood';
import { listsEqual } from '../../../common/utils/general/general';
import { Stage, Essence, Splits, SplitCombine, Filter, Dimension, Measure, DataSource, Clicker, VisualizationProps, Resolve } from "../../../common/models/index";
import { SPLIT, SEGMENT, TIME_SORT_ACTION } from '../../config/constants';
import { ChartLine, ChartLineProps } from '../../components/chart-line/chart-line';
import { ChartLineHover } from '../../components/chart-line-hover/chart-line-hover';
import { TimeAxis } from '../../components/time-axis/time-axis';
import { VerticalAxis } from '../../components/vertical-axis/vertical-axis';
import { GridLines } from '../../components/grid-lines/grid-lines';
import { Highlighter } from '../../components/highlighter/highlighter';
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';

const H_PADDING = 10;
const TEXT_SPACER = 36;
const X_AXIS_HEIGHT = 30;
const Y_AXIS_WIDTH = 60;
const MIN_GRAPH_HEIGHT = 150;
const MAX_GRAPH_WIDTH = 2000;

function midpoint(timeRange: TimeRange): Date {
  return new Date((timeRange.start.valueOf() + timeRange.end.valueOf()) / 2);
}

export interface TimeSeriesState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
  dragStart?: number;
  hoverDatum?: Datum;
  hoverMeasure?: Measure;
}

export class TimeSeries extends React.Component<VisualizationProps, TimeSeriesState> {
  static id = 'time-series';
  static title = 'Time Series';
  static handleCircumstance(dataSource: DataSource, splits: Splits): Resolve {
    // Has no splits
    if (splits.length() < 1) {
      var timeDimension = dataSource.getTimeDimension();
      return Resolve.manual('This visualization requires a time split', [
        {
          description: `Add a split on ${timeDimension.title}`,
          adjustment: Splits.fromSplitCombine(SplitCombine.fromExpression(timeDimension.expression))
        }
      ]);
    }

    // Find the time split (if exists)
    var existingTimeSplit: SplitCombine = null;
    splits.forEach((split) => {
      var dimension = split.getDimension(dataSource);
      if (dimension && dimension.type === 'TIME') {
        existingTimeSplit = split;
      }
    });

    // Has a time split and other splits
    if (splits.length() > 1 && existingTimeSplit) {
      return Resolve.manual('This visualization does not yet support additional splits', [
        {
          description: `Remove all but the time split`,
          adjustment: Splits.fromSplitCombine(existingTimeSplit)
        }
      ]);
    }

    // Last split is not a time split
    var lastSplit = splits.last();
    if (existingTimeSplit !== lastSplit) {
      var lastSplitDimension = lastSplit.getDimension(dataSource);
      return Resolve.manual('This visualization requires a time split', [
        {
          description: `Replace ${lastSplitDimension.title} split with time`,
          adjustment: Splits.fromSplitCombine(SplitCombine.fromExpression(dataSource.timeAttribute))
        }
      ]);
    }

    var autoChanged = false;
    splits = splits.map((split) => {
      if (split === existingTimeSplit) {
        var { sortAction, limitAction } = split;

        if (limitAction) {
          split = split.changeLimitAction(null);
          autoChanged = true;
        }

        if (!TIME_SORT_ACTION.equals(sortAction)) {
          split = split.changeSortAction(TIME_SORT_ACTION);
          autoChanged = true;
        }

      } else {
        if (!split.sortAction) {
          split = split.changeSortAction(dataSource.getDefaultSortAction());
          autoChanged = true;
        }

        if (!split.limitAction) {
          split = split.changeLimit(5);
          autoChanged = true;
        }
      }

      return split;
    });

    return autoChanged ? Resolve.automatic(splits) : Resolve.READY;
  }


  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      loading: false,
      dataset: null,
      dragStart: null,
      error: null,
      hoverDatum: null,
      hoverMeasure: null
    };
  }

  fetchData(essence: Essence): void {
    var { splits, dataSource } = essence;
    var measures = essence.getMeasures();

    // var timeSplit = splits.last();
    // var timeBucketAction = <TimeBucketAction>timeSplit.bucketAction;
    //   .overQuery(timeBucketAction.duration, timeBucketAction.timezone, dataSource)

    var $main = $('main');

    var query = ply()
      .apply('main', $main.filter(essence.getEffectiveFilter(TimeSeries.id).toExpression()));

    measures.forEach((measure) => {
      query = query.performAction(measure.toApplyAction());
    });

    function makeQuery(i: number): Expression {
      var split = splits.get(i);
      var { sortAction, limitAction } = split;
      if (!sortAction) throw new Error('something went wrong in time series query generation');

      var subQuery = $main.split(split.toSplitExpression(), SEGMENT);

      measures.forEach((measure) => {
        subQuery = subQuery.performAction(measure.toApplyAction());
      });

      var applyForSort = essence.getApplyForSort(sortAction);
      if (applyForSort) {
        subQuery = subQuery.performAction(applyForSort);
      }
      subQuery = subQuery.performAction(sortAction);

      if (limitAction) {
        subQuery = subQuery.performAction(limitAction);
      }

      if (i + 1 < splits.length()) {
        subQuery = subQuery.apply(SPLIT, makeQuery(i + 1));
      }

      return subQuery;
    }

    query = query.apply(SPLIT, makeQuery(0));

    this.setState({ loading: true });
    dataSource.executor(query)
      .then(
        (dataset) => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset,
            error: null
          });
        },
        (error) => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset: null,
            error
          });
        }
      );
  }

  componentDidMount() {
    this.mounted = true;
    var { essence } = this.props;
    this.fetchData(essence);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    var { essence } = this.props;
    var nextEssence = nextProps.essence;
    if (
      nextEssence.differentDataSource(essence) ||
      nextEssence.differentEffectiveFilter(essence, TimeSeries.id) ||
      nextEssence.differentSplits(essence) ||
      nextEssence.newSelectedMeasures(essence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onMouseDown(e: MouseEvent) {
    var myDOM = ReactDOM.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    var dragStart = e.clientX - (rect.left + H_PADDING);
    this.setState({ dragStart });
  }

  onMouseMove(scaleX: any, measure: Measure, e: MouseEvent) {
    var { essence } = this.props;
    var { dataset, hoverDatum, hoverMeasure } = this.state;
    if (!dataset || essence.splits.length() > 1) return;

    var myDOM = ReactDOM.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    var dragDate = scaleX.invert(e.clientX - (rect.left + H_PADDING));

    var thisHoverDatum: Datum = null;
    var datums = dataset.data[0][SPLIT].data;
    for (var datum of datums) {
      if (datum[SEGMENT].contains(dragDate)) {
        thisHoverDatum = datum;
        break;
      }
    }

    if (hoverDatum !== thisHoverDatum || measure !== hoverMeasure) {
      this.setState({
        hoverDatum: thisHoverDatum,
        hoverMeasure: measure
      });
    }
  }

  onMouseLeave(measure: Measure, e: MouseEvent) {
    var { hoverDatum, hoverMeasure } = this.state;
    if (hoverDatum && hoverMeasure === measure) {
      this.setState({
        hoverDatum: null,
        hoverMeasure: null
      });
    }
  }

  onHighlightEnd() {
    this.setState({ dragStart: null });
  }

  render() {
    var { clicker, essence, stage } = this.props;
    var { loading, dataset, error, dragStart, hoverDatum, hoverMeasure } = this.state;
    var { splits } = essence;

    var numberOfColumns = Math.ceil(stage.width / MAX_GRAPH_WIDTH);

    var measureGraphs: Array<React.ReactElement<any>> = null;
    var bottomAxes: Array<React.ReactElement<any>> = null;

    if (dataset && splits.length()) {
      var timeRange = essence.getEffectiveFilter(TimeSeries.id).getTimeRange(essence.dataSource.timeAttribute);
      var measures = essence.getMeasures().toArray();

      var myDatum: Datum = dataset.data[0];
      var myDataset: Dataset = myDatum[SPLIT];

      var getX = (d: Datum) => midpoint(d[SEGMENT]);

      var parentWidth = stage.width - H_PADDING * 2;
      var graphHeight = Math.max(MIN_GRAPH_HEIGHT, Math.floor((stage.height - X_AXIS_HEIGHT) / measures.length));
      var svgStage = new Stage({
        x: H_PADDING,
        y: 0,
        width: Math.floor(parentWidth / numberOfColumns),
        height: graphHeight - 1 // -1 for border
      });

      var lineStage = svgStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH });
      var yAxisStage = svgStage.within({ top: TEXT_SPACER, left: lineStage.width });

      var scaleX = d3.time.scale()
        .domain([timeRange.start, timeRange.end])
        .range([0, lineStage.width]);

      var xTicks = scaleX.ticks();

      measureGraphs = measures.map((measure) => {
        var measureName = measure.name;
        var getY = (d: Datum) => d[measureName];
        var extentY: number[] = null;
        if (splits.length() === 1) {
          extentY = d3.extent(myDataset.data, getY);
        } else {
          if (myDataset.data[0][SPLIT]) {
            extentY = d3.extent(myDataset.data[0][SPLIT].data, getY);
          } else {
            extentY = [];
          }
        }

        if (isNaN(extentY[0])) {
          return null;
        }

        extentY[0] = Math.min(extentY[0] * 1.1, 0);
        extentY[1] = Math.max(extentY[1] * 1.1, 0);

        var scaleY = d3.scale.linear()
          .domain(extentY)
          .range([lineStage.height, 0]);

        var yTicks = scaleY.ticks().filter((n: number, i: number) => n !== 0 && i % 2 === 0);

        var chartLines: Array<React.ReactElement<any>> = null;
        if (splits.length() === 1) {
          chartLines = [
            React.createElement(ChartLine, <ChartLineProps>{
              key: 'single',
              dataset: myDataset,
              getX: getX,
              getY: getY,
              scaleX: scaleX,
              scaleY: scaleY,
              stage: lineStage,
              showArea: true
            })
          ];
        } else {
          chartLines = myDataset.data.map((datum, i) => {
            return React.createElement(ChartLine, <ChartLineProps>{
              key: 'single' + i,
              dataset: datum[SPLIT],
              getX: getX,
              getY: getY,
              scaleX: scaleX,
              scaleY: scaleY,
              stage: lineStage,
              showArea: false,
              color: i
            });
          });
        }

        var chartLineHover: React.ReactElement<any> = null;
        var chartHoverBubble: React.DOMElement<any> = null;
        if (hoverDatum && hoverMeasure === measure) {
          chartLineHover = React.createElement(ChartLineHover, {
            datum: hoverDatum,
            getX,
            getY,
            scaleX,
            scaleY,
            stage: lineStage
          });

          var chartHoverBubbleStyle = { left: scaleX(getX(hoverDatum)) };
          chartHoverBubble = JSX(`
            <div className="hover-bubble-cont" style={chartHoverBubbleStyle}>
              <div className="hover-bubble">
                <div className="text">{numeral(getY(hoverDatum)).format(measure.format)}</div>
                <div className="shpitz"></div>
              </div>
            </div>
          `);
        }

        return JSX(`
          <div className="measure-graph" key={measureName}>
            <svg
              width={svgStage.width}
              height={svgStage.height}
              onMouseDown={this.onMouseDown.bind(this)}
              onMouseMove={this.onMouseMove.bind(this, scaleX, measure)}
              onMouseLeave={this.onMouseLeave.bind(this, measure)}
            >
              <GridLines
                orientation="horizontal"
                scale={scaleY}
                ticks={yTicks}
                stage={lineStage}
              />
              <GridLines
                orientation="vertical"
                scale={scaleX}
                ticks={xTicks}
                stage={lineStage}
              />
              {chartLines}
              {chartLineHover}
              <VerticalAxis
                stage={yAxisStage}
                yTicks={yTicks}
                scaleY={scaleY}
              />
            </svg>
            <div className="measure-label">
              <span className="measure-title">{measure.title}</span>
              <span className="colon">: </span>
              <span className="measure-value">{numeral(myDatum[measureName]).format(measure.format)}</span>
            </div>
            {chartHoverBubble}
          </div>
        `);
      });

      var xAxisStage = Stage.fromSize(svgStage.width, X_AXIS_HEIGHT);
      bottomAxes = [];
      for (var i = 0; i < numberOfColumns; i++) {
        bottomAxes.push(JSX(`
          <svg className="bottom-axis" key={'bottom-axis-' + i} width={xAxisStage.width} height={xAxisStage.height}>
            <TimeAxis stage={xAxisStage} xTicks={xTicks} scaleX={scaleX}/>
          </svg>
        `));
      }

      var highlighter: React.ReactElement<any> = null;
      if (dragStart !== null || essence.highlightOn(TimeSeries.id)) {
        var timeSplit = splits.last();
        var timeBucketAction = <TimeBucketAction>timeSplit.bucketAction;
        highlighter = React.createElement(Highlighter, {
          clicker,
          essence,
          highlightId: TimeSeries.id,
          scaleX,
          dragStart,
          duration: timeBucketAction.duration,
          timezone: timeBucketAction.timezone,
          onClose: <Function>this.onHighlightEnd.bind(this)
        });
      }
    }

    var measureGraphsStyle = {
      maxHeight: stage.height - X_AXIS_HEIGHT
    };

    var loader: React.ReactElement<any> = null;
    if (loading) {
      loader = React.createElement(Loader, null);
    }

    var queryError: React.ReactElement<any> = null;
    if (error) {
      queryError = React.createElement(QueryError, { error });
    }

    return JSX(`
      <div className="time-series">
        <div className="measure-graphs" style={measureGraphsStyle}>
          {measureGraphs}
        </div>
        {bottomAxes}
        {queryError}
        {loader}
        {highlighter}
      </div>
    `);
  }
}
