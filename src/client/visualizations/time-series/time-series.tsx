require('./time-series.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { $, ply, Executor, Expression, Dataset, Datum, TimeRange, TimeBucketAction, SortAction, ChainExpression } from 'plywood';
import { listsEqual } from '../../../common/utils/general/general';
import { Stage, Essence, Splits, SplitCombine, Filter, Dimension, Measure, DataSource, VisualizationProps, Resolve, Colors } from "../../../common/models/index";
import { SPLIT, SEGMENT, TIME_SEGMENT, TIME_SORT_ACTION } from '../../config/constants';
import { getXFromEvent, getYFromEvent } from '../../utils/dom/dom';
import { ChartLine, ChartLineProps } from '../../components/chart-line/chart-line';
import { TimeAxis } from '../../components/time-axis/time-axis';
import { VerticalAxis } from '../../components/vertical-axis/vertical-axis';
import { GridLines } from '../../components/grid-lines/grid-lines';
import { Highlighter } from '../../components/highlighter/highlighter';
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';
import { HoverBubble } from '../../components/hover-bubble/hover-bubble';
import { HoverMultiBubble } from '../../components/hover-multi-bubble/hover-multi-bubble';

const H_PADDING = 10;
const TEXT_SPACER = 36;
const X_AXIS_HEIGHT = 30;
const Y_AXIS_WIDTH = 60;
const MIN_GRAPH_HEIGHT = 140;
const MAX_GRAPH_WIDTH = 2000;
const HOVER_BUBBLE_V_OFFSET = -8;
const HOVER_BUBBLE_HEIGHT = 50;
const MAX_HOVER_DIST = 50;

function midpoint(timeRange: TimeRange): Date {
  if (!timeRange) return null;
  return new Date((timeRange.start.valueOf() + timeRange.end.valueOf()) / 2);
}

function findClosest(data: Datum[], dragDate: Date, scaleX: Function) {
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
    var measures = essence.getMeasures();

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
      nextEssence.newSelectedMeasures(essence)
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
    var dragStart = getXFromEvent(e) - (rect.left + H_PADDING);
    this.setState({ dragStart });
  }

  onMouseMove(dataset: Dataset, measure: Measure, scaleX: any, e: MouseEvent) {
    var { essence } = this.props;
    var { hoverTimeRange, hoverMeasure } = this.state;
    if (!dataset) return;

    var splitLength = essence.splits.length();

    var myDOM = ReactDOM.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    var dragDate = scaleX.invert(getXFromEvent(e) - (rect.left + H_PADDING));

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
    var { hoverMeasure } = this.state;
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

  renderChart(dataset: Dataset, measure: Measure, graphIndex: number, stage: Stage, svgStage: Stage, getX: any, scaleX: any, xTicks: Date[]): JSX.Element {
    var { essence } = this.props;
    var { scrollTop, hoverTimeRange, hoverDatums, hoverMeasure } = this.state;
    var { splits, colors } = essence;
    var splitLength = splits.length();

    var lineStage = svgStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH });
    var yAxisStage = svgStage.within({ top: TEXT_SPACER, left: lineStage.width });

    var measureName = measure.name;
    var getY = (d: Datum) => d[measureName] as number;

    var myDatum: Datum = dataset.data[0];
    var myDataset = myDatum[SPLIT] as Dataset;

    var extentY: number[] = null;
    if (splitLength === 1) {
      extentY = d3.extent(myDataset.data, getY);
    } else {
      var minY = 0;
      var maxY = 0;

      myDataset.data.forEach(datum => {
        var subDataset = datum[SPLIT] as Dataset;
        if (subDataset) {
          var tempExtentY = d3.extent(subDataset.data, getY);
          minY = Math.min(tempExtentY[0], minY);
          maxY = Math.max(tempExtentY[1], maxY);
        }
      });

      extentY = [minY, maxY];
    }

    if (isNaN(extentY[0])) {
      extentY = [0, 1];
    }

    extentY[0] = Math.min(extentY[0] * 1.1, 0);
    extentY[1] = Math.max(extentY[1] * 1.1, 0);

    var scaleY = d3.scale.linear()
      .domain(extentY)
      .range([lineStage.height, 0]);

    var yTicks = scaleY.ticks().filter((n: number, i: number) => n !== 0 && i % 2 === 0);

    var chartLines: JSX.Element[];
    if (splitLength === 1) {
      chartLines = [];
      chartLines.push(<ChartLine
        key='single'
        dataset={myDataset}
        getY={getY}
        scaleX={scaleX}
        scaleY={scaleY}
        stage={lineStage}
        showArea={true}
        hoverTimeRange={hoverMeasure === measure ? hoverTimeRange : null}
        color="default"
      />);
    } else {
      chartLines = myDataset.data.map((datum, i) => {
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
          color={colors.getColor(datum[SEGMENT], i)}
        />;
      });
    }

    var chartHoverBubble: JSX.Element = null;
    if (hoverTimeRange && hoverDatums && hoverMeasure === measure) {
      var leftOffset = stage.x + H_PADDING + scaleX(hoverTimeRange.midpoint());
      var topOffset = (svgStage.height + 1) * graphIndex + HOVER_BUBBLE_V_OFFSET - scrollTop;
      if (colors) {
        chartHoverBubble = <HoverMultiBubble
          essence={essence}
          datums={hoverDatums}
          measure={measure}
          getY={getY}
          top={stage.y + topOffset + 30}
          left={leftOffset}
        />;
      } else {
        if (topOffset > -HOVER_BUBBLE_HEIGHT) {
          chartHoverBubble = <HoverBubble
            essence={essence}
            datum={hoverDatums[0]}
            measure={measure}
            getY={getY}
            top={stage.y + topOffset}
            left={leftOffset}
          />;
        }
      }
    }

    return <div
      className="measure-graph"
      key={measureName}
      onMouseDown={this.onMouseDown.bind(this)}
      onMouseMove={this.onMouseMove.bind(this, myDataset, measure, scaleX)}
      onMouseLeave={this.onMouseLeave.bind(this, measure)}
    >
      <svg width={svgStage.width} height={svgStage.height}>
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
        <VerticalAxis
          stage={yAxisStage}
          yTicks={yTicks}
          scaleY={scaleY}
        />
      </svg>
      <div className="measure-label">
        <span className="measure-title">{measure.title}</span>
        <span className="colon">: </span>
        <span className="measure-value">{measure.formatFn(myDatum[measureName] as number)}</span>
      </div>
      {chartHoverBubble}
    </div>;
  }

  render() {
    var { clicker, essence, stage } = this.props;
    var { loading, dataset, error, dragStart } = this.state;
    var { splits } = essence;

    var numberOfColumns = Math.ceil(stage.width / MAX_GRAPH_WIDTH);

    var measureGraphs: Array<JSX.Element>;
    var bottomAxes: Array<JSX.Element>;

    var timeRange = essence.getEffectiveFilter(TimeSeries.id).getTimeRange(essence.dataSource.timeAttribute);
    if (dataset && splits.length() && timeRange) {
      var measures = essence.getMeasures().toArray();

      var getX = (d: Datum) => midpoint(d[TIME_SEGMENT] as TimeRange);

      var parentWidth = stage.width - H_PADDING * 2;
      var graphHeight = Math.max(MIN_GRAPH_HEIGHT, Math.floor((stage.height - X_AXIS_HEIGHT) / measures.length));
      var svgStage = new Stage({
        x: H_PADDING,
        y: 0,
        width: Math.floor(parentWidth / numberOfColumns),
        height: graphHeight - 1 // -1 for border
      });

      var scaleX = d3.time.scale()
        .domain([timeRange.start, timeRange.end])
        .range([0, svgStage.width - Y_AXIS_WIDTH]);

      var xTicks = scaleX.ticks();

      measureGraphs = measures.map((measure, chartIndex) => {
        return this.renderChart(dataset, measure, chartIndex, stage, svgStage, getX, scaleX, xTicks);
      });

      var xAxisStage = Stage.fromSize(svgStage.width, X_AXIS_HEIGHT);
      bottomAxes = [];
      for (var i = 0; i < numberOfColumns; i++) {
        bottomAxes.push(<svg
          className="bottom-axis"
          key={'bottom-axis-' + i}
          width={xAxisStage.width}
          height={xAxisStage.height}
        >
          <TimeAxis stage={xAxisStage} xTicks={xTicks} scaleX={scaleX}/>
        </svg>);
      }

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

    var measureGraphsStyle = {
      maxHeight: stage.height - X_AXIS_HEIGHT
    };

    var loader: JSX.Element = null;
    if (loading) {
      loader = <Loader/>;
    }

    var queryError: JSX.Element = null;
    if (error) {
      queryError = <QueryError error={error}/>;
    }

    return <div className="time-series">
      <div className="measure-graphs" style={measureGraphsStyle} onScroll={this.onScroll.bind(this)}>
        {measureGraphs}
      </div>
      {bottomAxes}
      {queryError}
      {loader}
      {highlighter}
    </div>;
  }
}
