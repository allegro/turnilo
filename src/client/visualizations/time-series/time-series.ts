'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as d3 from 'd3';
import * as numeral from 'numeral';
import { $, ply, Executor, Expression, Dataset, Datum, TimeRange, TimeBucketAction, ChainExpression } from 'plywood';
import { listsEqual } from '../../../common/utils/general/general';
import { Stage, Essence, Splits, SplitCombine, Filter, Dimension, Measure, DataSource, Clicker, VisualizationProps, Resolve } from "../../../common/models/index";
import { ChartLine } from '../../components/chart-line/chart-line';
import { ChartLineHover } from '../../components/chart-line-hover/chart-line-hover';
import { TimeAxis } from '../../components/time-axis/time-axis';
import { VerticalAxis } from '../../components/vertical-axis/vertical-axis';
import { GridLines } from '../../components/grid-lines/grid-lines';
import { Highlighter } from '../../components/highlighter/highlighter';
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';

const H_PADDING = 10;
const TITLE_TEXT_LEFT = 6;
const TITLE_TEXT_TOP = 25;
const TEXT_SPACER = 36;
const X_AXIS_HEIGHT = 30;
const Y_AXIS_WIDTH = 60;
const GRAPH_HEIGHT = 120;
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
    if (splits.length() < 1) {
      var timeDimension = dataSource.getTimeDimension();
      return Resolve.manual('Please add at least one time split', [
        {
          description: `Add a split on ${timeDimension.title}`,
          adjustment: () => Splits.fromSplitCombine(SplitCombine.fromExpression(timeDimension.expression))
        }
      ]);
    }
    if (splits.length() > 1) {
      var existingTimeSplit: SplitCombine = null;
      splits.forEach((split) => {
        var dimension = split.getDimension(dataSource);
        if (dimension && dimension.type === 'TIME') {
          existingTimeSplit = split;
        }
      });

      if (existingTimeSplit) {
        return Resolve.manual('Too many splits', [
          {
            description: `Remove all but the time split`,
            adjustment: () => Splits.fromSplitCombine(existingTimeSplit)
          }
        ]);
      }
    }
    var lastSplit = splits.last();
    var splitDimension = lastSplit.getDimension(dataSource);
    if (splitDimension.type !== 'TIME') {
      return Resolve.manual('Must be a time split', [
        {
          description: `Replace ${splitDimension.title} split with time`,
          adjustment: () => Splits.fromSplitCombine(SplitCombine.fromExpression(dataSource.timeAttribute))
        }
      ]);
    }

    return Resolve.READY;
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

    var $main = $('main');

    var query = ply()
      .apply('main', $main.filter(essence.getEffectiveFilter(TimeSeries.id).toExpression()));

    measures.forEach((measure) => {
      query = query.apply(measure.name, measure.expression);
    });

    var splitsSize = splits.length();
    splits.forEach((split, i) => {
      var isLast = i === splitsSize - 1;
      var subQuery = $main.split(split.toSplitExpression(), 'Segment');

      measures.forEach((measure) => {
        subQuery = subQuery.apply(measure.name, measure.expression);
      });
      if (isLast) {
        subQuery = subQuery.sort($('Segment'), 'ascending');
      } else {
        subQuery = subQuery.sort($(measures.first().name), 'descending').limit(5);
      }

      query = query.apply('Split', subQuery);
    });

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
      essence.differentDataSource(nextEssence) ||
      essence.differentEffectiveFilter(nextEssence, TimeSeries.id) ||
      essence.differentSplits(nextEssence) ||
      essence.differentSelectedMeasures(nextEssence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onMouseDown(e: MouseEvent) {
    var myDOM = React.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    var dragStart = e.clientX - (rect.left + H_PADDING);
    this.setState({ dragStart });
  }

  onMouseMove(scaleX: any, measure: Measure, e: MouseEvent) {
    var { dataset, hoverDatum, hoverMeasure } = this.state;
    if (!dataset) return;

    var myDOM = React.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    var dragDate = scaleX.invert(e.clientX - (rect.left + H_PADDING));

    var thisHoverDatum: Datum = null;
    var datums = dataset.data[0]['Split'].data;
    for (var datum of datums) {
      if (datum['Segment'].contains(dragDate)) {
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

      var myDatum: Datum = dataset.data[0];
      var myDataset: Dataset = myDatum['Split'];

      var getX = (d: Datum) => midpoint(d['Segment']);

      var parentWidth = stage.width - H_PADDING * 2;
      var svgStage = new Stage({
        x: H_PADDING,
        y: 0,
        width: Math.floor(parentWidth / numberOfColumns),
        height: TEXT_SPACER + GRAPH_HEIGHT
      });

      var lineStage = svgStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH });
      var yAxisStage = svgStage.within({ top: TEXT_SPACER, left: lineStage.width });

      var scaleX = d3.time.scale()
        .domain([timeRange.start, timeRange.end])
        .range([0, lineStage.width]);

      var xTicks = scaleX.ticks();

      measureGraphs = essence.getMeasures().toArray().map((measure) => {
        var measureName = measure.name;
        var getY = (d: Datum) => d[measureName];
        var extentY = d3.extent(myDataset.data, getY);

        if (isNaN(extentY[0])) {
          return JSX(`
            <svg className="measure-graph" key={measure.name} width={svgStage.width} height={svgStage.height}>
              <text x={TITLE_TEXT_LEFT} y={TITLE_TEXT_TOP}>{measure.title + ': Loading'}</text>
            </svg>
          `);
        }

        extentY[0] = Math.min(extentY[0] * 1.1, 0);
        extentY[1] = Math.max(extentY[1] * 1.1, 0);

        var scaleY = d3.scale.linear()
          .domain(extentY)
          .range([lineStage.height, 0]);

        var yTicks = scaleY.ticks().filter((n: number, i: number) => n !== 0 && i % 2 === 0);

        var chartHoverLine: React.ReactElement<any> = null;
        if (hoverDatum && hoverMeasure === measure) {
          chartHoverLine = React.createElement(ChartLineHover, {
            datum: hoverDatum,
            getX,
            getY,
            scaleX,
            scaleY,
            stage: lineStage,
            measure
          });
        }

        return JSX(`
          <svg
            className="measure-graph"
            key={measureName}
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
            <ChartLine
              dataset={myDataset}
              getX={getX}
              getY={getY}
              scaleX={scaleX}
              scaleY={scaleY}
              stage={lineStage}
            />
            {chartHoverLine}
            <VerticalAxis
              stage={yAxisStage}
              yTicks={yTicks}
              scaleY={scaleY}
            />
            <text className="measure-label" x={TITLE_TEXT_LEFT} y={TITLE_TEXT_TOP}>
              <tspan className="measure-title">{measure.title}</tspan>
              <tspan className="colon">: </tspan>
              <tspan className="measure-value">{numeral(myDatum[measureName]).format(measure.format)}</tspan>
            </text>
          </svg>
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
        var timeSplit = splits.first(); // ToDo: fix this
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
