/*
 * Copyright 2017-2022 Allegro.pl
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

import * as d3 from "d3";
import { List, Set } from "immutable";
import { Dataset, Datum, NumberRange, PlywoodRange, PseudoDatum, Range } from "plywood";
import React from "react";
import { ChartProps } from "../../../../common/models/chart-props/chart-props";
import { DateRange } from "../../../../common/models/date-range/date-range";
import { canBucketByDefault, Dimension } from "../../../../common/models/dimension/dimension";
import { findDimensionByName } from "../../../../common/models/dimension/dimensions";
import {
  BooleanFilterClause,
  FilterClause,
  FixedTimeFilterClause,
  NumberFilterClause,
  StringFilterAction,
  StringFilterClause
} from "../../../../common/models/filter-clause/filter-clause";
import { Measure } from "../../../../common/models/measure/measure";
import { ConcreteSeries, SeriesDerivation } from "../../../../common/models/series/concrete-series";
import { Series } from "../../../../common/models/series/series";
import { SortDirection } from "../../../../common/models/sort/sort";
import { SplitType } from "../../../../common/models/split/split";
import { Splits } from "../../../../common/models/splits/splits";
import { Stage } from "../../../../common/models/stage/stage";
import { formatValue } from "../../../../common/utils/formatter/formatter";
import { BAR_CHART_MANIFEST } from "../../../../common/visualization-manifests/bar-chart/bar-chart";
import { BucketMarks } from "../../../components/bucket-marks/bucket-marks";
import { GridLines } from "../../../components/grid-lines/grid-lines";
import { HighlightModal } from "../../../components/highlight-modal/highlight-modal";
import { MeasureBubbleContent } from "../../../components/measure-bubble-content/measure-bubble-content";
import { Scroller, ScrollerLayout } from "../../../components/scroller/scroller";
import { SegmentBubble } from "../../../components/segment-bubble/segment-bubble";
import { VerticalAxis } from "../../../components/vertical-axis/vertical-axis";
import { VisMeasureLabel } from "../../../components/vis-measure-label/vis-measure-label";
import { SPLIT, VIS_H_PADDING } from "../../../config/constants";
import { classNames, roundToPx } from "../../../utils/dom/dom";
import { SettingsContext, SettingsContextValue } from "../../../views/cube-view/settings-context";
import { hasHighlightOn } from "../../highlight-controller/highlight-controller";
import { BarCoordinates } from "../bar-coordinates";

const X_AXIS_HEIGHT = 84;
const Y_AXIS_WIDTH = 60;
const CHART_TOP_PADDING = 10;
const CHART_BOTTOM_PADDING = 0;
const MIN_CHART_HEIGHT = 200;
const MAX_STEP_WIDTH = 140; // Note that the step is bar + empty space around it. The width of the rectangle is step * BAR_PROPORTION
const MIN_STEP_WIDTH = 20;
const BAR_PROPORTION = 0.8;
const BARS_MIN_PAD_LEFT = 30;
const BARS_MIN_PAD_RIGHT = 6;
const HOVER_BUBBLE_V_OFFSET = 8;
const SELECTION_PAD = 4;

function getFilterFromDatum(splits: Splits, dataPath: Datum[]): List<FilterClause> {
  return List(dataPath.map((datum, i) => {
    const { type, reference } = splits.getSplit(i);
    const segment: any = datum[reference];

    switch (type) {
      case SplitType.boolean:
        return new BooleanFilterClause({ reference, values: Set.of(segment) });
      case SplitType.number:
        return new NumberFilterClause({ reference, values: List.of(segment) });
      case SplitType.time:
        return new FixedTimeFilterClause({ reference, values: List.of(new DateRange(segment)) });
      case SplitType.string:
        return new StringFilterClause({ reference, action: StringFilterAction.IN, values: Set.of(segment) });
    }
  }));
}

function padDataset(originalDataset: Dataset, dimension: Dimension, measures: Measure[]): Dataset {
  const data = (originalDataset.data[0][SPLIT] as Dataset).data;
  const dimensionName = dimension.name;

  const firstBucket: PlywoodRange = data[0][dimensionName] as PlywoodRange;
  if (!firstBucket) return originalDataset;
  const start = Number(firstBucket.start);
  const end = Number(firstBucket.end);

  const size = end - start;

  let i = start;
  let j = 0;

  const filledData: Datum[] = [];
  data.forEach(d => {
    const segmentValue = d[dimensionName];
    const segmentStart = (segmentValue as PlywoodRange).start;
    while (i < segmentStart) {
      filledData[j] = {};
      filledData[j][dimensionName] = NumberRange.fromJS({
        start: i,
        end: i + size
      });
      measures.forEach(m => {
        filledData[j][m.name] = 0; // todo: what if effective zero is not 0?
      });

      if (d[SPLIT]) {
        filledData[j][SPLIT] = new Dataset({
          data: [],
          attributes: []
        });
      }

      j++;
      i += size;
    }
    filledData[j] = d;
    i += size;
    j++;
  });

  const value = originalDataset.valueOf();
  (value.data[0][SPLIT] as Dataset).data = filledData;
  return new Dataset(value);
}

export interface BubbleInfo {
  series: ConcreteSeries;
  chartIndex: number;
  path: Datum[];
  coordinates: BarCoordinates;
  splitIndex?: number;
  segmentLabel?: string;
}

export interface BarChartState {
  hoverInfo?: BubbleInfo;
  selectionInfo?: BubbleInfo;
  scrollerYPosition?: number;
  scrollerXPosition?: number;
  scrollTop: number;
  scrollLeft: number;

  // Precalculated stuff
  flatData?: PseudoDatum[];
  maxNumberOfLeaves?: number[];
}

export class BarChart extends React.Component<ChartProps, BarChartState> {
  static contextType = SettingsContext;
  protected className = BAR_CHART_MANIFEST.name;

  private coordinatesCache: BarCoordinates[][] = [];
  private scroller = React.createRef<Scroller>();

  state: BarChartState = this.initState();

  context: SettingsContextValue;

  componentDidUpdate() {
    const { scrollerYPosition, scrollerXPosition } = this.state;

    const scrollerComponent = this.scroller.current;
    if (!scrollerComponent) return;

    const rect = scrollerComponent.scroller.current.getBoundingClientRect();

    if (scrollerYPosition !== rect.top || scrollerXPosition !== rect.left) {
      this.setState({ scrollerYPosition: rect.top, scrollerXPosition: rect.left });
    }
  }

  calculateMousePosition(x: number, y: number): BubbleInfo {
    const { essence } = this.props;

    const series = essence.getConcreteSeries();
    const chartStage = this.getSingleChartStage();
    const chartHeight = this.getOuterChartHeight(chartStage);

    if (y >= chartHeight * series.size) return null; // on x axis
    if (x >= chartStage.width) return null; // on y axis

    const xScale = this.getPrimaryXScale();
    const chartIndex = Math.floor(y / chartHeight);

    const chartCoordinates = this.getBarsCoordinates(chartIndex, xScale);

    const { path, coordinates } = this.findBarCoordinatesForX(x, chartCoordinates, []);

    return {
      path: this.findPathForIndices(path),
      series: series.get(chartIndex),
      chartIndex,
      coordinates
    };
  }

  findPathForIndices(indices: number[]): Datum[] {
    const { data } = this.props;
    const mySplitDataset = data.data[0][SPLIT] as Dataset;

    const path: Datum[] = [];
    let currentData: Dataset = mySplitDataset;
    indices.forEach(i => {
      const datum = currentData.data[i];
      path.push(datum);
      currentData = (datum[SPLIT] as Dataset);
    });

    return path;
  }

  findBarCoordinatesForX(x: number, coordinates: BarCoordinates[], currentPath: number[]): { path: number[], coordinates: BarCoordinates } {
    for (let i = 0; i < coordinates.length; i++) {
      if (coordinates[i].isXWithin(x)) {
        currentPath.push(i);
        if (coordinates[i].hasChildren()) {
          return this.findBarCoordinatesForX(x, coordinates[i].children, currentPath);
        } else {
          return { path: currentPath, coordinates: coordinates[i] };
        }
      }
    }

    return { path: [], coordinates: null };
  }

  onScrollerScroll = (scrollTop: number, scrollLeft: number) => {
    this.setState({
      hoverInfo: null,
      scrollLeft,
      scrollTop
    });
  };

  onMouseMove = (x: number, y: number) => {
    this.setState({ hoverInfo: this.calculateMousePosition(x, y) });
  };

  onMouseLeave = () => {
    this.setState({ hoverInfo: null });
  };

  onClick = (x: number, y: number) => {
    const { essence, highlight, dropHighlight, saveHighlight } = this.props;

    const selectionInfo = this.calculateMousePosition(x, y);

    if (!selectionInfo) return;

    if (!selectionInfo.coordinates) {
      dropHighlight();
      this.setState({ selectionInfo: null });
      return;
    }

    const { path, chartIndex } = selectionInfo;

    const { splits } = essence;
    const series = essence.getConcreteSeries();

    const rowHighlight = getFilterFromDatum(splits, path);

    const currentSeries = series.get(chartIndex).definition;
    if (hasHighlightOn(highlight, currentSeries.key())) {
      if (rowHighlight.equals(highlight.clauses)) {
        dropHighlight();
        this.setState({ selectionInfo: null });
        return;
      }
    }

    this.setState({ selectionInfo });
    saveHighlight(rowHighlight, series.get(chartIndex).definition.key());
  };

  getYExtent(data: Datum[], series: ConcreteSeries): number[] {
    const getY = (d: Datum) => series.selectValue(d);
    return d3.extent(data, getY);
  }

  getYScale(series: ConcreteSeries, yAxisStage: Stage): d3.ScaleLinear<number, number> {
    const { essence } = this.props;
    const { flatData } = this.state;

    const splitLength = essence.splits.length();
    const leafData = flatData.filter((d: Datum) => d["__nest"] === splitLength - 1);

    const extentY = this.getYExtent(leafData, series);

    return d3.scaleLinear()
      .domain([Math.min(extentY[0] * 1.1, 0), Math.max(extentY[1] * 1.1, 0)])
      .range([yAxisStage.height, yAxisStage.y]);
  }

  hasValidYExtent(series: ConcreteSeries, data: Datum[]): boolean {
    const [yMin, yMax] = this.getYExtent(data, series);
    return !isNaN(yMin) && !isNaN(yMax);
  }

  getSingleChartStage(): Stage {
    const xScale = this.getPrimaryXScale();
    const { essence, stage } = this.props;

    const { stepWidth } = this.getBarDimensions(xScale.bandwidth());
    const xTicks = xScale.domain();
    const width = xTicks.length > 0 ? roundToPx(xScale(xTicks[xTicks.length - 1])) + stepWidth : 0;

    const measures = essence.getConcreteSeries();
    const availableHeight = stage.height - X_AXIS_HEIGHT;
    const height = Math.max(MIN_CHART_HEIGHT, Math.floor(availableHeight / measures.size));

    return new Stage({
      x: 0,
      y: CHART_TOP_PADDING,
      width: Math.max(width, stage.width - Y_AXIS_WIDTH - VIS_H_PADDING * 2),
      height: height - CHART_TOP_PADDING - CHART_BOTTOM_PADDING
    });
  }

  getOuterChartHeight(chartStage: Stage): number {
    return chartStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING;
  }

  getAxisStages(chartStage: Stage): { xAxisStage: Stage, yAxisStage: Stage } {
    const { essence, stage } = this.props;

    const xHeight = Math.max(
      stage.height - (CHART_TOP_PADDING + CHART_BOTTOM_PADDING + chartStage.height) * essence.getConcreteSeries().size,
      X_AXIS_HEIGHT
    );

    return {
      xAxisStage: new Stage({ x: chartStage.x, y: 0, height: xHeight, width: chartStage.width }),
      yAxisStage: new Stage({ x: 0, y: chartStage.y, height: chartStage.height, width: Y_AXIS_WIDTH + VIS_H_PADDING })
    };
  }

  getScrollerLayout(chartStage: Stage, xAxisStage: Stage, yAxisStage: Stage): ScrollerLayout {
    const { essence } = this.props;
    const measures = essence.getConcreteSeries().toArray();

    const oneChartHeight = this.getOuterChartHeight(chartStage);

    return {
      // Inner dimensions
      bodyWidth: chartStage.width,
      bodyHeight: oneChartHeight * measures.length - CHART_BOTTOM_PADDING,

      // Gutters
      top: 0,
      right: yAxisStage.width,
      bottom: xAxisStage.height,
      left: 0
    };
  }

  getBubbleTopOffset(y: number, chartIndex: number, chartStage: Stage): number {
    const { scrollTop, scrollerYPosition } = this.state;
    const oneChartHeight = this.getOuterChartHeight(chartStage);
    const chartsAboveMe = oneChartHeight * chartIndex;

    return chartsAboveMe - scrollTop + scrollerYPosition + y - HOVER_BUBBLE_V_OFFSET + CHART_TOP_PADDING;
  }

  getBubbleLeftOffset(x: number): number {
    const { scrollLeft, scrollerXPosition } = this.state;

    return scrollerXPosition + x - scrollLeft;
  }

  canShowBubble(leftOffset: number, topOffset: number): boolean {
    const { stage } = this.props;
    const { scrollerYPosition, scrollerXPosition } = this.state;

    if (topOffset <= 0) return false;
    if (topOffset > scrollerYPosition + stage.height - X_AXIS_HEIGHT) return false;
    if (leftOffset <= 0) return false;
    if (leftOffset > scrollerXPosition + stage.width - Y_AXIS_WIDTH) return false;

    return true;
  }

  renderSelectionBubble(hoverInfo: BubbleInfo): JSX.Element {
    const { dropHighlight, acceptHighlight } = this.props;
    const { series, path, chartIndex, segmentLabel, coordinates } = hoverInfo;
    const chartStage = this.getSingleChartStage();
    const leftOffset = this.getBubbleLeftOffset(coordinates.middleX);
    const topOffset = this.getBubbleTopOffset(coordinates.y, chartIndex, chartStage);
    if (!this.canShowBubble(leftOffset, topOffset)) return null;

    const segmentValue = series.formatValue(path[path.length - 1]);
    return <HighlightModal
      left={leftOffset}
      top={topOffset}
      dropHighlight={dropHighlight}
      acceptHighlight={acceptHighlight}
      title={segmentLabel}>
      {segmentValue}
    </HighlightModal>;
  }

  renderHoverBubble(hoverInfo: BubbleInfo): JSX.Element {
    const chartStage = this.getSingleChartStage();
    const { series, path, chartIndex, segmentLabel, coordinates } = hoverInfo;

    const leftOffset = this.getBubbleLeftOffset(coordinates.middleX);
    const topOffset = this.getBubbleTopOffset(coordinates.y, chartIndex, chartStage);

    if (!this.canShowBubble(leftOffset, topOffset)) return null;

    const measureContent = this.renderMeasureLabel(path[path.length - 1], series);
    return <SegmentBubble
      top={topOffset}
      left={leftOffset}
      title={segmentLabel}
      content={measureContent}
    />;
  }

  private renderMeasureLabel(datum: Datum, series: ConcreteSeries): JSX.Element | string {
    if (!this.props.essence.hasComparison()) {
      return series.formatValue(datum);
    }
    const currentValue = series.selectValue(datum);
    const previousValue = series.selectValue(datum, SeriesDerivation.PREVIOUS);
    const formatter = series.formatter();
    return <MeasureBubbleContent
      lowerIsBetter={series.measure.lowerIsBetter}
      formatter={formatter}
      current={currentValue}
      previous={previousValue}
    />;
  }

  isSelected(path: Datum[], series: Series): boolean {
    const { essence, highlight } = this.props;
    const { splits } = essence;
    return hasHighlightOn(highlight, series.key()) && highlight.clauses.equals(getFilterFromDatum(splits, path));
  }

  isFaded(): boolean {
    return this.props.highlight !== null;
  }

  hasAnySelectionGoingOn(): boolean {
    return this.props.highlight !== null;
  }

  isHovered(path: Datum[], series: ConcreteSeries): boolean {
    const { essence } = this.props;
    const { hoverInfo } = this.state;
    const { splits } = essence;

    if (this.hasAnySelectionGoingOn()) return false;
    if (!hoverInfo) return false;
    if (!hoverInfo.series.equals(series)) return false;

    const filter = (path: Datum[]) => getFilterFromDatum(splits, path);

    return filter(hoverInfo.path).equals(filter(path));
  }

  renderBars(
    data: Datum[],
    series: ConcreteSeries,
    chartIndex: number,
    chartStage: Stage,
    xAxisStage: Stage,
    coordinates: BarCoordinates[],
    splitIndex = 0,
    path: Datum[] = []
  ): { bars: JSX.Element[], highlight: JSX.Element } {
    const { essence } = this.props;
    const { timezone } = essence;
    const { customization: { visualizationColors } } = this.context;

    const bars: JSX.Element[] = [];
    let highlight: JSX.Element;

    const dimension = findDimensionByName(essence.dataCube.dimensions, essence.splits.splits.get(splitIndex).reference);
    const splitLength = essence.splits.length();

    data.forEach((d, i) => {
      const segmentValue = d[dimension.name];
      const segmentValueStr = formatValue(segmentValue, timezone);
      const subPath = path.concat(d);

      let bar: any;
      let bubble: JSX.Element = null;
      const subCoordinates = coordinates[i];
      const { x, y, height, barWidth, barOffset } = coordinates[i];

      if (splitIndex < splitLength - 1) {
        const subData: Datum[] = (d[SPLIT] as Dataset).data;
        const subRender = this.renderBars(subData, series, chartIndex, chartStage, xAxisStage, subCoordinates.children, splitIndex + 1, subPath);

        bar = subRender.bars;
        if (!highlight && subRender.highlight) highlight = subRender.highlight;

      } else {

        const bubbleInfo: BubbleInfo = {
          series,
          chartIndex,
          path: subPath,
          coordinates: subCoordinates,
          segmentLabel: segmentValueStr,
          splitIndex
        };

        const isHovered = this.isHovered(subPath, series);
        if (isHovered) {
          bubble = this.renderHoverBubble(bubbleInfo);
        }

        const selected = this.isSelected(subPath, series.definition);
        const faded = this.isFaded();
        if (selected) {
          bubble = this.renderSelectionBubble(bubbleInfo);
          if (bubble) highlight = this.renderSelectionHighlight(chartStage, subCoordinates, chartIndex);
        }

        bar = <g
          className={classNames("bar", { "selected": selected, "not-selected": (!selected && faded), isHovered })}
          key={String(segmentValue)}
          transform={`translate(${roundToPx(x)}, 0)`}
        >
          <rect
            className="background"
            width={roundToPx(barWidth)}
            height={roundToPx(Math.abs(height))}
            fill={visualizationColors.main}
            x={barOffset}
            y={roundToPx(y)}
          />
          {bubble}
        </g>;

      }

      bars.push(bar);
    });

    return { bars, highlight };
  }

  renderSelectionHighlight(chartStage: Stage, coordinates: BarCoordinates, chartIndex: number): JSX.Element {
    const { scrollLeft, scrollTop } = this.state;
    const chartHeight = this.getOuterChartHeight(chartStage);
    const { barWidth, height, barOffset, y, x } = coordinates;

    const leftOffset = roundToPx(x) + barOffset - SELECTION_PAD + chartStage.x - scrollLeft;
    const topOffset = roundToPx(y) - SELECTION_PAD + chartStage.y - scrollTop + chartHeight * chartIndex;

    const style: React.CSSProperties = {
      left: leftOffset,
      top: topOffset,
      width: roundToPx(barWidth + SELECTION_PAD * 2),
      height: roundToPx(Math.abs(height) + SELECTION_PAD * 2)
    };

    return <div className="selection-highlight" style={style}/>;
  }

  renderXAxis(data: Datum[], coordinates: BarCoordinates[], xAxisStage: Stage): JSX.Element {
    const { essence } = this.props;
    const xScale = this.getPrimaryXScale();
    const xTicks = xScale.domain();

    const split = essence.splits.splits.first();
    const dimension = findDimensionByName(essence.dataCube.dimensions, split.reference);

    const labels: JSX.Element[] = [];
    if (canBucketByDefault(dimension)) {
      const lastIndex = data.length - 1;
      const ascending = split.sort.direction === SortDirection.ascending;
      const leftThing = ascending ? "start" : "end";
      const rightThing = ascending ? "end" : "start";
      data.forEach((d, i) => {
        const segmentValue = d[dimension.name];
        let segmentValueStr = String(Range.isRange(segmentValue) ? (segmentValue as any)[leftThing] : "");
        const coordinate = coordinates[i];

        labels.push(<div
          className="slanty-label continuous"
          key={i}
          style={{ right: xAxisStage.width - coordinate.x }}
        >{segmentValueStr}</div>);

        if (i === lastIndex) {
          segmentValueStr = String(Range.isRange(segmentValue) ? (segmentValue as any)[rightThing] : "");
          labels.push(<div
            className="slanty-label continuous"
            key="last-one"
            style={{ right: xAxisStage.width - (coordinate.x + coordinate.stepWidth) }}
          >{segmentValueStr}</div>);
        }
      });
    } else {
      data.forEach((d, i) => {
        const segmentValueStr = String(d[dimension.name]);
        const coordinate = coordinates[i];

        labels.push(<div
          className="slanty-label categorical"
          key={segmentValueStr}
          style={{ right: xAxisStage.width - (coordinate.x + coordinate.stepWidth / 2) }}
        >{segmentValueStr}</div>);
      });
    }

    return <div className="x-axis" style={{ width: xAxisStage.width }}>
      <svg style={xAxisStage.getWidthHeight()} viewBox={xAxisStage.getViewBox()}>
        <BucketMarks stage={xAxisStage} ticks={xTicks} scale={xScale}/>
      </svg>
      {labels}
    </div>;
  }

  getYAxisStuff(dataset: Dataset, series: ConcreteSeries, chartStage: Stage, chartIndex: number): {
    yGridLines: JSX.Element, yAxis: JSX.Element, yScale: d3.ScaleLinear<number, number>
  } {
    const { yAxisStage } = this.getAxisStages(chartStage);

    const yScale = this.getYScale(series, yAxisStage);
    const yTicks = yScale.ticks(5);

    const yGridLines: JSX.Element = <GridLines
      orientation="horizontal"
      scale={yScale}
      ticks={yTicks}
      stage={chartStage}
    />;

    const axisStage = yAxisStage.changeY(yAxisStage.y + (chartStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING) * chartIndex);

    const yAxis: JSX.Element = <VerticalAxis
      formatter={series.formatter()}
      key={series.reactKey()}
      stage={axisStage}
      ticks={yTicks}
      tickSize={5}
      scale={yScale}
      hideZero={true}
    />;

    return { yGridLines, yAxis, yScale };
  }

  isChartVisible(chartIndex: number, xAxisStage: Stage): boolean {
    const { stage } = this.props;
    const { scrollTop } = this.state;

    const chartStage = this.getSingleChartStage();
    const chartHeight = this.getOuterChartHeight(chartStage);

    const topY = chartIndex * chartHeight;
    const viewPortHeight = stage.height - xAxisStage.height;
    const hiddenAtBottom = topY - scrollTop >= viewPortHeight;

    const bottomY = topY + chartHeight;
    const hiddenAtTop = bottomY < scrollTop;

    return !hiddenAtTop && !hiddenAtBottom;
  }

  renderChart(
    dataset: Dataset,
    coordinates: BarCoordinates[],
    series: ConcreteSeries,
    chartIndex: number,
    chartStage: Stage
  ): { yAxis: JSX.Element, chart: JSX.Element, highlight: JSX.Element } {
    const { essence } = this.props;
    const mySplitDataset = dataset.data[0][SPLIT] as Dataset;

    const measureLabel = <VisMeasureLabel
      series={series}
      datum={dataset.data[0]}
      showPrevious={essence.hasComparison()}/>;

    // Invalid data, early return
    if (!this.hasValidYExtent(series, mySplitDataset.data)) {
      return {
        chart: <div className="measure-bar-chart" key={series.reactKey()} style={{ width: chartStage.width }}>
          <svg style={chartStage.getWidthHeight(0, CHART_BOTTOM_PADDING)}
               viewBox={chartStage.getViewBox(0, CHART_BOTTOM_PADDING)}/>
          {measureLabel}
        </div>,
        yAxis: null,
        highlight: null
      };
    }

    const { xAxisStage } = this.getAxisStages(chartStage);

    const { yAxis, yGridLines } = this.getYAxisStuff(mySplitDataset, series, chartStage, chartIndex);

    let bars: JSX.Element[];
    let highlight: JSX.Element;
    if (this.isChartVisible(chartIndex, xAxisStage)) {
      const renderedChart = this.renderBars(mySplitDataset.data, series, chartIndex, chartStage, xAxisStage, coordinates);
      bars = renderedChart.bars;
      highlight = renderedChart.highlight;
    }

    const chart = <div className="measure-bar-chart" key={series.reactKey()} style={{ width: chartStage.width }}>
      <svg style={chartStage.getWidthHeight(0, CHART_BOTTOM_PADDING)}
           viewBox={chartStage.getViewBox(0, CHART_BOTTOM_PADDING)}>
        {yGridLines}
        <g className="bars" transform={chartStage.getTransform()}>{bars}</g>
      </svg>
      {measureLabel}
    </div>;

    return { chart, yAxis, highlight };
  }

  private initState(): BarChartState {
    const { essence, data } = this.props;
    const { splits } = essence;
    this.coordinatesCache = [];
    if (!splits.length()) return {} as BarChartState;
    const split = splits.splits.first();
    const dimension = findDimensionByName(essence.dataCube.dimensions, split.reference);
    const dimensionKind = dimension.kind;
    const series = essence.getConcreteSeries().toArray();
    // TODO: very suspicious
    const paddedDataset = dimensionKind === "number" ? padDataset(data, dimension, series.map(s => s.measure)) : data;
    const firstSplitDataSet = paddedDataset.data[0][SPLIT] as Dataset;
    const flattened = firstSplitDataSet.flatten({
      order: "preorder",
      nestingName: "__nest"
    });

    const maxNumberOfLeaves = splits.splits.map(() => 0).toArray(); // initializing maxima to 0
    this.maxNumberOfLeaves(firstSplitDataSet.data, maxNumberOfLeaves, 0);
    const flatData = flattened.data;
    return {
      hoverInfo: null,
      maxNumberOfLeaves,
      flatData,
      scrollTop: 0,
      scrollLeft: 0
    };
  }

  maxNumberOfLeaves(data: Datum[], maxima: number[], level: number) {
    maxima[level] = Math.max(maxima[level], data.length);

    if (data[0] && data[0][SPLIT] !== undefined) {
      const n = data.length;
      for (let i = 0; i < n; i++) {
        this.maxNumberOfLeaves((data[i][SPLIT] as Dataset).data, maxima, level + 1);
      }
    }
  }

  getPrimaryXScale(): d3.ScaleBand<string> {
    const { data } = this.props;
    const { maxNumberOfLeaves } = this.state;
    const dataset = (data.data[0][SPLIT] as Dataset).data;

    const { essence } = this.props;
    const { splits, dataCube } = essence;
    const firstSplit = splits.splits.first();
    const dimension = findDimensionByName(dataCube.dimensions, firstSplit.reference);

    const getX = (d: Datum) => d[dimension.name] as string;

    const { usedWidth, padLeft } = this.getXValues(maxNumberOfLeaves);

    return d3.scaleBand()
      .domain(dataset.map(getX))
      .range([padLeft, padLeft + usedWidth]);
  }

  getBarDimensions(xRangeBand: number): { stepWidth: number, barWidth: number, barOffset: number } {
    if (isNaN(xRangeBand)) xRangeBand = 0;
    const stepWidth = xRangeBand;
    const barWidth = Math.max(stepWidth * BAR_PROPORTION, 0);
    const barOffset = (stepWidth - barWidth) / 2;

    return { stepWidth, barWidth, barOffset };
  }

  getXValues(maxNumberOfLeaves: number[]): { padLeft: number, usedWidth: number } {
    const { essence, stage } = this.props;
    const overallWidth = stage.width - VIS_H_PADDING * 2 - Y_AXIS_WIDTH;

    const numPrimarySteps = maxNumberOfLeaves[0];
    const minStepWidth = MIN_STEP_WIDTH * maxNumberOfLeaves.slice(1).reduce(((a, b) => a * b), 1);

    const maxAvailableWidth = overallWidth - BARS_MIN_PAD_LEFT - BARS_MIN_PAD_RIGHT;

    let stepWidth: number;
    if (minStepWidth * numPrimarySteps < maxAvailableWidth) {
      stepWidth = Math.max(Math.min(maxAvailableWidth / numPrimarySteps, MAX_STEP_WIDTH * essence.splits.length()), MIN_STEP_WIDTH);
    } else {
      stepWidth = minStepWidth;
    }

    const usedWidth = stepWidth * maxNumberOfLeaves[0];
    const padLeft = Math.max(BARS_MIN_PAD_LEFT, (overallWidth - usedWidth) / 2);

    return { padLeft, usedWidth };
  }

  getBarsCoordinates(chartIndex: number, xScale: d3.ScaleBand<string>): BarCoordinates[] {
    if (!!this.coordinatesCache[chartIndex]) {
      return this.coordinatesCache[chartIndex];
    }

    const { data } = this.props;
    const dataset = data.data[0][SPLIT] as Dataset;

    const { essence } = this.props;
    const { splits, dataCube } = essence;

    const series = essence.getConcreteSeries().get(chartIndex);
    const firstSplit = splits.splits.first();
    const dimension = findDimensionByName(dataCube.dimensions, firstSplit.reference);

    const chartStage = this.getSingleChartStage();
    const yScale = this.getYScale(series, this.getAxisStages(chartStage).yAxisStage);

    this.coordinatesCache[chartIndex] = this.getSubCoordinates(
      dataset.data,
      series,
      chartStage,
      (d: Datum) => d[dimension.name] as string,
      xScale,
      yScale
    );

    return this.coordinatesCache[chartIndex];
  }

  getSubCoordinates(
    data: Datum[],
    series: ConcreteSeries,
    chartStage: Stage,
    getX: (d: Datum, i: number) => string,
    xScale: d3.ScaleBand<string>,
    scaleY: d3.ScaleLinear<number, number>,
    splitIndex = 1
  ): BarCoordinates[] {
    const { essence } = this.props;
    const { maxNumberOfLeaves } = this.state;

    const { stepWidth, barWidth, barOffset } = this.getBarDimensions(xScale.bandwidth());

    const coordinates: BarCoordinates[] = data.map((d, i) => {
      const x = xScale(getX(d, i));
      const y = scaleY(series.selectValue(d));
      const h = scaleY(0) - y;
      const children: BarCoordinates[] = [];
      const coordinate = new BarCoordinates({
        x,
        y: h >= 0 ? y : scaleY(0),
        width: roundToPx(barWidth),
        height: roundToPx(Math.abs(h)),
        stepWidth,
        barWidth,
        barOffset,
        children
      });

      if (splitIndex < essence.splits.length()) {
        const subStage: Stage = new Stage({ x, y: chartStage.y, width: barWidth, height: chartStage.height });
        const subGetX: any = (d: Datum, i: number) => String(i);
        const subData: Datum[] = (d[SPLIT] as Dataset).data;
        const subxScale = d3.scaleBand()
          .domain(d3.range(0, maxNumberOfLeaves[splitIndex]).map(String))
          .range([x + barOffset, x + subStage.width]);

        coordinate.children = this.getSubCoordinates(subData, series, subStage, subGetX, subxScale, scaleY, splitIndex + 1);
      }

      return coordinate;
    });

    return coordinates;
  }

  renderRightGutter(seriesCount: number, yAxisStage: Stage, yAxes: JSX.Element[]): JSX.Element {
    const yAxesStage = yAxisStage.changeHeight((yAxisStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING) * seriesCount);

    return <svg style={yAxesStage.getWidthHeight()} viewBox={yAxesStage.getViewBox()}>
      {yAxes}
    </svg>;
  }

  renderSelectionContainer(selectionHighlight: JSX.Element, chartIndex: number, chartStage: Stage): JSX.Element {
    return <div className="selection-highlight-container">
      {selectionHighlight}
    </div>;
  }

  render() {
    const { data, essence, stage } = this.props;
    const { splits } = essence;

    let scrollerLayout: ScrollerLayout;
    const measureCharts: JSX.Element[] = [];
    let xAxis: JSX.Element;
    let rightGutter: JSX.Element;
    let overlay: JSX.Element;

    if (splits.length()) {
      const xScale = this.getPrimaryXScale();
      const yAxes: JSX.Element[] = [];
      const series = essence.getConcreteSeries();

      const chartStage = this.getSingleChartStage();
      const { xAxisStage, yAxisStage } = this.getAxisStages(chartStage);
      xAxis = this.renderXAxis((data.data[0][SPLIT] as Dataset).data, this.getBarsCoordinates(0, xScale), xAxisStage);

      series.forEach((series, chartIndex) => {
        const coordinates = this.getBarsCoordinates(chartIndex, xScale);
        const { yAxis, chart, highlight } = this.renderChart(data, coordinates, series, chartIndex, chartStage);

        measureCharts.push(chart);
        yAxes.push(yAxis);
        if (highlight) {
          overlay = this.renderSelectionContainer(highlight, chartIndex, chartStage);
        }
      });

      scrollerLayout = this.getScrollerLayout(chartStage, xAxisStage, yAxisStage);
      rightGutter = this.renderRightGutter(series.count(), chartStage, yAxes);
    }

    return <div className="measure-bar-charts" style={{ height: stage.height }}>
      <Scroller
        layout={scrollerLayout}
        ref={this.scroller}

        bottomGutter={xAxis}
        rightGutter={rightGutter}

        body={measureCharts}
        overlay={overlay}

        onClick={this.onClick}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.onMouseLeave}
        onScroll={this.onScrollerScroll}
      />
    </div>;
  }
}
