require('./time-series.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { r, $, ply, Executor, Expression, Dataset, Datum, TimeRange, TimeRangeJS, TimeBucketAction } from 'plywood';
import { Stage, Essence, Splits, SplitCombine, Filter, FilterClause, Measure, DataSource, VisualizationProps, Resolve, Colors } from "../../../common/models/index";
import { SPLIT, SEGMENT, TIME_SEGMENT, TIME_SORT_ACTION, VIS_H_PADDING } from '../../config/constants';
import { getXFromEvent, escapeKey } from '../../utils/dom/dom';
import { formatTimeRange, DisplayYear } from '../../utils/date/date';
import { VisMeasureLabel } from '../../components/vis-measure-label/vis-measure-label';
import { ChartLine } from '../../components/chart-line/chart-line';
import { TimeAxis } from '../../components/time-axis/time-axis';
import { VerticalAxis } from '../../components/vertical-axis/vertical-axis';
import { GridLines } from '../../components/grid-lines/grid-lines';
import { Highlighter } from '../../components/highlighter/highlighter';
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';
import { SegmentBubble } from '../../components/segment-bubble/segment-bubble';
import { HoverMultiBubble, ColorEntry } from '../../components/hover-multi-bubble/hover-multi-bubble';

const TEXT_SPACER = 36;
const X_AXIS_HEIGHT = 30;
const Y_AXIS_WIDTH = 60;
const MIN_CHART_HEIGHT = 140;
const HOVER_BUBBLE_V_OFFSET = -7;
const HOVER_MULTI_BUBBLE_V_OFFSET = -8;
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

function findInDataset(dataset: Dataset, attribute: string, value: TimeRange): Datum {
  return dataset.data.filter(d => value.equals(d[attribute] as TimeRange))[0] || null;
}

export interface TimeSeriesState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
  dragStartTime?: Date;
  dragTimeRange?: TimeRange;
  roundDragTimeRange?: TimeRange;
  dragOnMeasure?: Measure;
  scrollLeft?: number;
  scrollTop?: number;
  hoverTimeRange?: TimeRange;
  hoverMeasure?: Measure;

  // Cached properer
  axisTimeRange?: TimeRange;
  scaleX?: any;
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
      dragStartTime: null,
      dragTimeRange: null,
      error: null,
      scrollLeft: 0,
      scrollTop: 0,
      hoverTimeRange: null,
      hoverMeasure: null
    };

    this.globalMouseMoveListener = this.globalMouseMoveListener.bind(this);
    this.globalMouseUpListener = this.globalMouseUpListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  fetchData(essence: Essence): void {
    var { registerDownloadableDataset } = this.props;
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
          registerDownloadableDataset(dataset);
          if (!this.mounted) return;

          this.setState({
            loading: false,
            dataset,
            error: null
          });
        },
        (error) => {
          registerDownloadableDataset(null);
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset: null,
            error
          });
        }
      );
  }

  componentWillMount() {
    this.updateCached(this.props);
  }

  componentDidMount() {
    this.mounted = true;
    var { essence } = this.props;
    this.fetchData(essence);

    window.addEventListener('keydown', this.globalKeyDownListener);
    window.addEventListener('mousemove', this.globalMouseMoveListener);
    window.addEventListener('mouseup', this.globalMouseUpListener);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    this.updateCached(nextProps);
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

    window.removeEventListener('keydown', this.globalKeyDownListener);
    window.removeEventListener('mousemove', this.globalMouseMoveListener);
    window.removeEventListener('mouseup', this.globalMouseUpListener);
  }

  onScroll(e: UIEvent) {
    var target = e.target as Element;
    this.setState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop
    });
  }

  getMyEventX(e: MouseEvent): number {
    var myDOM = ReactDOM.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    return getXFromEvent(e) - (rect.left + VIS_H_PADDING);
  }

  onMouseDown(measure: Measure, e: MouseEvent) {
    const { scaleX } = this.state;
    if (!scaleX) return;

    var dragStartTime = scaleX.invert(this.getMyEventX(e));
    this.setState({
      dragStartTime,
      dragTimeRange: null,
      dragOnMeasure: measure
    });
  }

  onMouseMove(dataset: Dataset, measure: Measure, scaleX: any, e: MouseEvent) {
    var { essence } = this.props;
    var { hoverTimeRange, hoverMeasure } = this.state;
    if (!dataset) return;

    var splitLength = essence.splits.length();

    var myDOM = ReactDOM.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    var dragDate = scaleX.invert(getXFromEvent(e) - (rect.left + VIS_H_PADDING));

    var closestDatum: Datum;
    if (splitLength > 1) {
      var flatData = dataset.flatten();
      closestDatum = findClosest(flatData, dragDate, scaleX);
    } else {
      closestDatum = findClosest(dataset.data, dragDate, scaleX);
    }

    var thisHoverTimeRange = closestDatum ? (closestDatum[TIME_SEGMENT] as TimeRange) : null;

    if (!hoverTimeRange || !hoverTimeRange.equals(thisHoverTimeRange) || measure !== hoverMeasure) {
      this.setState({
        hoverTimeRange: thisHoverTimeRange,
        hoverMeasure: measure
      });
    }
  }

  onMouseLeave(measure: Measure, e: MouseEvent) {
    const { hoverMeasure } = this.state;
    if (hoverMeasure === measure) {
      this.setState({
        hoverTimeRange: null,
        hoverMeasure: null
      });
    }
  }

  getDragTimeRange(e: MouseEvent): TimeRange {
    const { dragStartTime, axisTimeRange, scaleX } = this.state;

    var dragEndTime = scaleX.invert(this.getMyEventX(e));

    if (dragStartTime.valueOf() === dragEndTime.valueOf()) {
      dragEndTime = new Date(dragEndTime.valueOf() + 1); // Offset by 1ms to make a meaningful range;
    }

    var timeRangeJS: TimeRangeJS = null;
    if (dragStartTime < dragEndTime) {
      timeRangeJS = { start: dragStartTime, end: dragEndTime };
    } else {
      timeRangeJS = { start: dragEndTime, end: dragStartTime };
    }

    return TimeRange.fromJS(timeRangeJS).intersect(axisTimeRange) as TimeRange;
  }

  roundTimeRange(dragTimeRange: TimeRange): TimeRange {
    const { essence } = this.props;
    const { splits, timezone } = essence;

    var timeSplit = splits.last();
    var timeBucketAction = timeSplit.bucketAction as TimeBucketAction;
    var duration = timeBucketAction.duration;
    return TimeRange.fromJS({
      start: duration.floor(dragTimeRange.start, timezone),
      end: duration.shift(duration.floor(dragTimeRange.end, timezone), timezone, 1)
    });
  }

  globalMouseMoveListener(e: MouseEvent) {
    const { dragStartTime } = this.state;
    if (dragStartTime === null) return;

    var dragTimeRange = this.getDragTimeRange(e);
    this.setState({
      dragTimeRange,
      roundDragTimeRange: this.roundTimeRange(dragTimeRange)
    });
  }

  globalMouseUpListener(e: MouseEvent) {
    const { clicker, essence } = this.props;
    const { dragStartTime, dragTimeRange, dragOnMeasure } = this.state;
    if (dragStartTime === null) return;

    var highlightTimeRange = this.roundTimeRange(this.getDragTimeRange(e));

    this.resetDrag();

    // If already highlighted and user clicks within it switches measure
    if (!dragTimeRange && essence.highlightOn(TimeSeries.id)) {
      var existingHighlightTimeRange = essence.getSingleHighlightSet().elements[0];
      if (existingHighlightTimeRange.contains(highlightTimeRange.start)) {
        var { highlight } = essence;
        if (highlight.measure === dragOnMeasure.name) {
          clicker.dropHighlight();
        } else {
          clicker.changeHighlight(
            TimeSeries.id,
            dragOnMeasure.name,
            highlight.delta
          );
        }
        return;
      }
    }

    var timeDimension = essence.getTimeDimension();
    clicker.changeHighlight(
      TimeSeries.id,
      dragOnMeasure.name,
      Filter.fromClause(new FilterClause({
        expression: timeDimension.expression,
        selection: r(highlightTimeRange)
      }))
    );
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;

    const { dragStartTime } = this.state;
    if (dragStartTime === null) return;

    this.resetDrag();
  }

  resetDrag() {
    this.setState({
      dragStartTime: null,
      dragTimeRange: null,
      roundDragTimeRange: null,
      dragOnMeasure: null
    });
  }

  renderHighlighter(): JSX.Element {
    const { essence } = this.props;
    const { dragTimeRange, scaleX } = this.state;

    if (dragTimeRange !== null) {
      return <Highlighter highlightTimeRange={dragTimeRange} scaleX={scaleX}/>;
    }
    if (essence.highlightOn(TimeSeries.id)) {
      var highlightTimeRange = essence.getSingleHighlightSet().elements[0];
      return <Highlighter highlightTimeRange={highlightTimeRange} scaleX={scaleX}/>;
    }
    return null;
  }

  renderChartBubble(dataset: Dataset, measure: Measure, chartIndex: number, containerStage: Stage, chartStage: Stage, extentY: number[], scaleY: any): JSX.Element {
    const { clicker, essence, openRawDataModal } = this.props;
    const { scrollTop, dragTimeRange, roundDragTimeRange, dragOnMeasure, hoverTimeRange, hoverMeasure, scaleX } = this.state;
    const { colors, timezone } = essence;

    if (essence.highlightOnDiffernetMeasure(TimeSeries.id, measure.name)) return null;

    var topOffset = chartStage.height * chartIndex + scaleY(extentY[1]) + TEXT_SPACER - scrollTop;
    if (topOffset < 0) return null;
    topOffset += containerStage.y;

    if ((dragTimeRange && dragOnMeasure === measure) || (!dragTimeRange && essence.highlightOn(TimeSeries.id, measure.name))) {
      var bubbleTimeRange = dragTimeRange || essence.getSingleHighlightSet().elements[0];

      var shownTimeRange = roundDragTimeRange || bubbleTimeRange;
      if (colors) {
        var leftOffset = containerStage.x + VIS_H_PADDING + scaleX(bubbleTimeRange.end);

        var hoverDatums = dataset.data.map(d => findInDataset(d[SPLIT] as Dataset, TIME_SEGMENT, bubbleTimeRange));
        var colorValues = colors.getColors(dataset.data.map(d => d[SEGMENT]));
        var colorEntries: ColorEntry[] = dataset.data.map((d, i) => {
          var segment = d[SEGMENT];
          var hoverDatum = hoverDatums[i];
          if (!hoverDatum) return null;

          return {
            color: colorValues[i],
            segmentLabel: String(segment),
            measureLabel: measure.formatDatum(hoverDatum)
          };
        }).filter(Boolean);

        return <HoverMultiBubble
          left={leftOffset}
          top={topOffset + HOVER_MULTI_BUBBLE_V_OFFSET}
          segmentLabel={formatTimeRange(bubbleTimeRange, timezone, DisplayYear.NEVER)}
          colorEntries={colorEntries}
          clicker={dragTimeRange ? null : clicker}
        />;
      } else {
        var leftOffset = containerStage.x + VIS_H_PADDING + scaleX(bubbleTimeRange.midpoint());

        var highlightDatum = findInDataset(dataset, TIME_SEGMENT, shownTimeRange);
        return <SegmentBubble
          left={leftOffset}
          top={topOffset + HOVER_BUBBLE_V_OFFSET}
          segmentLabel={formatTimeRange(shownTimeRange, timezone, DisplayYear.NEVER)}
          measureLabel={highlightDatum ? measure.formatDatum(highlightDatum) : null}
          clicker={dragTimeRange ? null : clicker}
          openRawDataModal={openRawDataModal}
        />;
      }

    } else if (!dragTimeRange && hoverTimeRange && hoverMeasure === measure) {
      var leftOffset = containerStage.x + VIS_H_PADDING + scaleX(hoverTimeRange.midpoint());

      if (colors) {
        var hoverDatums = dataset.data.map(d => findInDataset(d[SPLIT] as Dataset, TIME_SEGMENT, hoverTimeRange));
        var colorValues = colors.getColors(dataset.data.map(d => d[SEGMENT]));
        var colorEntries: ColorEntry[] = dataset.data.map((d, i) => {
          var segment = d[SEGMENT];
          var hoverDatum = hoverDatums[i];
          if (!hoverDatum) return null;

          return {
            color: colorValues[i],
            segmentLabel: String(segment),
            measureLabel: measure.formatDatum(hoverDatum)
          };
        }).filter(Boolean);

        return <HoverMultiBubble
          left={leftOffset}
          top={topOffset + HOVER_MULTI_BUBBLE_V_OFFSET}
          segmentLabel={formatTimeRange(hoverTimeRange, timezone, DisplayYear.NEVER)}
          colorEntries={colorEntries}
        />;

      } else {
        var hoverDatum = findInDataset(dataset, TIME_SEGMENT, hoverTimeRange);
        if (!hoverDatum) return null;
        return <SegmentBubble
          left={leftOffset}
          top={topOffset + HOVER_BUBBLE_V_OFFSET}
          segmentLabel={formatTimeRange(hoverTimeRange, timezone, DisplayYear.NEVER)}
          measureLabel={measure.formatDatum(hoverDatum)}
        />;

      }

    }

    return null;
  }

  renderChart(dataset: Dataset, measure: Measure, chartIndex: number, containerStage: Stage, chartStage: Stage, getX: any, xTicks: Date[]): JSX.Element {
    const { essence, clicker } = this.props;
    const { hoverTimeRange, hoverMeasure, dragTimeRange, scaleX } = this.state;
    const { splits, colors } = essence;
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
    var bubble: JSX.Element;
    if (!isNaN(extentY[0]) && !isNaN(extentY[1])) {
      let scaleY = d3.scale.linear()
        .domain([Math.min(extentY[0] * 1.1, 0), Math.max(extentY[1] * 1.1, 0)])
        .range([lineStage.height, 0]);

      let yTicks = scaleY.ticks(5).filter((n: number) => n !== 0);

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
          hoverTimeRange={(!dragTimeRange && hoverMeasure === measure) ? hoverTimeRange : null}
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
            hoverTimeRange={(!dragTimeRange && hoverMeasure === measure) ? hoverTimeRange : null}
            color={colorValues ? colorValues[i] : null}
          />;
        });
      }

      bubble = this.renderChartBubble(mySplitDataset, measure, chartIndex, containerStage, chartStage, extentY, scaleY);
    }

    return <div
      className="measure-time-chart"
      key={measureName}
      onMouseDown={this.onMouseDown.bind(this, measure)}
      onMouseMove={this.onMouseMove.bind(this, mySplitDataset, measure, scaleX)}
      onMouseLeave={this.onMouseLeave.bind(this, measure)}
    >
      <svg style={chartStage.getWidthHeight()} viewBox={chartStage.getViewBox()}>
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
      {this.renderHighlighter()}
      {bubble}
    </div>;

  }

  updateCached(props: VisualizationProps) {
    const { essence, stage } = props;
    var axisTimeRange = essence.getEffectiveFilter(TimeSeries.id).getTimeRange(essence.dataSource.timeAttribute);

    var scaleX: any = null;

    if (axisTimeRange) {
      scaleX = d3.time.scale()
        .domain([axisTimeRange.start, axisTimeRange.end])
        .range([0, stage.width - VIS_H_PADDING * 2 - Y_AXIS_WIDTH]);
    }

    this.setState({
      axisTimeRange,
      scaleX
    });
  }

  render() {
    var { essence, stage } = this.props;
    var { loading, dataset, error, axisTimeRange, scaleX } = this.state;
    var { splits, timezone } = essence;

    var measureCharts: JSX.Element[];
    var bottomAxis: JSX.Element;

    if (dataset && splits.length() && axisTimeRange) {
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

      var xTicks = scaleX.ticks();

      measureCharts = measures.map((measure, chartIndex) => {
        return this.renderChart(dataset, measure, chartIndex, stage, chartStage, getX, xTicks);
      });

      var xAxisStage = Stage.fromSize(chartStage.width, X_AXIS_HEIGHT);
      bottomAxis = <svg
        className="bottom-axis"
        width={xAxisStage.width}
        height={xAxisStage.height}
      >
        <TimeAxis stage={xAxisStage} ticks={xTicks} scale={scaleX} timezone={timezone}/>
      </svg>;
    }

    var measureChartsStyle = {
      maxHeight: stage.height - X_AXIS_HEIGHT
    };

    return <div className="time-series">
      <div className="measure-time-charts" style={measureChartsStyle} onScroll={this.onScroll.bind(this)}>
        {measureCharts}
      </div>
      {bottomAxis}
      {error ? <QueryError error={error}/> : null}
      {loading ? <Loader/> : null}
    </div>;
  }
}
