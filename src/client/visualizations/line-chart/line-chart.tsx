/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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
import { DateRange } from "../../../common/models/date-range/date-range";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { FixedTimeFilterClause, NumberFilterClause, NumberRange as FilterNumberRange } from "../../../common/models/filter-clause/filter-clause";
import { ContinuousDimensionKind, getBestBucketUnitForRange } from "../../../common/models/granularity/granularity";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { Series } from "../../../common/models/series/series";
import { Split } from "../../../common/models/split/split";
import { Splits } from "../../../common/models/splits/splits";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { concatTruthy, flatMap, Unary } from "../../../common/utils/functional/functional";
import { readNumber } from "../../../common/utils/general/general";
import { union } from "../../../common/utils/plywood/range";
import { LINE_CHART_MANIFEST } from "../../../common/visualization-manifests/line-chart/line-chart";
import { ChartLine } from "../../components/chart-line/chart-line";
import { GlobalEventListener } from "../../components/global-event-listener/global-event-listener";
import { GridLines } from "../../components/grid-lines/grid-lines";
import { Highlighter } from "../../components/highlighter/highlighter";
import { LineChartAxis } from "../../components/line-chart-axis/line-chart-axis";
import { HighlightTooltip, HoverTooltip } from "../../components/line-chart-tooltip/line-chart-tooltip";
import { VerticalAxis } from "../../components/vertical-axis/vertical-axis";
import { VisMeasureLabel } from "../../components/vis-measure-label/vis-measure-label";
import { SPLIT, VIS_H_PADDING } from "../../config/constants";
import { escapeKey, getXFromEvent } from "../../utils/dom/dom";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./line-chart.scss";
import Linear = d3.scale.Linear;

const TEXT_SPACER = 36;
const X_AXIS_HEIGHT = 30;
const Y_AXIS_WIDTH = 60;
const MIN_CHART_HEIGHT = 140;
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

export type continuousValueType = Date | number;

export interface LineChartState extends BaseVisualizationState {
  dragStartValue?: continuousValueType;
  dragRange?: PlywoodRange;
  hoverRange?: PlywoodRange;
  containerYPosition?: number;
  containerXPosition?: number;

  // Cached props
  axisRange?: PlywoodRange;
  // TODO: fix this type
  scaleX?: any;
  xTicks?: continuousValueType[];
}

export class LineChart extends BaseVisualization<LineChartState> {
  protected className = LINE_CHART_MANIFEST.name;
  private container = React.createRef<HTMLDivElement>();

  getDefaultState(): LineChartState {
    return { dragStartValue: null, dragRange: null, hoverRange: null, ...super.getDefaultState() };
  }

  componentDidUpdate() {
    const { containerYPosition, containerXPosition } = this.state;

    const node = this.container.current;
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
      const { axisRange } = this.state;
      const scaleX = this.getScaleX(this.getContinuousDimension().kind as ContinuousDimensionKind, axisRange, width);
      this.setState({ scaleX });
    }
  }

  protected shouldFetchData(props: VisualizationProps): boolean {
    const { essence } = props;
    return this.differentVisualizationDefinition(props) || essence.differentColors(this.props.essence);
  }

  getMyEventX(e: React.MouseEvent<HTMLElement> | MouseEvent): number {
    const myDOM = ReactDOM.findDOMNode(this) as Element;
    const rect = myDOM.getBoundingClientRect();
    return getXFromEvent(e) - (rect.left + VIS_H_PADDING);
  }

  onMouseDown = (series: Series, e: React.MouseEvent<HTMLDivElement>) => {
    const { scaleX } = this.state;
    if (!scaleX) return;

    const dragStartValue = scaleX.invert(this.getMyEventX(e));
    this.setState({
      dragStartValue,
      dragRange: null,
      dragOnSeries: series
    });
  };

  onMouseMove = (dataset: Dataset, scaleX: any, e: React.MouseEvent<HTMLDivElement>) => {
    const { essence } = this.props;
    const { hoverRange } = this.state;
    if (!dataset) return;

    const splitLength = essence.splits.length();
    const continuousDimension = this.getContinuousDimension();

    const myDOM = ReactDOM.findDOMNode(this) as Element;
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

    if (!hoverRange || !immutableEqual(hoverRange, currentHoverRange)) {
      this.setState({
        hoverRange: currentHoverRange
      });
    }
  };

  getDragRange(e: MouseEvent): PlywoodRange | null {
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

  floorRange(dragRange: PlywoodRange): PlywoodRange | null {
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
    }
    if (NumberRange.isNumberRange(dragRange)) {
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

    return null;
  }

  globalMouseMoveListener = (e: MouseEvent) => {
    const { dragStartValue } = this.state;
    if (dragStartValue === null) return;

    const dragRange = this.getDragRange(e);
    this.setState({
      dragRange
    });
  };

  globalMouseUpListener = (e: MouseEvent) => {
    const { dragStartValue, dragRange, dragOnSeries } = this.state;
    if (dragStartValue === null) return;

    const newDragRange = this.getDragRange(e);
    this.resetDrag();
    if (!newDragRange) return;
    const flooredDragRange = this.floorRange(newDragRange);

    // If already highlighted and user clicks within it switches measure
    if (!dragRange && this.hasHighlight()) {
      const existingHighlightRange = this.highlightRange();
      if (!this.highlightOn(dragOnSeries.key()) && existingHighlightRange.contains(flooredDragRange.start)) {
        const { clauses } = this.getHighlight();
        this.highlight(clauses, dragOnSeries.key());
        return;
      }
    }

    const continuousDimension = this.getContinuousDimension();
    const reference = continuousDimension.name;
    const { start, end } = flooredDragRange;
    const filterClause = continuousDimension.kind === "number"
      ? new NumberFilterClause({ reference, values: List.of(new FilterNumberRange({ start: start as number, end: end as number })) })
      : new FixedTimeFilterClause({ reference, values: List.of(new DateRange({ start: start as Date, end: end as Date })) });

    this.highlight(List.of(filterClause), dragOnSeries.key());
  };

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (!escapeKey(e)) return;

    const { dragStartValue } = this.state;
    if (dragStartValue === null) return;

    this.resetDrag();
  };

  resetDrag() {
    this.setState({
      dragStartValue: null,
      dragRange: null,
      dragOnSeries: null
    });
  }

  onMouseLeave = () => {
    this.setState({
      hoverRange: null
    });
  };

  highlightRange(): PlywoodRange {
    const clauses = this.getHighlightClauses();
    if (!clauses) return null;
    const clause = clauses.first();
    if ((clause instanceof NumberFilterClause) || (clause instanceof FixedTimeFilterClause)) {
      return Range.fromJS(clause.values.first());
    }
    return null;
  }

  renderHighlighter(): JSX.Element {
    const { dragRange, scaleX } = this.state;

    if (dragRange !== null) {
      return <Highlighter highlightRange={dragRange} scaleX={scaleX} />;
    }
    if (this.hasHighlight()) {
      const highlightRange = this.highlightRange();
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
    const { essence } = this.props;

    const { containerYPosition, containerXPosition, scrollTop, dragRange } = this.state;
    const { dragOnSeries, scaleX, hoverRange } = this.state;

    const highlightOnDifferentSeries = this.hasHighlight() && !this.highlightOn(series.definition.key());
    if (highlightOnDifferentSeries) return null;

    const topOffset = chartStage.height * chartIndex + scaleY(extentY[1]) + TEXT_SPACER - scrollTop;
    if (topOffset < 0) return null;

    if ((dragRange && dragOnSeries.equals(series)) || (!dragRange && this.highlightOn(series.definition.key()))) {
      const highlightRange = dragRange || this.highlightRange();
      const leftOffset = containerXPosition + VIS_H_PADDING + scaleX(highlightRange.midpoint());
      return <HighlightTooltip
        highlightRange={highlightRange}
        dataset={dataset}
        series={series}
        essence={essence}
        dropHighlight={this.dropHighlight}
        acceptHighlight={this.acceptHighlight}
        topOffset={topOffset + containerYPosition}
        leftOffset={leftOffset} />;
    } else if (!dragRange && hoverRange) {
      const leftOffset = VIS_H_PADDING + scaleX((hoverRange as NumberRange | TimeRange).midpoint());
      return <HoverTooltip
        hoverRange={hoverRange}
        dataset={dataset}
        series={series}
        essence={essence}
        topOffset={topOffset}
        leftOffset={leftOffset}
      />;
    }

    return null;
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

  renderChartLines(dataset: Dataset, showHoverPoint: boolean, stage: Stage, getY: Unary<Datum, number>, getYP: Unary<Datum, number>, scaleY: Linear<number, number>) {
    const { essence } = this.props;
    const hasComparison = essence.hasComparison();
    const { splits, colors } = essence;

    const { hoverRange, scaleX } = this.state;
    const continuousDimension = this.getContinuousDimension();
    const getX = (d: Datum) => d[continuousDimension.name] as (TimeRange | NumberRange);

    const lineProps = {
      getX,
      scaleX,
      scaleY,
      stage,
      hoverRange: showHoverPoint ? hoverRange : null
    };

    if (splits.length() === 1) {
      const singleSplitProps = { ...lineProps, dataset, showArea: true, color: "default" };
      return concatTruthy(
        <ChartLine {...{
          ...singleSplitProps,
          key: "single-current",
          getY
        }} />,
        hasComparison && <ChartLine {...{
          ...singleSplitProps,
          key: "single-previous",
          getY: getYP,
          dashed: true
        }} />);
    }

    const firstSplit = essence.splits.splits.first();
    const categoryDimension = essence.dataCube.getDimension(firstSplit.reference);
    const colorValues = colors && colors.getColors(dataset.data.map(d => d[categoryDimension.name]));

    return flatMap(dataset.data, (datum, i) => {
      const subDataset = datum[SPLIT] as Dataset;
      if (!subDataset) return [];
      const color = colorValues && colorValues[i];
      const doubleSplitProps = { ...lineProps, color, dataset: subDataset, showArea: false };
      return concatTruthy(
        <ChartLine {...{
          ...doubleSplitProps,
          key: `multi-current-${i}`,
          getY
        }} />,
        hasComparison && <ChartLine {...{
          ...doubleSplitProps,
          key: `multi-previous-${i}`,
          getY: getYP,
          dashed: true
        }} />
      );
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
    const { essence } = this.props;
    const { splits } = essence;
    const formatter = series.formatter();

    const { dragRange, hoverRange, scaleX, xTicks } = this.state;

    const lineStage = chartStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH, bottom: 1 }); // leave 1 for border
    const yAxisStage = chartStage.within({ top: TEXT_SPACER, left: lineStage.width, bottom: 1 });

    const getY: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d));
    const getYP: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d, SeriesDerivation.PREVIOUS));

    const datum: Datum = dataset.data[0];
    const splitData = datum[SPLIT] as Dataset;

    const extent = this.calculateExtend(splitData, splits, getY, getYP);
    const scale = this.getScale(extent, lineStage);

    const isHovered = !dragRange && !!hoverRange;
    const isHoveredWithoutHighlight = isHovered && !this.hasHighlight();

    return <React.Fragment key={series.reactKey()}>
      <div
        className="measure-line-chart"
        onMouseDown={e => this.onMouseDown(series.definition, e)}
        onMouseMove={e => this.onMouseMove(splitData, scaleX, e)}
        onMouseLeave={() => this.onMouseLeave()}
      >
        <svg style={chartStage.getWidthHeight()} viewBox={chartStage.getViewBox()}>
          {scale && this.renderHorizontalGridLines(scale, lineStage)}
          <GridLines
            orientation="vertical"
            scale={scaleX}
            ticks={xTicks}
            stage={lineStage}
          />
          {scale && isHoveredWithoutHighlight && this.renderHoverGuide(scale(0), lineStage)}
          {scale && this.renderChartLines(splitData, isHoveredWithoutHighlight, lineStage, getY, getYP, scale)}
          {scale && this.renderVerticalAxis(scale, formatter, yAxisStage)}
          <line
            className="vis-bottom"
            x1="0"
            y1={chartStage.height - 0.5}
            x2={chartStage.width}
            y2={chartStage.height - 0.5}
          />
        </svg>
        <VisMeasureLabel
          series={series}
          datum={datum}
          showPrevious={essence.hasComparison()} />
        {this.renderHighlighter()}
      </div>
      {scale && this.renderChartBubble(splitData, series, chartIndex, containerStage, chartStage, extent, scale)}
    </React.Fragment>;
  }

  private getContinuousDimension(): Dimension {
    const { essence: { dataCube } } = this.props;
    const continuousSplit = this.getContinuousSplit();
    return dataCube.getDimension(continuousSplit.reference);
  }

  private getContinuousSplit(): Split {
    const { essence: { splits } } = this.props;
    return splits.length() === 1 ? splits.splits.get(0) : splits.splits.get(1);
  }

  renderHoverGuide(height: number, stage: Stage): JSX.Element {
    const { scaleX, hoverRange, dragRange } = this.state;
    if (dragRange || !hoverRange) return null;
    const midpoint = hoverRange.midpoint();
    const x = scaleX(midpoint);
    return <line
      x1={x}
      x2={x}
      y1={0}
      y2={height}
      className="hover-guide"
      transform={stage.getTransform()} />;
  }

  deriveDatasetState(dataset: Dataset): Partial<LineChartState> {
    const { essence, timekeeper, stage } = this.props;
    const { splits, timezone } = essence;

    if (!splits.length()) return {};
    const continuousSplit = this.getContinuousSplit();
    const continuousDimension = this.getContinuousDimension();
    if (!continuousDimension) return {};
    const filterRange = this.getFilterRange(essence, continuousSplit, timekeeper);
    const datasetRange = this.getDatasetXRange(dataset, continuousDimension);
    const axisRange = union(filterRange, datasetRange);
    if (!axisRange) return {};
    const xTicks = this.getLineChartTicks(axisRange, timezone);
    const scaleX = this.getScaleX(continuousDimension.kind as ContinuousDimensionKind, axisRange, stage.width);
    return { axisRange, scaleX, xTicks };
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
      hoverSeries: null
    }));
  };

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
        ref={this.container}
      >
        {measureCharts}
      </div>
      {bottomAxis}
    </div>;
  }

}
