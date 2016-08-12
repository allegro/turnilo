/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('./line-chart.css');

import { immutableEqual } from 'immutable-class';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { Duration } from 'chronoshift';
import { r, $, ply, Expression, Dataset, Datum, TimeRange, TimeRangeJS, TimeBucketAction, SortAction,
  PlywoodRange, NumberRangeJS, NumberRange, Range, NumberBucketAction } from 'plywood';
import { Essence, Splits, Colors, FilterClause, Dimension, Stage,
  Filter, Measure, DataCube, VisualizationProps, DatasetLoad } from '../../../common/models/index';
import { LINE_CHART_MANIFEST } from '../../../common/manifests/line-chart/line-chart';
import { DisplayYear } from '../../../common/utils/time/time';
import { formatValue } from '../../../common/utils/formatter/formatter';

import { getLineChartTicks } from '../../../common/models/granularity/granularity';

import { SPLIT, VIS_H_PADDING } from '../../config/constants';
import { getXFromEvent, escapeKey } from '../../utils/dom/dom';

import { VisMeasureLabel, ChartLine, LineChartAxis, VerticalAxis, GridLines, Highlighter,
  SegmentBubble, HoverMultiBubble, ColorEntry, GlobalEventListener } from '../../components/index';

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';

const TEXT_SPACER = 36;
const X_AXIS_HEIGHT = 30;
const Y_AXIS_WIDTH = 60;
const MIN_CHART_HEIGHT = 140;
const HOVER_BUBBLE_V_OFFSET = -7;
const HOVER_MULTI_BUBBLE_V_OFFSET = -8;
const MAX_HOVER_DIST = 50;
const MAX_ASPECT_RATIO = 1; // width / height

function findClosest(data: Datum[], dragDate: Date, scaleX: (v: continuousValueType) => number, continuousDimension: Dimension) {
  var closestDatum: Datum = null;
  var minDist = Infinity;
  for (var datum of data) {
    var continuousSegmentValue = datum[continuousDimension.name] as (TimeRange | NumberRange);
    if (!continuousSegmentValue || !Range.isRange(continuousSegmentValue)) continue; // !Range.isRange => temp solution for non-bucketed reaching here
    var mid = continuousSegmentValue.midpoint();
    var dist = Math.abs(mid.valueOf() - dragDate.valueOf());
    var distPx = Math.abs(scaleX(mid) - scaleX(dragDate));
    if ((!closestDatum || dist < minDist) && distPx < MAX_HOVER_DIST) { // Make sure it is not too far way
      closestDatum = datum;
      minDist = dist;
    }
  }
  return closestDatum;
}

function roundTo(v: number, roundTo: number) {
  return Math.round(Math.floor(v / roundTo)) * roundTo;
}

export type continuousValueType = Date | number;

export interface LineChartState extends BaseVisualizationState {
  dragStartValue?: continuousValueType;
  dragRange?: PlywoodRange;
  roundDragRange?: PlywoodRange;
  hoverRange?: PlywoodRange;
  containerYPosition?: number;
  containerXPosition?: number;

  // Cached props
  continuousDimension?: Dimension;
  axisRange?: PlywoodRange;
  scaleX?: any;
  xTicks?: continuousValueType[];
}

export class LineChart extends BaseVisualization<LineChartState> {
  public static id = LINE_CHART_MANIFEST.name;

  constructor() {
    super();
  }

  getDefaultState(): LineChartState {
    var s = super.getDefaultState() as LineChartState;

    s.dragStartValue = null;
    s.dragRange = null;
    s.hoverRange = null;

    return s;
  }

  componentDidUpdate() {
    const { containerYPosition, containerXPosition } = this.state;

    var node = ReactDOM.findDOMNode(this.refs['container']);
    if (!node) return;

    var rect = node.getBoundingClientRect();

    if (containerYPosition !== rect.top || containerXPosition !== rect.left) {
      this.setState({
        containerYPosition: rect.top,
        containerXPosition: rect.left
      });
    }
  }

  getMyEventX(e: MouseEvent): number {
    var myDOM = ReactDOM.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    return getXFromEvent(e) - (rect.left + VIS_H_PADDING);
  }

  onMouseDown(measure: Measure, e: MouseEvent) {
    const { clicker } = this.props;
    const { scaleX } = this.state;
    if (!scaleX || !clicker.dropHighlight || !clicker.changeHighlight) return;

    var dragStartValue = scaleX.invert(this.getMyEventX(e));
    this.setState({
      dragStartValue,
      dragRange: null,
      dragOnMeasure: measure
    });
  }

  onMouseMove(dataset: Dataset, measure: Measure, scaleX: any, e: MouseEvent) {
    var { essence } = this.props;
    var { continuousDimension, hoverRange, hoverMeasure } = this.state;
    if (!dataset) return;

    var splitLength = essence.splits.length();

    var myDOM = ReactDOM.findDOMNode(this);
    var rect = myDOM.getBoundingClientRect();
    var dragDate = scaleX.invert(getXFromEvent(e) - (rect.left + VIS_H_PADDING));

    var closestDatum: Datum;
    if (splitLength > 1) {
      var flatData = dataset.flatten();
      closestDatum = findClosest(flatData, dragDate, scaleX, continuousDimension);
    } else {
      closestDatum = findClosest(dataset.data, dragDate, scaleX, continuousDimension);
    }

    var currentHoverRange: any = closestDatum ? (closestDatum[continuousDimension.name]) : null;

    if (!hoverRange || !immutableEqual(hoverRange, currentHoverRange) || measure !== hoverMeasure) {
      this.setState({
        hoverRange: currentHoverRange,
        hoverMeasure: measure
      });
    }
  }

  getDragRange(e: MouseEvent): PlywoodRange {
    const { dragStartValue, axisRange, scaleX } = this.state;

    var dragEndValue = scaleX.invert(this.getMyEventX(e));
    var rangeJS: TimeRangeJS | NumberRangeJS = null;

    if (dragStartValue.valueOf() === dragEndValue.valueOf()) {
      dragEndValue = TimeRange.isTimeRange(axisRange) ? new Date(dragEndValue.valueOf() + 1) : dragEndValue + 1;
    }

    if (dragStartValue < dragEndValue) {
      rangeJS = { start: dragStartValue, end: dragEndValue };
    } else {
      rangeJS = { start: dragEndValue, end: dragStartValue };
    }

    return Range.fromJS(rangeJS).intersect(axisRange);

  }

  floorRange(dragRange: PlywoodRange): PlywoodRange {
    const { essence } = this.props;
    const { splits, timezone } = essence;
    var continuousSplit = splits.last();
    if (!continuousSplit.bucketAction) return dragRange; // temp solution for non-bucketed reaching here

    if (TimeRange.isTimeRange(dragRange)) {
      var timeBucketAction = continuousSplit.bucketAction as TimeBucketAction;
      var duration = timeBucketAction.duration;
      return TimeRange.fromJS({
        start: duration.floor(dragRange.start, timezone),
        end: duration.shift(duration.floor(dragRange.end, timezone), timezone, 1)
      });
    } else {
      var numberBucketAction = continuousSplit.bucketAction as NumberBucketAction;
      var bucketSize = numberBucketAction.size;
      var startFloored = roundTo((dragRange as NumberRange).start, bucketSize);
      var endFloored = roundTo((dragRange as NumberRange).end, bucketSize);

      if (endFloored - startFloored < bucketSize) {
        endFloored += bucketSize;
      }

      return NumberRange.fromJS({
        start: startFloored,
        end: endFloored
      });
    }
  }

  globalMouseMoveListener(e: MouseEvent) {
    const { dragStartValue } = this.state;
    if (dragStartValue === null) return;

    var dragRange = this.getDragRange(e);
    this.setState({
      dragRange,
      roundDragRange: this.floorRange(dragRange)
    });
  }

  globalMouseUpListener(e: MouseEvent) {
    const { clicker, essence } = this.props;
    const { continuousDimension, dragStartValue, dragRange, dragOnMeasure } = this.state;
    if (dragStartValue === null) return;

    var highlightRange = this.floorRange(this.getDragRange(e));
    this.resetDrag();

    // If already highlighted and user clicks within it switches measure
    if (!dragRange && essence.highlightOn(LineChart.id)) {
      var existingHighlightRange = essence.getSingleHighlightSet().elements[0];
      if (existingHighlightRange.contains(highlightRange.start)) {
        var { highlight } = essence;
        if (highlight.measure === dragOnMeasure.name) {
          clicker.dropHighlight();
        } else {
          clicker.changeHighlight(
            LineChart.id,
            dragOnMeasure.name,
            highlight.delta
          );
        }
        return;
      }
    }

    clicker.changeHighlight(
      LineChart.id,
      dragOnMeasure.name,
      Filter.fromClause(new FilterClause({
        expression: continuousDimension.expression,
        selection: r(highlightRange)
      }))
    );
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;

    const { dragStartValue } = this.state;
    if (dragStartValue === null) return;

    this.resetDrag();
  }

  resetDrag() {
    this.setState({
      dragStartValue: null,
      dragRange: null,
      roundDragRange: null,
      dragOnMeasure: null
    });
  }

  onMouseLeave(measure: Measure, e: MouseEvent) {
    const { hoverMeasure } = this.state;
    if (hoverMeasure === measure) {
      this.setState({
        hoverRange: null,
        hoverMeasure: null
      });
    }
  }

  renderHighlighter(): JSX.Element {
    const { essence } = this.props;
    const { dragRange, scaleX } = this.state;

    if (dragRange !== null) {
      return <Highlighter highlightRange={dragRange} scaleX={scaleX}/>;
    }
    if (essence.highlightOn(LineChart.id)) {
      var highlightRange = essence.getSingleHighlightSet().elements[0];
      return <Highlighter highlightRange={highlightRange} scaleX={scaleX}/>;
    }
    return null;
  }

  renderChartBubble(
    dataset: Dataset,
    measure: Measure,
    chartIndex: number,
    containerStage: Stage,
    chartStage: Stage,
    extentY: number[],
    scaleY: any
  ): JSX.Element {
    const { clicker, essence, openRawDataModal } = this.props;
    const { colors, timezone } = essence;

    const { containerYPosition, containerXPosition, scrollTop, dragRange, roundDragRange }  = this.state;
    const { dragOnMeasure, hoverRange, hoverMeasure, scaleX, continuousDimension } = this.state;


    if (essence.highlightOnDifferentMeasure(LineChart.id, measure.name)) return null;

    var topOffset = chartStage.height * chartIndex + scaleY(extentY[1]) + TEXT_SPACER - scrollTop;
    if (topOffset < 0) return null;

    topOffset += containerYPosition;

    if ((dragRange && dragOnMeasure === measure) || (!dragRange && essence.highlightOn(LineChart.id, measure.name))) {
      var bubbleRange = dragRange || essence.getSingleHighlightSet().elements[0];

      var shownRange = roundDragRange || bubbleRange;
      var segmentLabel = formatValue(bubbleRange, timezone, DisplayYear.NEVER);

      if (colors) {
        var categoryDimension = essence.splits.get(0).getDimension(essence.dataCube.dimensions);
        var leftOffset = containerXPosition + VIS_H_PADDING + scaleX(bubbleRange.end);

        var hoverDatums = dataset.data.map(d => (d[SPLIT] as Dataset).findDatumByAttribute(continuousDimension.name, bubbleRange));
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
          segmentLabel={segmentLabel}
          colorEntries={colorEntries}
          clicker={dragRange ? null : clicker}
        />;
      } else {
        var leftOffset = containerXPosition + VIS_H_PADDING + scaleX(bubbleRange.midpoint());
        var highlightDatum = dataset.findDatumByAttribute(continuousDimension.name, shownRange);
        var segmentLabel = formatValue(shownRange, timezone, DisplayYear.NEVER);

        return <SegmentBubble
          left={leftOffset}
          top={topOffset + HOVER_BUBBLE_V_OFFSET}
          segmentLabel={segmentLabel}
          measureLabel={highlightDatum ? measure.formatDatum(highlightDatum) : null}
          clicker={dragRange ? null : clicker}
          openRawDataModal={openRawDataModal}
        />;
      }

    } else if (!dragRange && hoverRange && hoverMeasure === measure) {
      var leftOffset = containerXPosition + VIS_H_PADDING + scaleX((hoverRange as NumberRange | TimeRange).midpoint());
      var segmentLabel = formatValue(hoverRange, timezone, DisplayYear.NEVER);

      if (colors) {
        var categoryDimension = essence.splits.get(0).getDimension(essence.dataCube.dimensions);
        var hoverDatums = dataset.data.map(d => (d[SPLIT] as Dataset).findDatumByAttribute(continuousDimension.name, hoverRange));
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
          segmentLabel={segmentLabel}
          colorEntries={colorEntries}
        />;

      } else {
        var hoverDatum = dataset.findDatumByAttribute(continuousDimension.name, hoverRange);
        if (!hoverDatum) return null;
        var segmentLabel = formatValue(hoverRange, timezone, DisplayYear.NEVER);

        return <SegmentBubble
          left={leftOffset}
          top={topOffset + HOVER_BUBBLE_V_OFFSET}
          segmentLabel={segmentLabel}
          measureLabel={measure.formatDatum(hoverDatum)}
        />;

      }

    }

    return null;
  }

  renderChart(dataset: Dataset, measure: Measure, chartIndex: number, containerStage: Stage, chartStage: Stage): JSX.Element {
    const { essence, isThumbnail } = this.props;

    const { hoverRange, hoverMeasure, dragRange, scaleX, xTicks, continuousDimension } = this.state;
    const { splits, colors } = essence;
    var splitLength = splits.length();

    var lineStage = chartStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH, bottom: 1 }); // leave 1 for border
    var yAxisStage = chartStage.within({ top: TEXT_SPACER, left: lineStage.width, bottom: 1 });

    var measureName = measure.name;
    var getX = (d: Datum) => d[continuousDimension.name] as (TimeRange | NumberRange);
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
          getX={getX}
          getY={getY}
          scaleX={scaleX}
          scaleY={scaleY}
          stage={lineStage}
          showArea={true}
          hoverRange={(!dragRange && hoverMeasure === measure) ? hoverRange : null}
          color="default"
        />);
      } else {
        var colorValues: string[] = null;
        var categoryDimension = essence.splits.get(0).getDimension(essence.dataCube.dimensions);

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
            hoverRange={(!dragRange && hoverMeasure === measure) ? hoverRange : null}
            color={colorValues ? colorValues[i] : null}
          />;
        });
      }

      bubble = this.renderChartBubble(mySplitDataset, measure, chartIndex, containerStage, chartStage, extentY, scaleY);
    }

    return <div
      className="measure-line-chart"
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
      { !isThumbnail ? <VisMeasureLabel measure={measure} datum={myDatum}/> : null }
      {this.renderHighlighter()}
      {bubble}
    </div>;

  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence, stage } = props;
    const { splits, timezone, dataCube } = essence;

    var existingDatasetLoad = this.state.datasetLoad;
    var newState: LineChartState = {};
    if (datasetLoad) {
      // Always keep the old dataset while loading (for now)
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      datasetLoad = this.state.datasetLoad;
    }

    if (splits.length()) {
      var { dataset } = datasetLoad;
      if (dataset) {
        if (registerDownloadableDataset) registerDownloadableDataset(dataset);
      }

      var continuousSplit = splits.length() === 1 ? splits.get(0) : splits.get(1);
      var continuousDimension = continuousSplit.getDimension(essence.dataCube.dimensions);
      if (continuousDimension) {
        newState.continuousDimension = continuousDimension;

        var axisRange = essence.getEffectiveFilter(LineChart.id).getExtent(continuousDimension.expression) as PlywoodRange;
        if (axisRange) {
          // Special treatment for realtime data, i.e. time data where the maxTime is within Duration of the filter end
          var maxTime = dataCube.getMaxTimeDate();
          var continuousBucketAction = continuousSplit.bucketAction;
          if (maxTime && continuousBucketAction instanceof TimeBucketAction) {
            var continuousDuration = continuousBucketAction.duration;
            var axisRangeEnd = axisRange.end as Date;
            var axisRangeEndFloor = continuousDuration.floor(axisRangeEnd, timezone);
            var axisRangeEndCeil = continuousDuration.shift(axisRangeEndFloor, timezone);
            if (maxTime && axisRangeEndFloor < maxTime && maxTime < axisRangeEndCeil) {
              axisRange = Range.fromJS({ start: axisRange.start, end: axisRangeEndCeil });
            }
          }
        } else {
          // If there is no axis range: compute it from the data
          axisRange = this.getXAxisRange(essence, continuousDimension, dataset);
        }

        if (axisRange) {
          newState.axisRange = axisRange;
          let domain = [(axisRange).start, (axisRange).end];
          let range = [0, stage.width - VIS_H_PADDING * 2 - Y_AXIS_WIDTH];
          let scaleFn: any = null;
          if (continuousDimension.kind === 'time') {
            scaleFn = d3.time.scale();
          } else {
            scaleFn = d3.scale.linear();
          }

          newState.scaleX = scaleFn.domain(domain).range(range);
          newState.xTicks = getLineChartTicks(axisRange, timezone);
        }
      }
    }

    this.setState(newState);
  }

  getXAxisRange(essence: Essence, continuousDimension: Dimension, dataset: Dataset): PlywoodRange {
    if (!dataset) return null;
    const key = continuousDimension.name;

    var firstDatum = dataset.data[0];
    return (firstDatum['SPLIT'] as Dataset).data
      .map(d => d['SPLIT'] ? this.getXAxisRange(essence, continuousDimension, d['SPLIT'] as Dataset) : (d as any)[key] as PlywoodRange)
      .reduce((a: PlywoodRange, b: PlywoodRange) => a ? a.union(b) : b);
  }

  hideBubble() {
    const { hoverRange, hoverMeasure } = this.state;

    if (!hoverRange || !hoverMeasure) return;

    this.setState({
      hoverRange: null,
      hoverMeasure: null
    });
  }

  renderInternals() {
    var { essence, stage } = this.props;
    var { datasetLoad, axisRange, scaleX, xTicks } = this.state;
    var { splits, timezone } = essence;

    var measureCharts: JSX.Element[];
    var bottomAxis: JSX.Element;

    if (datasetLoad.dataset && splits.length() && axisRange) {
      var measures = essence.getEffectiveMeasures().toArray();

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
        <LineChartAxis stage={xAxisStage} ticks={xTicks} scale={scaleX} timezone={timezone}/>
      </svg>;
    }

    var measureChartsStyle = {
      maxHeight: stage.height - X_AXIS_HEIGHT
    };

    return <div className="internals line-chart-inner">
      <GlobalEventListener
        scroll={this.hideBubble.bind(this)}
      />
      <div
        className="measure-line-charts"
        style={measureChartsStyle}
        ref="container"
      >
        {measureCharts}
      </div>
      {bottomAxis}
    </div>;
  }
}
