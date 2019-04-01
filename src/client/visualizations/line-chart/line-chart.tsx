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

import { Duration, Timezone } from "chronoshift";
import * as d3 from "d3";
import { List } from "immutable";
import { immutableEqual } from "immutable-class";
import { Dataset, Datum, NumberRange, NumberRangeJS, PlywoodRange, Range, TimeRange, TimeRangeJS } from "plywood";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { LINE_CHART_MANIFEST } from "../../../common/manifests/line-chart/line-chart";
import { DateRange } from "../../../common/models/date-range/date-range";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { FixedTimeFilterClause, NumberFilterClause, NumberRange as FilterNumberRange } from "../../../common/models/filter-clause/filter-clause";
import { Filter } from "../../../common/models/filter/filter";
import { ContinuousDimensionKind, getBestBucketUnitForRange } from "../../../common/models/granularity/granularity";
import { Measure } from "../../../common/models/measure/measure";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { Split } from "../../../common/models/split/split";
import { Splits } from "../../../common/models/splits/splits";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { formatValue } from "../../../common/utils/formatter/formatter";
import { concatTruthy, flatMap, mapTruthy, Unary } from "../../../common/utils/functional/functional";
import { readNumber } from "../../../common/utils/general/general";
import { union } from "../../../common/utils/plywood/range";
import { ChartLine } from "../../components/chart-line/chart-line";
import { ColorEntry, ColorSwabs } from "../../components/color-swabs/color-swabs";
import { Delta } from "../../components/delta/delta";
import { GlobalEventListener } from "../../components/global-event-listener/global-event-listener";
import { GridLines } from "../../components/grid-lines/grid-lines";
import { HighlightModal } from "../../components/highlight-modal/highlight-modal";
import { Highlighter } from "../../components/highlighter/highlighter";
import { HoverMultiBubble } from "../../components/hover-multi-bubble/hover-multi-bubble";
import { LineChartAxis } from "../../components/line-chart-axis/line-chart-axis";
import { MeasureBubbleContent } from "../../components/measure-bubble-content/measure-bubble-content";
import { SegmentBubble } from "../../components/segment-bubble/segment-bubble";
import { VerticalAxis } from "../../components/vertical-axis/vertical-axis";
import { VisMeasureLabel } from "../../components/vis-measure-label/vis-measure-label";
import { SPLIT, VIS_H_PADDING } from "../../config/constants";
import { escapeKey, getXFromEvent, JSXNode } from "../../utils/dom/dom";
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
  let closestDatum: Datum = null;
  let minDist = Infinity;
  for (const datum of data) {
    const continuousSegmentValue = datum[continuousDimension.name] as (TimeRange | NumberRange);
    if (!continuousSegmentValue || !Range.isRange(continuousSegmentValue)) continue; // !Range.isRange => temp solution for non-bucketed reaching here
    const mid = continuousSegmentValue.midpoint();
    const dist = Math.abs(mid.valueOf() - dragDate.valueOf());
    const distPx = Math.abs(scaleX(mid) - scaleX(dragDate));
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
  // TODO: fix this type
  scaleX?: any;
  xTicks?: continuousValueType[];
}

export class LineChart extends BaseVisualization<LineChartState> {
  protected className = LINE_CHART_MANIFEST.name;

  getDefaultState(): LineChartState {
    return { dragStartValue: null, dragRange: null, hoverRange: null, ...super.getDefaultState() };
  }

  componentDidUpdate() {
    const { containerYPosition, containerXPosition } = this.state;

    const node = ReactDOM.findDOMNode(this.refs["container"]);
    if (!node) return;

    const rect = node.getBoundingClientRect();

    if (containerYPosition !== rect.top || containerXPosition !== rect.left) {
      this.setState({
        containerYPosition: rect.top,
        containerXPosition: rect.left
      });
    }
  }

  componentWillUpdate({ stage: { width } }: VisualizationProps) {
    const { stage: { width: oldWidth } } = this.props;
    if (width !== oldWidth) {
      const { axisRange, continuousDimension } = this.state;
      const scaleX = this.getScaleX(continuousDimension.kind as ContinuousDimensionKind, axisRange, width);
      this.setState({ scaleX });
    }
  }

  protected shouldFetchData(props: VisualizationProps): boolean {
    const { essence } = props;
    return this.differentVisualizationDefinition(props) || essence.differentColors(this.props.essence);
  }

  getMyEventX(e: MouseEvent): number {
    const myDOM = ReactDOM.findDOMNode(this);
    const rect = myDOM.getBoundingClientRect();
    return getXFromEvent(e) - (rect.left + VIS_H_PADDING);
  }

  onMouseDown(measure: Measure, e: MouseEvent) {
    const { clicker } = this.props;
    const { scaleX } = this.state;
    if (!scaleX || !clicker.dropHighlight || !clicker.changeHighlight) return;

    const dragStartValue = scaleX.invert(this.getMyEventX(e));
    this.setState({
      dragStartValue,
      dragRange: null,
      dragOnMeasure: measure
    });
  }

  onMouseMove(dataset: Dataset, measure: Measure, scaleX: any, e: MouseEvent) {
    const { essence } = this.props;
    const { continuousDimension, hoverRange, hoverMeasure } = this.state;
    if (!dataset) return;

    const splitLength = essence.splits.length();

    const myDOM = ReactDOM.findDOMNode(this);
    const rect = myDOM.getBoundingClientRect();
    const dragDate = scaleX.invert(getXFromEvent(e) - (rect.left + VIS_H_PADDING));

    let closestDatum: Datum;
    if (splitLength > 1) {
      const flattened = dataset.flatten();
      closestDatum = findClosest(flattened.data, dragDate, scaleX, continuousDimension);
    } else {
      closestDatum = findClosest(dataset.data, dragDate, scaleX, continuousDimension);
    }

    const currentHoverRange: any = closestDatum ? (closestDatum[continuousDimension.name]) : null;

    if (!hoverRange || !immutableEqual(hoverRange, currentHoverRange) || measure !== hoverMeasure) {
      this.setState({
        hoverRange: currentHoverRange,
        hoverMeasure: measure
      });
    }
  }

  getDragRange(e: MouseEvent): PlywoodRange {
    const { dragStartValue, axisRange, scaleX } = this.state;

    let dragEndValue = scaleX.invert(this.getMyEventX(e));
    let rangeJS: TimeRangeJS | NumberRangeJS = null;

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
    const continuousSplit = splits.splits.last();
    if (!continuousSplit.bucket) return dragRange; // temp solution for non-bucketed reaching here

    if (TimeRange.isTimeRange(dragRange)) {
      const duration = continuousSplit.bucket as Duration;
      return TimeRange.fromJS({
        start: duration.floor(dragRange.start, timezone),
        end: duration.shift(duration.floor(dragRange.end, timezone), timezone, 1)
      });
    } else {
      const bucketSize = continuousSplit.bucket as number;
      const startFloored = roundTo((dragRange as NumberRange).start, bucketSize);
      let endFloored = roundTo((dragRange as NumberRange).end, bucketSize);

      if (endFloored - startFloored < bucketSize) {
        endFloored += bucketSize;
      }

      return NumberRange.fromJS({
        start: startFloored,
        end: endFloored
      });
    }
  }

  globalMouseMoveListener = (e: MouseEvent) => {
    const { dragStartValue } = this.state;
    if (dragStartValue === null) return;

    const dragRange = this.getDragRange(e);
    this.setState({
      dragRange,
      roundDragRange: this.floorRange(dragRange)
    });
  }

  globalMouseUpListener = (e: MouseEvent) => {
    const { clicker, essence } = this.props;
    const { continuousDimension, dragStartValue, dragRange, dragOnMeasure } = this.state;
    if (dragStartValue === null) return;

    const highlightRange = this.floorRange(this.getDragRange(e));
    this.resetDrag();

    // If already highlighted and user clicks within it switches measure
    if (!dragRange && essence.hasHighlight()) {
      const { highlight: { delta, measure } } = essence;
      const existingHighlightRange = essence.getHighlightRange();
      if (existingHighlightRange.contains(highlightRange.start) && measure !== dragOnMeasure.name) {
        clicker.changeHighlight(dragOnMeasure.name, delta);
        return;
      }
    }

    const reference = continuousDimension.name;
    const { start, end } = highlightRange;
    const filterClause = continuousDimension.kind === "number"
      ? new NumberFilterClause({ reference, values: List.of(new FilterNumberRange({ start: start as number, end: end as number })) })
      : new FixedTimeFilterClause({ reference, values: List.of(new DateRange({ start: start as Date, end: end as Date })) });

    clicker.changeHighlight(
      dragOnMeasure.name,
      Filter.fromClause(filterClause)
    );
  }

  globalKeyDownListener = (e: KeyboardEvent) => {
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

  onMouseLeave(measure: Measure) {
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
      return <Highlighter highlightRange={dragRange} scaleX={scaleX} />;
    }
    if (essence.hasHighlight()) {
      const highlightRange = essence.getHighlightRange();
      return <Highlighter highlightRange={highlightRange} scaleX={scaleX} />;
    }
    return null;
  }

  renderChartBubble(
    dataset: Dataset,
    series: ConcreteSeries,
    chartIndex: number,
    containerStage: Stage,
    chartStage: Stage,
    extentY: number[],
    scaleY: any
  ): JSX.Element {
    const { clicker, essence } = this.props;
    const { highlight, colors, timezone } = essence;

    const { containerYPosition, containerXPosition, scrollTop, dragRange, roundDragRange } = this.state;
    const { dragOnMeasure, scaleX, hoverRange, hoverMeasure, continuousDimension } = this.state;

    const formatter = series.formatter();

    if (highlight && !essence.highlightOn(series.measure.name)) return null;

    let topOffset = chartStage.height * chartIndex + scaleY(extentY[1]) + TEXT_SPACER - scrollTop;
    if (topOffset < 0) return null;

    topOffset += containerYPosition;

    if ((dragRange && dragOnMeasure === series.measure) || (!dragRange && essence.highlightOn(series.measure.name))) {
      const bubbleRange = dragRange || essence.getHighlightRange();

      const shownRange = roundDragRange || bubbleRange;

      if (colors) {
        const segmentLabel = formatValue(bubbleRange, timezone);
        const firstSplit = essence.splits.splits.first();
        const categoryDimension = essence.dataCube.getDimension(firstSplit.reference);
        const leftOffset = containerXPosition + VIS_H_PADDING + scaleX(bubbleRange.midpoint());

        const hoverDatums = dataset.data.map(splitRangeExtractor(continuousDimension.name, bubbleRange));
        const colorValues = colors.getColors(dataset.data.map(d => d[categoryDimension.name]));
        const colorEntries: ColorEntry[] = mapTruthy(dataset.data, (d, i) => {
          const segment = d[categoryDimension.name];
          const hoverDatum = hoverDatums[i];
          if (!hoverDatum) return null;

          return {
            color: colorValues[i],
            name: String(segment),
            value: series.formatValue(hoverDatum),
            delta: essence.hasComparison() && <Delta
              currentValue={series.selectValue(hoverDatum)}
              previousValue={series.selectValue(hoverDatum, SeriesDerivation.PREVIOUS)}
              formatter={formatter}
              lowerIsBetter={series.measure.lowerIsBetter}
            />
          };
        });

        return <HighlightModal
          left={leftOffset}
          top={topOffset + HOVER_MULTI_BUBBLE_V_OFFSET}
          title={segmentLabel}
          clicker={clicker}>
          <ColorSwabs colorEntries={colorEntries} />
        </HighlightModal>;
      } else {
        const leftOffset = containerXPosition + VIS_H_PADDING + scaleX(bubbleRange.midpoint());
        const segmentLabel = formatValue(shownRange, timezone);
        const highlightDatum = dataset.findDatumByAttribute(continuousDimension.name, shownRange);
        const measureLabel = highlightDatum ? series.formatValue(highlightDatum) : null;

        return <HighlightModal
          left={leftOffset}
          top={topOffset + HOVER_BUBBLE_V_OFFSET}
          title={segmentLabel}
          clicker={clicker}>
          {measureLabel}
        </HighlightModal>;
      }

    } else if (!dragRange && hoverRange && hoverMeasure === series.measure) {
      const leftOffset = containerXPosition + VIS_H_PADDING + scaleX((hoverRange as NumberRange | TimeRange).midpoint());
      const segmentLabel = formatValue(hoverRange, timezone);

      if (colors) {
        const firstSplit = essence.splits.splits.first();
        const categoryDimension = essence.dataCube.getDimension(firstSplit.reference);
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
            value: series.formatValue(hoverDatum)
          };

          if (!hasComparison) {
            return currentEntry;
          }

          return {
            ...currentEntry,
            previous: series.formatValue(hoverDatum, SeriesDerivation.PREVIOUS),
            delta: essence.hasComparison() && <Delta
              currentValue={series.selectValue(hoverDatum)}
              previousValue={series.selectValue(hoverDatum, SeriesDerivation.PREVIOUS)}
              formatter={formatter}
              lowerIsBetter={series.measure.lowerIsBetter}
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
        const title = formatValue(hoverRange, timezone);
        const content = this.renderMeasureLabel(hoverDatum, series);

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

  private renderMeasureLabel(datum: Datum, series: ConcreteSeries): JSXNode {
    if (!this.props.essence.hasComparison()) {
      return series.formatValue(datum);
    }
    const currentValue = series.selectValue(datum);
    const previousValue = series.selectValue(datum, SeriesDerivation.PREVIOUS);
    const formatter = series.formatter();
    return <MeasureBubbleContent
      lowerIsBetter={series.measure.lowerIsBetter}
      current={currentValue}
      previous={previousValue}
      formatter={formatter} />;
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
    const firstSplit = essence.splits.splits.first();
    const categoryDimension = essence.dataCube.getDimension(firstSplit.reference);

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

  renderVerticalAxis(scale: Linear<number, number>, formatter: Unary<number, string>, yAxisStage: Stage) {
    return <VerticalAxis
      stage={yAxisStage}
      formatter={formatter}
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

  renderChart(dataset: Dataset, series: ConcreteSeries, chartIndex: number, containerStage: Stage, chartStage: Stage): JSX.Element {
    const { essence, isThumbnail } = this.props;
    const { splits } = essence;
    const formatter = series.formatter();

    const { hoverMeasure, dragRange, scaleX, xTicks } = this.state;

    const lineStage = chartStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH, bottom: 1 }); // leave 1 for border
    const yAxisStage = chartStage.within({ top: TEXT_SPACER, left: lineStage.width, bottom: 1 });

    const getY: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d));
    const getYP: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d, SeriesDerivation.PREVIOUS));

    const datum: Datum = dataset.data[0];
    const splitData = datum[SPLIT] as Dataset;

    const extent = this.calculateExtend(splitData, splits, getY, getYP);
    const scale = this.getScale(extent, lineStage);

    const isHovered = !dragRange && hoverMeasure === series.measure;

    return <React.Fragment>
      <div
        className="measure-line-chart"
        key={series.reactKey()}
        onMouseDown={this.onMouseDown.bind(this, series.measure)}
        onMouseMove={this.onMouseMove.bind(this, splitData, series.measure, scaleX)}
        onMouseLeave={this.onMouseLeave.bind(this, series.measure)}
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
          {scale && this.renderVerticalAxis(scale, formatter, yAxisStage)}
          <line
            className="vis-bottom"
            x1="0"
            y1={chartStage.height - 0.5}
            x2={chartStage.width}
            y2={chartStage.height - 0.5}
          />
        </svg>
        {!isThumbnail && <VisMeasureLabel
          series={series}
          datum={datum}
          showPrevious={essence.hasComparison()} />}
        {this.renderHighlighter()}
      </div>
      {scale && this.renderChartBubble(splitData, series, chartIndex, containerStage, chartStage, extent, scale)}
    </React.Fragment>;

  }

  deriveDatasetState(dataset: Dataset): Partial<LineChartState> {
    const { essence, timekeeper, stage } = this.props;
    const { splits, timezone, dataCube } = essence;

    if (!splits.length()) return {};
    const continuousSplit = splits.length() === 1 ? splits.splits.get(0) : splits.splits.get(1);
    const continuousDimension = dataCube.getDimension(continuousSplit.reference);
    if (!continuousDimension) return {};
    const filterRange = this.getFilterRange(essence, continuousSplit, timekeeper);
    const datasetRange = this.getDatasetXRange(dataset, continuousDimension);
    const axisRange = union(filterRange, datasetRange);
    if (!axisRange) return { continuousDimension };
    const xTicks = this.getLineChartTicks(axisRange, timezone);
    const scaleX = this.getScaleX(continuousDimension.kind as ContinuousDimensionKind, axisRange, stage.width);
    return { continuousDimension, axisRange, scaleX, xTicks };
  }

  private getScaleX(kind: ContinuousDimensionKind, { start, end }: PlywoodRange, stageWidth: number): d3.time.Scale<number, number> | d3.scale.Linear<number, number> {
    const range = [0, stageWidth - VIS_H_PADDING * 2 - Y_AXIS_WIDTH];
    switch (kind) {
      case "number": {
        const domain = [start, end] as [number, number];
        return d3.scale.linear().domain(domain).range(range);
      }
      case "time": {
        const domain = [start, end] as [Date, Date];
        return d3.time.scale().domain(domain).range(range);
      }
    }
  }

  private getLineChartTicks(range: PlywoodRange, timezone: Timezone): Array<Date | number> {
    if (range instanceof TimeRange) {
      const { start, end } = range;
      const tickDuration = getBestBucketUnitForRange(range, true) as Duration;
      return tickDuration.materialize(start, end as Date, timezone);
    }
    if (range instanceof NumberRange) {
      const { start, end } = range;
      const unit = getBestBucketUnitForRange(range, true) as number;
      let values: number[] = [];
      let iter = Math.round((start as number) * unit) / unit;

      while (iter <= end) {
        values.push(iter);
        iter += unit;
      }
      return values;
    }
    throw new Error(`Expected TimeRange or NumberRange. Gor ${range}`);
  }

  private getFilterRange(essence: Essence, continuousSplit: Split, timekeeper: Timekeeper): PlywoodRange {
    const maxTime = essence.dataCube.getMaxTime(timekeeper);
    const continuousDimension = essence.dataCube.getDimension(continuousSplit.reference);
    const effectiveFilter = essence
      .getEffectiveFilter(timekeeper);
    const continuousFilter = effectiveFilter.getClauseForDimension(continuousDimension);

    let range = null;
    if (continuousFilter instanceof NumberFilterClause) {
      range = NumberRange.fromJS(continuousFilter.values.first());
    }
    if (continuousFilter instanceof FixedTimeFilterClause) {
      range = TimeRange.fromJS(continuousFilter.values.first());
    }
    return this.ensureMaxTime(range, maxTime, continuousSplit, essence.timezone);
  }

  private ensureMaxTime(axisRange: PlywoodRange, maxTime: Date, continuousSplit: Split, timezone: Timezone) {
    // Special treatment for realtime data, i.e. time data where the maxTime is within Duration of the filter end
    const continuousBucket = continuousSplit.bucket;
    if (maxTime && continuousBucket instanceof Duration) {
      const axisRangeEnd = axisRange.end as Date;
      const axisRangeEndFloor = continuousBucket.floor(axisRangeEnd, timezone);
      const axisRangeEndCeil = continuousBucket.shift(axisRangeEndFloor, timezone);
      if (maxTime && axisRangeEndFloor < maxTime && maxTime < axisRangeEndCeil) {
        return Range.fromJS({ start: axisRange.start, end: axisRangeEndCeil });
      }
    }
    return axisRange;
  }

  getDatasetXRange(dataset: Dataset, continuousDimension: Dimension): PlywoodRange {
    if (!dataset || dataset.count() === 0) return null;
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

  scrollCharts = (scrollEvent: MouseEvent) => {
    const { scrollTop, scrollLeft } = scrollEvent.target as Element;

    this.setState(state => ({
      ...state,
      scrollLeft,
      scrollTop,
      hoverRange: null,
      hoverMeasure: null
    }));
  }

  renderInternals(dataset: Dataset) {
    const { essence, stage } = this.props;
    const { axisRange, scaleX, xTicks } = this.state;
    const { splits, timezone } = essence;

    let measureCharts: JSX.Element[];
    let bottomAxis: JSX.Element;

    if (splits.length() && axisRange) {
      const series = essence.getConcreteSeries().toArray();

      const chartWidth = stage.width - VIS_H_PADDING * 2;
      const chartHeight = Math.max(
        MIN_CHART_HEIGHT,
        Math.floor(Math.min(
          chartWidth / MAX_ASPECT_RATIO,
          (stage.height - X_AXIS_HEIGHT) / series.length
        ))
      );
      const chartStage = new Stage({
        x: VIS_H_PADDING,
        y: 0,
        width: chartWidth,
        height: chartHeight
      });

      measureCharts = series.map((series, chartIndex) => {
        return this.renderChart(dataset, series, chartIndex, stage, chartStage);
      });

      const xAxisStage = Stage.fromSize(chartStage.width, X_AXIS_HEIGHT);
      bottomAxis = <svg
        className="bottom-axis"
        width={xAxisStage.width}
        height={xAxisStage.height}
      >
        <LineChartAxis stage={xAxisStage} ticks={xTicks} scale={scaleX} timezone={timezone} />
      </svg>;
    }

    const measureChartsStyle = {
      maxHeight: stage.height - X_AXIS_HEIGHT
    };

    return <div className="internals line-chart-inner">
      <GlobalEventListener
        scroll={this.scrollCharts}
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
