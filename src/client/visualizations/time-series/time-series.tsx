require('./time-series.css');

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { r, $, ply, Executor, Expression, Dataset, Datum, TimeRange, TimeRangeJS, TimeBucketAction, SortAction } from 'plywood';
import { Splits, Colors, FilterClause, Dimension, Stage, Filter, Measure, DataSource, VisualizationProps, DatasetLoad, Resolve } from '../../../common/models/index';
import { getTimeTicks, formatTimeRange, DisplayYear } from '../../../common/utils/time/time';
import { SPLIT, VIS_H_PADDING } from '../../config/constants';
import { getXFromEvent, escapeKey } from '../../utils/dom/dom';
import { VisMeasureLabel } from '../../components/vis-measure-label/vis-measure-label';
import { ChartLine } from '../../components/chart-line/chart-line';
import { TimeAxis } from '../../components/time-axis/time-axis';
import { VerticalAxis } from '../../components/vertical-axis/vertical-axis';
import { GridLines } from '../../components/grid-lines/grid-lines';
import { Highlighter } from '../../components/highlighter/highlighter';
import { SegmentBubble } from '../../components/segment-bubble/segment-bubble';
import { HoverMultiBubble, ColorEntry } from '../../components/hover-multi-bubble/hover-multi-bubble';

import handler from './circumstances';

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

function findClosest(data: Datum[], dragDate: Date, scaleX: (t: Date) => number, timeDimension: Dimension) {
  var closestDatum: Datum = null;
  var minDist = Infinity;
  for (var datum of data) {
    var timeSegmentValue = datum[timeDimension.name] as TimeRange;
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

export interface TimeSeriesState extends BaseVisualizationState {
  dragStartTime?: Date;
  dragTimeRange?: TimeRange;
  roundDragTimeRange?: TimeRange;
  hoverTimeRange?: TimeRange;

  // Cached props
  axisTimeRange?: TimeRange;
  scaleX?: any;
  xTicks?: Date[];
}

export class TimeSeries extends BaseVisualization<TimeSeriesState> {
  public static id = 'time-series';
  public static title = 'Time Series';

  public static handleCircumstance = handler.evaluate.bind(handler);

  constructor() {
    super();
  }

  getDefaultState(): TimeSeriesState {
    var s = super.getDefaultState() as TimeSeriesState;

    s.dragStartTime = null;
    s.dragTimeRange = null;
    s.hoverTimeRange = null;

    return s;
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
    var timeDimension = essence.getTimeDimension();

    var myDOM = ReactDOM.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    var dragDate = scaleX.invert(getXFromEvent(e) - (rect.left + VIS_H_PADDING));

    var closestDatum: Datum;
    if (splitLength > 1) {
      var flatData = dataset.flatten();
      closestDatum = findClosest(flatData, dragDate, scaleX, timeDimension);
    } else {
      closestDatum = findClosest(dataset.data, dragDate, scaleX, timeDimension);
    }

    var thisHoverTimeRange = closestDatum ? (closestDatum[timeDimension.name] as TimeRange) : null;

    if (!hoverTimeRange || !hoverTimeRange.equals(thisHoverTimeRange) || measure !== hoverMeasure) {
      this.setState({
        hoverTimeRange: thisHoverTimeRange,
        hoverMeasure: measure
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

  onMouseLeave(measure: Measure, e: MouseEvent) {
    const { hoverMeasure } = this.state;
    if (hoverMeasure === measure) {
      this.setState({
        hoverTimeRange: null,
        hoverMeasure: null
      });
    }
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
    const timeDimension = essence.getTimeDimension();

    if (essence.highlightOnDifferentMeasure(TimeSeries.id, measure.name)) return null;

    var topOffset = chartStage.height * chartIndex + scaleY(extentY[1]) + TEXT_SPACER - scrollTop;
    if (topOffset < 0) return null;
    topOffset += containerStage.y;

    if ((dragTimeRange && dragOnMeasure === measure) || (!dragTimeRange && essence.highlightOn(TimeSeries.id, measure.name))) {
      var bubbleTimeRange = dragTimeRange || essence.getSingleHighlightSet().elements[0];

      var shownTimeRange = roundDragTimeRange || bubbleTimeRange;
      if (colors) {
        var categoryDimension = essence.splits.get(0).getDimension(essence.dataSource.dimensions);
        var leftOffset = containerStage.x + VIS_H_PADDING + scaleX(bubbleTimeRange.end);

        var hoverDatums = dataset.data.map(d => (d[SPLIT] as Dataset).findDatumByAttribute(timeDimension.name, bubbleTimeRange));
        var colorValues = colors.getColors(dataset.data.map(d => d[categoryDimension.name]));
        var colorEntries: ColorEntry[] = dataset.data.map((d, i) => {
          var segment = d[categoryDimension.name];
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

        var highlightDatum = dataset.findDatumByAttribute(timeDimension.name, shownTimeRange);
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
        var categoryDimension = essence.splits.get(0).getDimension(essence.dataSource.dimensions);
        var hoverDatums = dataset.data.map(d => (d[SPLIT] as Dataset).findDatumByAttribute(timeDimension.name, hoverTimeRange));
        var colorValues = colors.getColors(dataset.data.map(d => d[categoryDimension.name]));
        var colorEntries: ColorEntry[] = dataset.data.map((d, i) => {
          var segment = d[categoryDimension.name];
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
        var hoverDatum = dataset.findDatumByAttribute(timeDimension.name, hoverTimeRange);
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

  renderChart(dataset: Dataset, measure: Measure, chartIndex: number, containerStage: Stage, chartStage: Stage): JSX.Element {
    const { essence, clicker } = this.props;
    const { hoverTimeRange, hoverMeasure, dragTimeRange, scaleX, xTicks } = this.state;
    const { splits, colors } = essence;
    var splitLength = splits.length();

    var lineStage = chartStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH, bottom: 1 }); // leave 1 for border
    var yAxisStage = chartStage.within({ top: TEXT_SPACER, left: lineStage.width, bottom: 1 });

    var measureName = measure.name;
    var getY = (d: Datum) => d[measureName] as number;

    const timeDimension = essence.getTimeDimension();
    var getX = (d: Datum) => d[timeDimension.name] as TimeRange;

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
          getX={getX}
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
        var categoryDimension = essence.splits.get(0).getDimension(essence.dataSource.dimensions);

        if (colors) colorValues = colors.getColors(mySplitDataset.data.map(d => d[categoryDimension.name]));

        chartLines = mySplitDataset.data.map((datum, i) => {
          var subDataset = datum[SPLIT] as Dataset;
          if (!subDataset) return null;
          return <ChartLine
            key={'single' + i}
            dataset={subDataset}
            getX={getX}
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

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence, stage } = props;
    const { splits, timezone } = essence;

    var existingDatasetLoad = this.state.datasetLoad;
    var newState: TimeSeriesState = {};
    if (datasetLoad) {
      // Always keep the old dataset while loading (for now)
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      datasetLoad = this.state.datasetLoad;
    }

    var { dataset } = datasetLoad;

    if (dataset && splits.length()) {
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);
    }

    var axisTimeRange = essence.getEffectiveFilter(TimeSeries.id).getTimeRange(essence.dataSource.timeAttribute);
    if (axisTimeRange) {
      newState.axisTimeRange = axisTimeRange;
      newState.scaleX = d3.time.scale()
        .domain([axisTimeRange.start, axisTimeRange.end])
        .range([0, stage.width - VIS_H_PADDING * 2 - Y_AXIS_WIDTH]);

      newState.xTicks = getTimeTicks(axisTimeRange, timezone);
    }

    this.setState(newState);
  }

  renderInternals() {
    var { essence, stage } = this.props;
    var { datasetLoad, axisTimeRange, scaleX, xTicks } = this.state;
    var { splits, timezone } = essence;
    const timeDimension = essence.getTimeDimension();

    var measureCharts: JSX.Element[];
    var bottomAxis: JSX.Element;

    if (datasetLoad.dataset && splits.length() && axisTimeRange) {
      var measures = essence.getEffectiveMeasures().toArray();

      var getX = (d: Datum) => midpoint(d[timeDimension.name] as TimeRange);

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

      measureCharts = measures.map((measure, chartIndex) => {
        return this.renderChart(datasetLoad.dataset, measure, chartIndex, stage, chartStage);
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

    return <div className="internals time-series-inner">
      <div className="measure-time-charts" style={measureChartsStyle} onScroll={this.onScroll.bind(this)}>
        {measureCharts}
      </div>
      {bottomAxis}
    </div>;
  }
}
