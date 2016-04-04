require('./time-series.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { $, ply, Executor, Expression, Dataset, Datum, TimeRange, TimeBucketAction, SortAction, ChainExpression } from 'plywood';
import { Stage, Essence, Splits, SplitCombine, Filter, Dimension, Measure, DataSource, VisualizationProps, Resolve, Colors } from "../../../common/models/index";
import { SPLIT, SEGMENT, TIME_SEGMENT, TIME_SORT_ACTION, VIS_H_PADDING } from '../../config/constants';
import { getXFromEvent, getYFromEvent } from '../../utils/dom/dom';
import { VisMeasureLabel } from '../../components/vis-measure-label/vis-measure-label';
import { ChartLine } from '../../components/chart-line/chart-line';
import { TimeAxis } from '../../components/time-axis/time-axis';
import { VerticalAxis } from '../../components/vertical-axis/vertical-axis';
import { GridLines } from '../../components/grid-lines/grid-lines';
import { Highlighter } from '../../components/highlighter/highlighter';
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';
import { SegmentBubble } from '../../components/segment-bubble/segment-bubble';
import { HoverMultiBubble } from '../../components/hover-multi-bubble/hover-multi-bubble';

const TEXT_SPACER = 36;
const X_AXIS_HEIGHT = 30;
const Y_AXIS_WIDTH = 60;
const MIN_CHART_HEIGHT = 140;
const HOVER_BUBBLE_V_OFFSET = 7;
const MAX_HOVER_DIST = 50;
const MAX_ASPECT_RATIO = 1; // width / height

function midpoint(timeRange: TimeRange): Date {
  if (!timeRange) return null;
  return new Date((timeRange.start.valueOf() + timeRange.end.valueOf()) / 2);
}

function findClosest(data: Datum[], dragDate: Date, scaleX: (t: Date) => number) {
  var closestDatum: Datum = null;
  var minDist = Infinity;
  for (var datum of data) {
    var timeSegmentValue = datum[TIME_SEGMENT] as TimeRange;
    if (!timeSegmentValue) continue;
    var mid: Date = midpoint(timeSegmentValue);
    var dist = Math.abs(mid.valueOf() - dragDate.valueOf());
    var distPx = Math.abs(scaleX(mid) - scaleX(dragDate));
    if ((!closestDatum || dist < minDist) && distPx < MAX_HOVER_DIST) { // Make sure it is not too far way
      closestDatum = datum;
      minDist = dist;
    }
  }
  return closestDatum;
}

export interface TimeSeriesState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
  dragStart?: number;
  scrollLeft?: number;
  scrollTop?: number;
  hoverTimeRange?: TimeRange;
  hoverDatums?: Datum[];
  hoverMeasure?: Measure;
}

export class TimeSeries extends React.Component<VisualizationProps, TimeSeriesState> {
  static id = 'time-series';
  static title = 'Time Series';

  static handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
    var timeDimensions = dataSource.getDimensionByKind('time');
    if (!timeDimensions.size) return Resolve.NEVER;

    // Has no splits
    if (splits.length() === 0) {
      return Resolve.manual(3, 'This visualization requires a time split',
        timeDimensions.toArray().map((timeDimension) => {
          return {
            description: `Add a split on ${timeDimension.title}`,
            adjustment: {
              splits: Splits.fromSplitCombine(SplitCombine.fromExpression(timeDimension.expression))
            }
          };
        })
      );
    }

    var colorSplit: SplitCombine = null;
    var timeSplit: SplitCombine = null;
    var overflowSplit: SplitCombine = null;
    splits.forEach((split) => {
      var dimension = split.getDimension(dataSource.dimensions);
      if (!dimension) return;
      if (dimension.kind === 'time') {
        timeSplit = split;
      } else {
        if (timeSplit) {
          overflowSplit = split;
        } else {
          colorSplit = split;
        }
      }
    });

    // Has a time split and other splits
    if (splits.length() > 2) {
      if (timeSplit) {
        return Resolve.manual(3, 'Too many splits', [
          {
            description: `Remove all but the time split`,
            adjustment: {
              splits: Splits.fromSplitCombine(timeSplit)
            }
          }
        ]);
      } else {
        return Resolve.manual(3, 'Too many splits',
          timeDimensions.toArray().map((timeDimension) => {
            return {
              description: `Split on ${timeDimension.title} instead`,
              adjustment: {
                splits: Splits.fromSplitCombine(SplitCombine.fromExpression(timeDimension.expression))
              }
            };
          })
        );
      }
    }

    // No time split
    if (!timeSplit) {
      var lastSplit = splits.last();
      var lastSplitDimension = lastSplit.getDimension(dataSource.dimensions);
      return Resolve.manual(3, 'This visualization requires a time split',
        timeDimensions.toArray().map((timeDimension) => {
          return {
            description: `Replace ${lastSplitDimension.title} with ${timeDimension.title}`,
            adjustment: {
              splits: Splits.fromSplitCombine(SplitCombine.fromExpression(timeDimension.expression))
            }
          };
        })
      );
    }

    var autoChanged = false;

    // Fix time sort
    if (!TIME_SORT_ACTION.equals(timeSplit.sortAction)) {
      timeSplit = timeSplit.changeSortAction(TIME_SORT_ACTION);
      autoChanged = true;
    }

    // Fix time limit
    if (timeSplit.limitAction) {
      timeSplit = timeSplit.changeLimitAction(null);
      autoChanged = true;
    }

    // Swap splits if needed
    if (overflowSplit) {
      colorSplit = overflowSplit;
      autoChanged = true;
    }

    // Adjust color split
    if (colorSplit) {
      if (!colorSplit.sortAction) {
        colorSplit = colorSplit.changeSortAction(dataSource.getDefaultSortAction());
        autoChanged = true;
      }

      var colorSplitDimension = dataSource.getDimensionByExpression(colorSplit.expression);
      if (!colors || colors.dimension !== colorSplitDimension.name) {
        colors = Colors.fromLimit(colorSplitDimension.name, 5);
        autoChanged = true;
      }

    } else if (colors) { // Remove colors if not needed
      colors = null;
      autoChanged = true;
    }

    if (!autoChanged) return Resolve.ready(10);

    var newSplits = [timeSplit];
    if (colorSplit) newSplits.unshift(colorSplit);

    return Resolve.automatic(8, {
      splits: new Splits(List(newSplits)),
      colors
    });
  }


  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      loading: false,
      dataset: null,
      dragStart: null,
      error: null,
      scrollLeft: 0,
      scrollTop: 0,
      hoverTimeRange: null,
      hoverDatums: null,
      hoverMeasure: null
    };
  }

  fetchData(essence: Essence): void {
    var { splits, colors, dataSource } = essence;
    var measures = essence.getEffectiveMeasures();

    // var timeSplit = splits.last();
    // var timeBucketAction = timeSplit.bucketAction as TimeBucketAction;
    //   .overQuery(timeBucketAction.duration, timeBucketAction.timezone, dataSource)

    var $main = $('main');

    var query = ply()
      .apply('main', $main.filter(essence.getEffectiveFilter(TimeSeries.id).toExpression()));

    measures.forEach((measure) => {
      query = query.performAction(measure.toApplyAction());
    });

    function makeQuery(i: number): Expression {
      var split = splits.get(i);
      var splitDimension = dataSource.getDimensionByExpression(split.expression);
      var { sortAction, limitAction } = split;
      if (!sortAction) throw new Error('something went wrong in time series query generation');

      var segmentName = splitDimension.kind === 'time' ? TIME_SEGMENT : SEGMENT;

      var subQuery: Expression = $main.split(split.toSplitExpression(), segmentName);

      if (colors && colors.dimension === splitDimension.name) {
        var havingFilter = colors.toHavingFilter(segmentName);
        if (havingFilter) {
          subQuery = subQuery.performAction(havingFilter);
        }
      }

      measures.forEach((measure) => {
        subQuery = subQuery.performAction(measure.toApplyAction());
      });

      var applyForSort = essence.getApplyForSort(sortAction);
      if (applyForSort) {
        subQuery = subQuery.performAction(applyForSort);
      }
      subQuery = subQuery.performAction(sortAction);

      if (colors && colors.dimension === splitDimension.name) {
        subQuery = subQuery.performAction(colors.toLimitAction());
      } else if (limitAction) {
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
        (dataset: Dataset) => {
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
      nextEssence.differentColors(essence) ||
      nextEssence.newEffectiveMeasures(essence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onScroll(e: UIEvent) {
    var target = e.target as Element;
    this.setState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop
    });
  }

  onMouseDown(e: MouseEvent) {
    var myDOM = ReactDOM.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    var dragStart = getXFromEvent(e) - (rect.left + VIS_H_PADDING);
    this.setState({ dragStart });
  }

  onMouseMove(dataset: Dataset, measure: Measure, scaleX: any, e: MouseEvent) {
    var { essence } = this.props;
    var { hoverTimeRange, hoverMeasure } = this.state;
    if (!dataset) return;

    var splitLength = essence.splits.length();

    var myDOM = ReactDOM.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    var dragDate = scaleX.invert(getXFromEvent(e) - (rect.left + VIS_H_PADDING));

    var thisHoverTimeRange: TimeRange = null;
    var thisHoverDatums: Datum[] = [];
    if (splitLength > 1) {
      var flatData = dataset.flatten();
      var closest = findClosest(flatData, dragDate, scaleX);

      if (closest) {
        thisHoverTimeRange = closest[TIME_SEGMENT] as TimeRange;
        var preFilter = flatData.filter(d => thisHoverTimeRange.equals(d[TIME_SEGMENT]));
        thisHoverDatums = dataset.data.map((myDatum: Datum) => {
          var seg = myDatum[SEGMENT];
          return preFilter.filter(d => d[SEGMENT] === seg)[0] || null;
        });
      }
    } else {
      var closestDatum = findClosest(dataset.data, dragDate, scaleX);
      if (closestDatum) {
        thisHoverTimeRange = closestDatum[TIME_SEGMENT] as TimeRange;
        thisHoverDatums.push(closestDatum);
      }
    }

    if (!hoverTimeRange || !hoverTimeRange.equals(thisHoverTimeRange) || measure !== hoverMeasure) {
      this.setState({
        hoverTimeRange: thisHoverTimeRange,
        hoverDatums: thisHoverDatums,
        hoverMeasure: measure
      });
    }
  }

  onMouseLeave(measure: Measure, e: MouseEvent) {
    const { hoverMeasure } = this.state;
    if (hoverMeasure === measure) {
      this.setState({
        hoverTimeRange: null,
        hoverDatums: null,
        hoverMeasure: null
      });
    }
  }

  onHighlightEnd() {
    this.setState({ dragStart: null });
  }

  renderChart(dataset: Dataset, measure: Measure, chartIndex: number, containerStage: Stage, chartStage: Stage, getX: any, scaleX: any, xTicks: Date[]): JSX.Element {
    const { essence } = this.props;
    const { scrollTop, hoverTimeRange, hoverDatums, hoverMeasure } = this.state;
    const { splits, colors, timezone } = essence;
    var splitLength = splits.length();

    var lineStage = chartStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH, bottom: 1 }); // leave 1 for border
    var yAxisStage = chartStage.within({ top: TEXT_SPACER, left: lineStage.width, bottom: 1 });

    var measureName = measure.name;
    var getY = (d: Datum) => d[measureName] as number;

    var myDatum: Datum = dataset.data[0];
    var mySplitDataset = myDatum[SPLIT] as Dataset;

    var extentY: number[] = null;
    if (splitLength === 1) {
      extentY = d3.extent(mySplitDataset.data, getY);
    } else {
      var minY = 0;
      var maxY = 0;

      mySplitDataset.data.forEach(datum => {
        var subDataset = datum[SPLIT] as Dataset;
        if (subDataset) {
          var tempExtentY = d3.extent(subDataset.data, getY);
          minY = Math.min(tempExtentY[0], minY);
          maxY = Math.max(tempExtentY[1], maxY);
        }
      });

      extentY = [minY, maxY];
    }

    var horizontalGridLines: JSX.Element;
    var chartLines: JSX.Element[];
    var verticalAxis: JSX.Element;
    if (!isNaN(extentY[0]) && !isNaN(extentY[1])) {
      var scaleY = d3.scale.linear()
        .domain([Math.min(extentY[0] * 1.1, 0), Math.max(extentY[1] * 1.1, 0)])
        .range([lineStage.height, 0]);

      var yTicks = scaleY.ticks(5).filter((n: number) => n !== 0);

      horizontalGridLines = <GridLines
        orientation="horizontal"
        scale={scaleY}
        ticks={yTicks}
        stage={lineStage}
      />;

      verticalAxis = <VerticalAxis
        stage={yAxisStage}
        ticks={yTicks}
        scale={scaleY}
      />;

      if (splitLength === 1) {
        chartLines = [];
        chartLines.push(<ChartLine
          key='single'
          dataset={mySplitDataset}
          getY={getY}
          scaleX={scaleX}
          scaleY={scaleY}
          stage={lineStage}
          showArea={true}
          hoverTimeRange={hoverMeasure === measure ? hoverTimeRange : null}
          color="default"
        />);
      } else {
        var colorValues: string[] = null;
        if (colors) colorValues = colors.getColors(mySplitDataset.data.map(d => d[SEGMENT]));

        chartLines = mySplitDataset.data.map((datum, i) => {
          var subDataset = datum[SPLIT] as Dataset;
          if (!subDataset) return null;
          return <ChartLine
            key={'single' + i}
            dataset={subDataset}
            getY={getY}
            scaleX={scaleX}
            scaleY={scaleY}
            stage={lineStage}
            showArea={false}
            hoverTimeRange={hoverMeasure === measure ? hoverTimeRange : null}
            color={colorValues ? colorValues[i] : null}
          />;
        });
      }
    }

    var chartSegmentBubble: JSX.Element = null;
    if (hoverTimeRange && hoverDatums && hoverMeasure === measure) {
      var leftOffset = containerStage.x + VIS_H_PADDING + scaleX(hoverTimeRange.midpoint());
      var topOffset = chartStage.height * chartIndex + scaleY(extentY[1]) + TEXT_SPACER - scrollTop - HOVER_BUBBLE_V_OFFSET;
      if (colors) {
        chartSegmentBubble = <HoverMultiBubble
          essence={essence}
          datums={hoverDatums}
          measure={measure}
          getY={getY}
          top={containerStage.y + topOffset + 30}
          left={leftOffset}
        />;
      } else {
        var getValue = (d: Datum) => d[TIME_SEGMENT];
        if (topOffset > 0) {
          chartSegmentBubble = <SegmentBubble
            timezone={timezone}
            datum={hoverDatums[0]}
            measure={measure}
            getValue={getValue}
            getY={getY}
            top={containerStage.y + topOffset}
            left={leftOffset}
          />;
        }
      }
    }

    return <div
      className="measure-time-chart"
      key={measureName}
      onMouseDown={this.onMouseDown.bind(this)}
      onMouseMove={this.onMouseMove.bind(this, mySplitDataset, measure, scaleX)}
      onMouseLeave={this.onMouseLeave.bind(this, measure)}
    >
      <svg width={chartStage.width} height={chartStage.height}>
        {horizontalGridLines}
        <GridLines
          orientation="vertical"
          scale={scaleX}
          ticks={xTicks}
          stage={lineStage}
        />
        {chartLines}
        {verticalAxis}
        <line
          className="vis-bottom"
          x1="0"
          y1={chartStage.height - 0.5}
          x2={chartStage.width}
          y2={chartStage.height - 0.5}
        />
      </svg>
      <VisMeasureLabel measure={measure} datum={myDatum}/>
      {chartSegmentBubble}
    </div>;
  }

  render() {
    var { clicker, essence, stage } = this.props;
    var { loading, dataset, error, dragStart } = this.state;
    var { splits, timezone } = essence;

    var measureCharts: JSX.Element[];
    var bottomAxis: JSX.Element;

    var timeRange = essence.getEffectiveFilter(TimeSeries.id).getTimeRange(essence.dataSource.timeAttribute);
    if (dataset && splits.length() && timeRange) {
      var measures = essence.getEffectiveMeasures().toArray();

      var getX = (d: Datum) => midpoint(d[TIME_SEGMENT] as TimeRange);

      var chartWidth = stage.width - VIS_H_PADDING * 2;
      var chartHeight = Math.max(
        MIN_CHART_HEIGHT,
        Math.floor(Math.min(
          chartWidth / MAX_ASPECT_RATIO,
          (stage.height - X_AXIS_HEIGHT) / measures.length
        ))
      );
      var chartStage = new Stage({
        x: VIS_H_PADDING,
        y: 0,
        width: chartWidth,
        height: chartHeight
      });

      var scaleX = d3.time.scale()
        .domain([timeRange.start, timeRange.end])
        .range([0, chartStage.width - Y_AXIS_WIDTH]);

      var xTicks = scaleX.ticks();

      measureCharts = measures.map((measure, chartIndex) => {
        return this.renderChart(dataset, measure, chartIndex, stage, chartStage, getX, scaleX, xTicks);
      });

      var xAxisStage = Stage.fromSize(chartStage.width, X_AXIS_HEIGHT);
      bottomAxis = <svg
        className="bottom-axis"
        width={xAxisStage.width}
        height={xAxisStage.height}
      >
        <TimeAxis stage={xAxisStage} ticks={xTicks} scale={scaleX} timezone={timezone}/>
      </svg>;

      var highlighter: JSX.Element = null;
      if (dragStart !== null || essence.highlightOn(TimeSeries.id)) {
        var timeSplit = splits.last();
        var timeBucketAction = timeSplit.bucketAction as TimeBucketAction;
        highlighter = <Highlighter
          clicker={clicker}
          essence={essence}
          highlightId={TimeSeries.id}
          scaleX={scaleX}
          dragStart={dragStart}
          duration={timeBucketAction.duration}
          timezone={timeBucketAction.timezone}
          onClose={this.onHighlightEnd.bind(this)}
        />;
      }
    }

    var loader: JSX.Element = null;
    if (loading) {
      loader = <Loader/>;
    }

    var queryError: JSX.Element = null;
    if (error) {
      queryError = <QueryError error={error}/>;
    }

    var measureChartsStyle = {
      maxHeight: stage.height - X_AXIS_HEIGHT
    };

    return <div className="time-series">
      <div className="measure-time-charts" style={measureChartsStyle} onScroll={this.onScroll.bind(this)}>
        {measureCharts}
      </div>
      {bottomAxis}
      {queryError}
      {loader}
      {highlighter}
    </div>;
  }
}
