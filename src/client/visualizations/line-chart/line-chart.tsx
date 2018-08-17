/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import { Timezone } from "chronoshift";
import * as d3 from "d3";
import { immutableEqual } from "immutable-class";
import { Dataset, Datum, NumberBucketExpression, NumberRange, NumberRangeJS, PlywoodRange, r, Range, TimeBucketExpression, TimeRange, TimeRangeJS } from "plywood";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { LINE_CHART_MANIFEST } from "../../../common/manifests/line-chart/line-chart";
import { getLineChartTicks } from "../../../common/models/granularity/granularity";
import { DatasetLoad, Dimension, Essence, Filter, FilterClause, Measure, MeasureDerivation, SplitCombine, Splits, Stage, Timekeeper, VisualizationProps } from "../../../common/models/index";
import { JSXNode } from "../../../common/utils";
import { formatValue } from "../../../common/utils/formatter/formatter";
import { concatTruthy, flatMap, mapTruthy, Unary } from "../../../common/utils/functional/functional";
import { union } from "../../../common/utils/plywood/range";
import { DisplayYear } from "../../../common/utils/time/time";
import {
  ChartLine,
  ColorEntry,
  Delta,
  GlobalEventListener,
  GridLines,
  Highlighter,
  HoverMultiBubble,
  LineChartAxis,
  MeasureBubbleContent,
  SegmentActionButtons,
  SegmentBubble,
  VerticalAxis,
  VisMeasureLabel
} from "../../components/index";
import { SPLIT, VIS_H_PADDING } from "../../config/constants";
import { escapeKey, getXFromEvent } from "../../utils/dom/dom";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./line-chart.scss";
import Linear = d3.scale.Linear;

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

function splitRangeExtractor(dimensionName: string, range: PlywoodRange): (d: Datum) => Datum {
  return (d: Datum): Datum => {
    const dataset = d[SPLIT] as Dataset;
    return dataset != null ? dataset.findDatumByAttribute(dimensionName, range) : null;
  };
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

  getDefaultState(): LineChartState {
    var s = super.getDefaultState() as LineChartState;

    s.dragStartValue = null;
    s.dragRange = null;
    s.hoverRange = null;

    return s;
  }

  componentDidUpdate() {
    const { containerYPosition, containerXPosition } = this.state;

    var node = ReactDOM.findDOMNode(this.refs["container"]);
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
      var flattened = dataset.flatten();
      closestDatum = findClosest(flattened.data, dragDate, scaleX, continuousDimension);
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
      var timeBucketAction = continuousSplit.bucketAction as TimeBucketExpression;
      var duration = timeBucketAction.duration;
      return TimeRange.fromJS({
        start: duration.floor(dragRange.start, timezone),
        end: duration.shift(duration.floor(dragRange.end, timezone), timezone, 1)
      });
    } else {
      var numberBucketAction = continuousSplit.bucketAction as NumberBucketExpression;
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

    const { containerYPosition, containerXPosition, scrollTop, dragRange, roundDragRange } = this.state;
    const { dragOnMeasure, scaleX, hoverRange, hoverMeasure, continuousDimension } = this.state;

    if (essence.highlightOnDifferentMeasure(LineChart.id, measure.name)) return null;

    let topOffset = chartStage.height * chartIndex + scaleY(extentY[1]) + TEXT_SPACER - scrollTop;
    if (topOffset < 0) return null;

    topOffset += containerYPosition;

    if ((dragRange && dragOnMeasure === measure) || (!dragRange && essence.highlightOn(LineChart.id, measure.name))) {
      const bubbleRange = dragRange || essence.getSingleHighlightSet().elements[0];

      const shownRange = roundDragRange || bubbleRange;

      if (colors) {
        const segmentLabel = formatValue(bubbleRange, timezone, DisplayYear.NEVER);
        const categoryDimension = essence.splits.get(0).getDimension(essence.dataCube.dimensions);
        const leftOffset = containerXPosition + VIS_H_PADDING + scaleX(bubbleRange.end);

        const hoverDatums = dataset.data.map(splitRangeExtractor(continuousDimension.name, bubbleRange));
        const colorValues = colors.getColors(dataset.data.map(d => d[categoryDimension.name]));
        const colorEntries: ColorEntry[] = mapTruthy(dataset.data, (d, i) => {
          const segment = d[categoryDimension.name];
          const hoverDatum = hoverDatums[i];
          if (!hoverDatum) return null;

          return {
            color: colorValues[i],
            name: String(segment),
            value: measure.formatDatum(hoverDatum),
            delta: essence.hasComparison() && <Delta
              currentValue={hoverDatum[measure.name] as number}
              previousValue={hoverDatum[measure.getDerivedName(MeasureDerivation.PREVIOUS)] as number}
              formatter={measure.formatFn}
            />
          };
        });

        return <HoverMultiBubble
          left={leftOffset}
          top={topOffset + HOVER_MULTI_BUBBLE_V_OFFSET}
          title={segmentLabel}
          colorEntries={colorEntries}
          clicker={dragRange ? null : clicker}
        />;
      } else {
        const leftOffset = containerXPosition + VIS_H_PADDING + scaleX(bubbleRange.midpoint());
        const segmentLabel = formatValue(shownRange, timezone, DisplayYear.NEVER);
        const highlightDatum = dataset.findDatumByAttribute(continuousDimension.name, shownRange);
        const measureLabel = highlightDatum ? measure.formatDatum(highlightDatum) : null;

        return <SegmentBubble
          left={leftOffset}
          top={topOffset + HOVER_BUBBLE_V_OFFSET}
          title={segmentLabel}
          content={measureLabel}
          actions={<SegmentActionButtons
            clicker={dragRange ? null : clicker}
            openRawDataModal={openRawDataModal}
          />}
        />;
      }

    } else if (!dragRange && hoverRange && hoverMeasure === measure) {
      const leftOffset = containerXPosition + VIS_H_PADDING + scaleX((hoverRange as NumberRange | TimeRange).midpoint());
      const segmentLabel = formatValue(hoverRange, timezone, DisplayYear.NEVER);

      if (colors) {
        const categoryDimension = essence.splits.get(0).getDimension(essence.dataCube.dimensions);
        const hoverDatums = dataset.data.map(splitRangeExtractor(continuousDimension.name, hoverRange));
        const colorValues = colors.getColors(dataset.data.map(d => d[categoryDimension.name]));
        const hasComparison = essence.hasComparison();
        const colorEntries: ColorEntry[] = mapTruthy(dataset.data, (d, i) => {
          const segment = d[categoryDimension.name];
          const hoverDatum = hoverDatums[i];
          if (!hoverDatum) return null;

          const currentEntry: ColorEntry = {
            color: colorValues[i],
            name: String(segment),
            value: measure.formatDatum(hoverDatum)
          };

          if (!hasComparison) {
            return currentEntry;
          }

          const hoverDatumElement = hoverDatum[measure.getDerivedName(MeasureDerivation.PREVIOUS)] as number;
          return {
            ...currentEntry,
            previous: measure.formatFn(hoverDatumElement),
            delta: essence.hasComparison() && <Delta
              currentValue={hoverDatum[measure.name] as number}
              previousValue={hoverDatumElement}
              formatter={measure.formatFn}
            />
          };
        });

        return <HoverMultiBubble
          left={leftOffset}
          top={topOffset + HOVER_MULTI_BUBBLE_V_OFFSET}
          title={segmentLabel}
          colorEntries={colorEntries}
        />;

      } else {
        const hoverDatum = dataset.findDatumByAttribute(continuousDimension.name, hoverRange);
        if (!hoverDatum) return null;
        const title = formatValue(hoverRange, timezone, DisplayYear.NEVER);
        const content = this.renderMeasureLabel(measure, hoverDatum);

        return <SegmentBubble
          left={leftOffset}
          top={topOffset + HOVER_BUBBLE_V_OFFSET}
          title={title}
          content={content}
        />;
      }

    }

    return null;
  }

  private renderMeasureLabel(measure: Measure, datum: Datum): JSXNode {
    const currentValue = datum[measure.name] as number;
    if (!this.props.essence.hasComparison()) {
      return measure.formatFn(currentValue);
    }
    const previous = datum[measure.getDerivedName(MeasureDerivation.PREVIOUS)] as number;
    return <MeasureBubbleContent
      current={currentValue}
      previous={previous}
      formatter={measure.formatFn}/>;
  }

  calculateExtend(dataset: Dataset, splits: Splits, getY: Unary<Datum, number>, getYP: Unary<Datum, number>) {

    function extentForData(data: Datum[], accessor: Unary<Datum, number>) {
      return d3.extent(data, accessor);
    }

    if (splits.length() === 1) {
      const [currMin, currMax] = extentForData(dataset.data, getY);
      const [prevMin, prevMax] = extentForData(dataset.data, getYP);
      return [d3.min([currMin, prevMin]), d3.max([currMax, prevMax])];
    } else {
      return dataset.data.reduce((acc, datum) => {
        const split = datum[SPLIT] as Dataset;
        if (!split) {
          return acc;
        }
        const [accMin, accMax] = acc;
        const [currMin, currMax] = extentForData(split.data, getY);
        const [prevMin, prevMax] = extentForData(split.data, getYP);
        return [d3.min([currMin, prevMin, accMin]), d3.max([currMax, prevMax, accMax])];
      }, [0, 0]);
    }
  }

  renderChartLines(splitData: Dataset, isHovered: boolean, lineStage: Stage, getY: Unary<Datum, number>, getYP: Unary<Datum, number>, scaleY: Linear<number, number>) {
    const { essence } = this.props;
    const hasComparison = essence.hasComparison();
    const { splits, colors } = essence;

    const { hoverRange, scaleX, continuousDimension } = this.state;
    const getX = (d: Datum) => d[continuousDimension.name] as (TimeRange | NumberRange);

    if (splits.length() === 1) {
      const curriedSingleChartLine = (getter: Unary<Datum, number>, isPrevious = false) =>
        <ChartLine
          key={`single-${isPrevious ? "previous" : "current"}`}
          dataset={splitData}
          getX={getX}
          getY={getter}
          scaleX={scaleX}
          scaleY={scaleY}
          stage={lineStage}
          dashed={isPrevious}
          showArea={true}
          hoverRange={isHovered ? hoverRange : null}
          color="default"
        />;

      return concatTruthy(
        curriedSingleChartLine(getY),
        hasComparison && curriedSingleChartLine(getYP, true));
    }
    let colorValues: string[] = null;
    const categoryDimension = essence.splits.get(0).getDimension(essence.dataCube.dimensions);

    if (colors) {
      colorValues = colors.getColors(splitData.data.map(d => d[categoryDimension.name]));
    }

    return flatMap(splitData.data, (datum, i) => {
      const subDataset = datum[SPLIT] as Dataset;
      if (!subDataset) return [];
      return concatTruthy(<ChartLine
        key={"single-current-" + i}
        dataset={subDataset}
        getX={getX}
        getY={getY}
        scaleX={scaleX}
        scaleY={scaleY}
        stage={lineStage}
        showArea={false}
        hoverRange={isHovered ? hoverRange : null}
        color={colorValues ? colorValues[i] : null}
      />, hasComparison && <ChartLine
        key={"single-previous-" + i}
        dataset={subDataset}
        getX={getX}
        getY={getYP}
        scaleX={scaleX}
        scaleY={scaleY}
        stage={lineStage}
        dashed={true}
        showArea={false}
        hoverRange={isHovered ? hoverRange : null}
        color={colorValues ? colorValues[i] : null}
      />);
    });
  }

  renderVerticalAxis(scale: Linear<number, number>, yAxisStage: Stage) {
    return <VerticalAxis
      stage={yAxisStage}
      ticks={this.calculateTicks(scale)}
      scale={scale}
    />;
  }

  renderHorizontalGridLines(scale: Linear<number, number>, lineStage: Stage) {
    return <GridLines
      orientation="horizontal"
      scale={scale}
      ticks={this.calculateTicks(scale)}
      stage={lineStage}
    />;
  }

  getScale(extent: number[], lineStage: Stage): Linear<number, number> {
    if (isNaN(extent[0]) || isNaN(extent[1])) {
      return null;
    }

    return d3.scale.linear()
      .domain([Math.min(extent[0] * 1.1, 0), Math.max(extent[1] * 1.1, 0)])
      .range([lineStage.height, 0]);
  }

  calculateTicks(scale: Linear<number, number>) {
    return scale.ticks(5).filter((n: number) => n !== 0);
  }

  renderChart(dataset: Dataset, measure: Measure, chartIndex: number, containerStage: Stage, chartStage: Stage): JSX.Element {
    const { essence, isThumbnail } = this.props;

    const { hoverMeasure, dragRange, scaleX, xTicks } = this.state;
    const { splits } = essence;

    const lineStage = chartStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH, bottom: 1 }); // leave 1 for border
    const yAxisStage = chartStage.within({ top: TEXT_SPACER, left: lineStage.width, bottom: 1 });

    const getY: Unary<Datum, number> = (d: Datum) => d[measure.name] as number;
    const getYP: Unary<Datum, number> = (d: Datum) => d[measure.getDerivedName(MeasureDerivation.PREVIOUS)] as number;

    const datum: Datum = dataset.data[0];
    const splitData = datum[SPLIT] as Dataset;

    const extent = this.calculateExtend(splitData, splits, getY, getYP);
    const scale = this.getScale(extent, lineStage);

    const isHovered = !dragRange && hoverMeasure === measure;

    return <div
      className="measure-line-chart"
      key={measure.name}
      onMouseDown={this.onMouseDown.bind(this, measure)}
      onMouseMove={this.onMouseMove.bind(this, splitData, measure, scaleX)}
      onMouseLeave={this.onMouseLeave.bind(this, measure)}
    >
      <svg style={chartStage.getWidthHeight()} viewBox={chartStage.getViewBox()}>
        {scale && this.renderHorizontalGridLines(scale, lineStage)}
        <GridLines
          orientation="vertical"
          scale={scaleX}
          ticks={xTicks}
          stage={lineStage}
        />
        {scale && this.renderChartLines(splitData, isHovered, lineStage, getY, getYP, scale)}
        {scale && this.renderVerticalAxis(scale, yAxisStage)}
        <line
          className="vis-bottom"
          x1="0"
          y1={chartStage.height - 0.5}
          x2={chartStage.width}
          y2={chartStage.height - 0.5}
        />
      </svg>
      {!isThumbnail ? <VisMeasureLabel measure={measure} datum={datum} showPrevious={essence.hasComparison()}/> : null}
      {this.renderHighlighter()}
      {scale && this.renderChartBubble(splitData, measure, chartIndex, containerStage, chartStage, extent, scale)}
    </div>;

  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence, timekeeper, stage } = props;
    const { splits, timezone, dataCube } = essence;

    const existingDatasetLoad = this.state.datasetLoad;
    let newState: LineChartState = {};
    if (datasetLoad) {
      // Always keep the old dataset while loading (for now)
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      datasetLoad = this.state.datasetLoad;
    }

    if (splits.length() > 0) {
      const { dataset } = datasetLoad;
      if (dataset) {
        if (registerDownloadableDataset) registerDownloadableDataset(dataset);
      }

      const continuousSplit = splits.length() === 1 ? splits.get(0) : splits.get(1);
      const continuousDimension = continuousSplit.getDimension(dataCube.dimensions);
      if (continuousDimension) {
        newState.continuousDimension = continuousDimension;

        const filterRange = this.getFilterRange(essence, continuousSplit, timekeeper);
        const datasetRange = this.getDatasetXRange(dataset, continuousDimension);
        const axisRange = union(filterRange, datasetRange);
        if (axisRange) {
          const domain = [(axisRange).start, (axisRange).end] as [number, number];
          const range = [0, stage.width - VIS_H_PADDING * 2 - Y_AXIS_WIDTH];
          const scaleFn = continuousDimension.kind === "time" ? d3.time.scale() : d3.scale.linear();

          newState.axisRange = axisRange;
          newState.scaleX = scaleFn.domain(domain).range(range);
          newState.xTicks = getLineChartTicks(axisRange, timezone);
        }
      }
    }

    this.setState(newState);
  }

  private getFilterRange(essence: Essence, continuousSplit: SplitCombine, timekeeper: Timekeeper): PlywoodRange {
    const continuousDimension = continuousSplit.getDimension(essence.dataCube.dimensions);
    const filterRange = essence
      .getEffectiveFilter(timekeeper, { highlightId: LineChart.id })
      .getExtent(continuousDimension.expression) as PlywoodRange;

    const maxTime = essence.dataCube.getMaxTime(timekeeper);
    return this.ensureMaxTime(filterRange, maxTime, continuousSplit, essence.timezone);
  }

  private ensureMaxTime(axisRange: PlywoodRange, maxTime: Date, continuousSplit: SplitCombine, timezone: Timezone) {
    // Special treatment for realtime data, i.e. time data where the maxTime is within Duration of the filter end
    const continuousBucketAction = continuousSplit.bucketAction;
    if (maxTime && continuousBucketAction instanceof TimeBucketExpression) {
      const continuousDuration = continuousBucketAction.duration;
      const axisRangeEnd = axisRange.end as Date;
      const axisRangeEndFloor = continuousDuration.floor(axisRangeEnd, timezone);
      const axisRangeEndCeil = continuousDuration.shift(axisRangeEndFloor, timezone);
      if (maxTime && axisRangeEndFloor < maxTime && maxTime < axisRangeEndCeil) {
        return Range.fromJS({ start: axisRange.start, end: axisRangeEndCeil });
      }
    }
    return axisRange;
  }

  getDatasetXRange(dataset: Dataset, continuousDimension: Dimension): PlywoodRange {
    if (!dataset) return null;
    const key = continuousDimension.name;

    const firstDatum = dataset.data[0];
    let ranges: PlywoodRange[];
    if (firstDatum["SPLIT"]) {
      ranges = dataset.data.map(d => this.getDatasetXRange(d["SPLIT"] as Dataset, continuousDimension));
    } else {
      ranges = dataset.data.map(d => (d as any)[key] as PlywoodRange);

    }

    return ranges.reduce((a: PlywoodRange, b: PlywoodRange) => (a && b) ? a.extend(b) : (a || b));
  }

  scrollCharts(scrollEvent: MouseEvent) {
    const { scrollTop, scrollLeft } = scrollEvent.target as Element;

    this.setState(state => ({
      ...state,
      scrollLeft,
      scrollTop,
      hoverRange: null,
      hoverMeasure: null
    }));
  }

  renderInternals() {
    const { essence, stage } = this.props;
    const { datasetLoad, axisRange, scaleX, xTicks } = this.state;
    const { splits, timezone } = essence;

    let measureCharts: JSX.Element[];
    let bottomAxis: JSX.Element;

    if (datasetLoad.dataset && splits.length() && axisRange) {
      const measures = essence.getEffectiveMeasures().toArray();

      const chartWidth = stage.width - VIS_H_PADDING * 2;
      const chartHeight = Math.max(
        MIN_CHART_HEIGHT,
        Math.floor(Math.min(
          chartWidth / MAX_ASPECT_RATIO,
          (stage.height - X_AXIS_HEIGHT) / measures.length
        ))
      );
      const chartStage = new Stage({
        x: VIS_H_PADDING,
        y: 0,
        width: chartWidth,
        height: chartHeight
      });

      measureCharts = measures.map((measure, chartIndex) => {
        return this.renderChart(datasetLoad.dataset, measure, chartIndex, stage, chartStage);
      });

      const xAxisStage = Stage.fromSize(chartStage.width, X_AXIS_HEIGHT);
      bottomAxis = <svg
        className="bottom-axis"
        width={xAxisStage.width}
        height={xAxisStage.height}
      >
        <LineChartAxis stage={xAxisStage} ticks={xTicks} scale={scaleX} timezone={timezone}/>
      </svg>;
    }

    const measureChartsStyle = {
      maxHeight: stage.height - X_AXIS_HEIGHT
    };

    return <div className="internals line-chart-inner">
      <GlobalEventListener
        scroll={this.scrollCharts.bind(this)}
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
