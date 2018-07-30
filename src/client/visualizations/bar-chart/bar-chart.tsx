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

import * as d3 from "d3";
import { List } from "immutable";
import { Dataset, Datum, NumberRange, PlywoodRange, PseudoDatum, r, Range, Set, SortExpression, TimeRange } from "plywood";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BAR_CHART_MANIFEST } from "../../../common/manifests/bar-chart/bar-chart";
import { DataCube, DatasetLoad, Dimension, Filter, FilterClause, Measure, MeasureDerivation, Splits, Stage, VisualizationProps } from "../../../common/models/index";
import { formatValue } from "../../../common/utils/formatter/formatter";
import { DisplayYear } from "../../../common/utils/time/time";
import { BucketMarks, GridLines, MeasureBubbleContent, Scroller, ScrollerLayout, SegmentActionButtons, SegmentBubble, VerticalAxis, VisMeasureLabel } from "../../components/index";
import { SPLIT, VIS_H_PADDING } from "../../config/constants";
import { classNames, roundToPx } from "../../utils/dom/dom";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./bar-chart.scss";
import { BarCoordinates } from "./bar-coordinates";

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

export interface BubbleInfo {
  measure: Measure;
  chartIndex: number;
  path: Datum[];
  coordinates: BarCoordinates;
  splitIndex?: number;
  segmentLabel?: string;
}

export interface BarChartState extends BaseVisualizationState {
  hoverInfo?: BubbleInfo;
  selectionInfo?: BubbleInfo;
  scrollerYPosition?: number;
  scrollerXPosition?: number;

  // Precalculated stuff
  flatData?: PseudoDatum[];
  maxNumberOfLeaves?: number[];
}

function getFilterFromDatum(splits: Splits, dataPath: Datum[], dataCube: DataCube): Filter {
  return new Filter(List(dataPath.map((datum, i) => {
    const split = splits.get(i);
    const segment: any = datum[split.getDimension(dataCube.dimensions).name];

    return new FilterClause({
      expression: split.expression,
      selection: r(TimeRange.isTimeRange(segment) ? segment : Set.fromJS([segment]))
    });
  })));
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
    let segmentValue = d[dimensionName];
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

function padDatasetLoad(datasetLoad: DatasetLoad, dimension: Dimension, measures: Measure[]): DatasetLoad {
  const originalDataset = datasetLoad.dataset;
  const newDataset = originalDataset ? padDataset(originalDataset, dimension, measures) : null;
  datasetLoad.dataset = newDataset;
  return datasetLoad;
}

export class BarChart extends BaseVisualization<BarChartState> {
  public static id = BAR_CHART_MANIFEST.name;

  private coordinatesCache: BarCoordinates[][] = [];

  getDefaultState(): BarChartState {
    const s = super.getDefaultState() as BarChartState;

    s.hoverInfo = null;

    return s;
  }

  shouldFetchData(nextProps: VisualizationProps): boolean {
    const { essence, timekeeper } = this.props;
    const nextEssence = nextProps.essence;
    const nextTimekeeper = nextProps.timekeeper;
    return nextEssence.differentDataCube(essence) ||
      nextEssence.differentEffectiveFilter(essence, timekeeper, nextTimekeeper, BarChart.id) ||
      nextEssence.differentTimeShift(essence) ||
      nextEssence.differentEffectiveSplits(essence) ||
      nextEssence.newEffectiveMeasures(essence) ||
      nextEssence.dataCube.refreshRule.isRealtime();
  }

  componentDidUpdate() {
    const { scrollerYPosition, scrollerXPosition } = this.state;

    let node = ReactDOM.findDOMNode(this.refs["scroller"]);
    if (!node) return;

    const rect = node.getBoundingClientRect();

    if (scrollerYPosition !== rect.top || scrollerXPosition !== rect.left) {
      this.setState({ scrollerYPosition: rect.top, scrollerXPosition: rect.left });
    }
  }

  calculateMousePosition(x: number, y: number): BubbleInfo {
    const { essence } = this.props;

    const measures = essence.getEffectiveMeasures().toArray();
    const chartStage = this.getSingleChartStage();
    const chartHeight = this.getOuterChartHeight(chartStage);

    if (y >= chartHeight * measures.length) return null; // on x axis
    if (x >= chartStage.width) return null; // on y axis

    const xScale = this.getPrimaryXScale();
    const chartIndex = Math.floor(y / chartHeight);

    const chartCoordinates = this.getBarsCoordinates(chartIndex, xScale);

    const { path, coordinates } = this.findBarCoordinatesForX(x, chartCoordinates, []);

    return {
      path: this.findPathForIndices(path),
      measure: measures[chartIndex],
      chartIndex,
      coordinates
    };
  }

  findPathForIndices(indices: number[]): Datum[] {
    const { datasetLoad } = this.state;
    const mySplitDataset = datasetLoad.dataset.data[0][SPLIT] as Dataset;

    const path: Datum[] = [];
    let currentData: Dataset = mySplitDataset;
    indices.forEach(i => {
      let datum = currentData.data[i];
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

  onScrollerScroll(scrollTop: number, scrollLeft: number) {
    this.setState({
      hoverInfo: null,
      scrollLeft,
      scrollTop
    });
  }

  onMouseMove(x: number, y: number) {
    this.setState({ hoverInfo: this.calculateMousePosition(x, y) });
  }

  onMouseLeave() {
    this.setState({ hoverInfo: null });
  }

  onClick(x: number, y: number) {
    const { essence, clicker } = this.props;

    if (!clicker.changeHighlight || !clicker.dropHighlight) return;

    const selectionInfo = this.calculateMousePosition(x, y);

    if (!selectionInfo) return;

    if (!selectionInfo.coordinates) {
      clicker.dropHighlight();
      this.setState({ selectionInfo: null });
      return;
    }

    const { path, chartIndex } = selectionInfo;

    const { splits, dataCube } = essence;
    const measures = essence.getEffectiveMeasures().toArray();

    const rowHighlight = getFilterFromDatum(splits, path, dataCube);

    if (essence.highlightOn(BarChart.id, measures[chartIndex].name)) {
      if (rowHighlight.equals(essence.highlight.delta)) {
        clicker.dropHighlight();
        this.setState({ selectionInfo: null });
        return;
      }
    }

    this.setState({ selectionInfo });
    clicker.changeHighlight(BarChart.id, measures[chartIndex].name, rowHighlight);
  }

  getYExtent(data: Datum[], measure: Measure): number[] {
    const measureName = measure.name;
    const getY = (d: Datum) => d[measureName] as number;
    return d3.extent(data, getY);
  }

  getYScale(measure: Measure, yAxisStage: Stage): d3.scale.Linear<number, number> {
    const { essence } = this.props;
    const { flatData } = this.state;

    const splitLength = essence.splits.length();
    const leafData = flatData.filter((d: Datum) => d["__nest"] === splitLength - 1);

    const extentY = this.getYExtent(leafData, measure);

    return d3.scale.linear()
      .domain([Math.min(extentY[0] * 1.1, 0), Math.max(extentY[1] * 1.1, 0)])
      .range([yAxisStage.height, yAxisStage.y]);
  }

  hasValidYExtent(measure: Measure, data: Datum[]): boolean {
    let [yMin, yMax] = this.getYExtent(data, measure);
    return !isNaN(yMin) && !isNaN(yMax);
  }

  getSingleChartStage(): Stage {
    const xScale = this.getPrimaryXScale();
    const { essence, stage, isThumbnail } = this.props;

    const { stepWidth } = this.getBarDimensions(xScale.rangeBand());
    const xTicks = xScale.domain();
    const width = xTicks.length > 0 ? roundToPx(xScale(xTicks[xTicks.length - 1])) + stepWidth : 0;

    const measures = essence.getEffectiveMeasures();
    const availableHeight = stage.height - X_AXIS_HEIGHT;
    const minHeight = isThumbnail ? 1 : MIN_CHART_HEIGHT;
    const height = Math.max(minHeight, Math.floor(availableHeight / measures.size));

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
      stage.height - (CHART_TOP_PADDING + CHART_BOTTOM_PADDING + chartStage.height) * essence.getEffectiveMeasures().size,
      X_AXIS_HEIGHT
    );

    return {
      xAxisStage: new Stage({ x: chartStage.x, y: 0, height: xHeight, width: chartStage.width }),
      yAxisStage: new Stage({ x: 0, y: chartStage.y, height: chartStage.height, width: Y_AXIS_WIDTH + VIS_H_PADDING })
    };
  }

  getScrollerLayout(chartStage: Stage, xAxisStage: Stage, yAxisStage: Stage): ScrollerLayout {
    const { essence } = this.props;
    const measures = essence.getEffectiveMeasures().toArray();

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
    const { stage } = this.props;
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
    const { essence, stage, clicker, openRawDataModal } = this.props;
    const { measure, path, chartIndex, segmentLabel, coordinates } = hoverInfo;
    const chartStage = this.getSingleChartStage();

    const { splits, dataCube } = essence;
    const dimension = splits.get(hoverInfo.splitIndex).getDimension(dataCube.dimensions);

    const leftOffset = this.getBubbleLeftOffset(coordinates.middleX);
    const topOffset = this.getBubbleTopOffset(coordinates.y, chartIndex, chartStage);

    if (!this.canShowBubble(leftOffset, topOffset)) return null;

    return <SegmentBubble
      left={leftOffset}
      top={topOffset}
      title={segmentLabel}
      content={measure.formatDatum(path[path.length - 1])}
      actions={<SegmentActionButtons
        dimension={dimension}
        clicker={clicker}
        openRawDataModal={openRawDataModal}
        onClose={this.onBubbleClose.bind(this)}
      />}
    />;
  }

  onBubbleClose() {
    this.setState({ selectionInfo: null });
  }

  renderHoverBubble(hoverInfo: BubbleInfo): JSX.Element {
    const chartStage = this.getSingleChartStage();
    const { measure, path, chartIndex, segmentLabel, coordinates } = hoverInfo;

    const leftOffset = this.getBubbleLeftOffset(coordinates.middleX);
    const topOffset = this.getBubbleTopOffset(coordinates.y, chartIndex, chartStage);

    if (!this.canShowBubble(leftOffset, topOffset)) return null;

    const measureContent = this.renderMeasureLabel(measure, path[path.length - 1]);
    return <SegmentBubble
      top={topOffset}
      left={leftOffset}
      title={segmentLabel}
      content={measureContent}
    />;
  }

  private renderMeasureLabel(measure: Measure, datum: Datum): JSX.Element | string {
    const currentValue = datum[measure.name] as number;
    if (!this.props.essence.hasComparison()) {
      return measure.formatFn(currentValue);
    }
    const previousValue = datum[measure.getDerivedName(MeasureDerivation.PREVIOUS)] as number;
    return <MeasureBubbleContent
      formatter={measure.formatFn}
      current={currentValue}
      previous={previousValue}
    />;
  }

  isSelected(path: Datum[], measure: Measure): boolean {
    const { essence } = this.props;
    const { splits, dataCube } = essence;

    if (essence.highlightOnDifferentMeasure(BarChart.id, measure.name)) return false;

    if (essence.highlightOn(BarChart.id, measure.name)) {
      return essence.highlight.delta.equals(getFilterFromDatum(splits, path, dataCube));
    }

    return false;
  }

  isFaded(): boolean {
    const { essence } = this.props;
    return essence.highlightOn(BarChart.id);
  }

  hasAnySelectionGoingOn(): boolean {
    return this.props.essence.highlightOn(BarChart.id);
  }

  isHovered(path: Datum[], measure: Measure): boolean {
    const { essence } = this.props;
    const { hoverInfo } = this.state;
    const { splits, dataCube } = essence;

    if (this.hasAnySelectionGoingOn()) return false;
    if (!hoverInfo) return false;
    if (hoverInfo.measure !== measure) return false;

    const filter = (p: Datum[]) => getFilterFromDatum(splits, p, dataCube);

    return filter(hoverInfo.path).equals(filter(path));
  }

  renderBars(
    data: Datum[],
    measure: Measure,
    chartIndex: number,
    chartStage: Stage,
    xAxisStage: Stage,
    coordinates: BarCoordinates[],
    splitIndex = 0,
    path: Datum[] = []
  ): { bars: JSX.Element[], highlight: JSX.Element } {
    const { essence } = this.props;
    const { timezone } = essence;

    let bars: JSX.Element[] = [];
    let highlight: JSX.Element;

    const dimension = essence.splits.get(splitIndex).getDimension(essence.dataCube.dimensions);
    const splitLength = essence.splits.length();

    data.forEach((d, i) => {
      let segmentValue = d[dimension.name];
      let segmentValueStr = formatValue(segmentValue, timezone, DisplayYear.NEVER);
      let subPath = path.concat(d);

      let bar: any;
      let bubble: JSX.Element = null;
      let subCoordinates = coordinates[i];
      let { x, y, height, barWidth, barOffset } = coordinates[i];

      if (splitIndex < splitLength - 1) {
        let subData: Datum[] = (d[SPLIT] as Dataset).data;
        let subRender = this.renderBars(subData, measure, chartIndex, chartStage, xAxisStage, subCoordinates.children, splitIndex + 1, subPath);

        bar = subRender.bars;
        if (!highlight && subRender.highlight) highlight = subRender.highlight;

      } else {

        let bubbleInfo: BubbleInfo = {
          measure,
          chartIndex,
          path: subPath,
          coordinates: subCoordinates,
          segmentLabel: segmentValueStr,
          splitIndex
        };

        let isHovered = this.isHovered(subPath, measure);
        if (isHovered) {
          bubble = this.renderHoverBubble(bubbleInfo);
        }

        let selected = this.isSelected(subPath, measure);
        let faded = this.isFaded();
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

    const split = essence.splits.get(0);
    const dimension = split.getDimension(essence.dataCube.dimensions);

    const labels: JSX.Element[] = [];
    if (dimension.canBucketByDefault()) {
      const lastIndex = data.length - 1;
      const ascending = split.sortAction.direction === SortExpression.ASCENDING;
      const leftThing = ascending ? "start" : "end";
      const rightThing = ascending ? "end" : "start";
      data.forEach((d, i) => {
        let segmentValue = d[dimension.name];
        let segmentValueStr = String(Range.isRange(segmentValue) ? (segmentValue as any)[leftThing] : "");
        let coordinate = coordinates[i];

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
        let segmentValueStr = String(d[dimension.name]);
        let coordinate = coordinates[i];

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

  getYAxisStuff(dataset: Dataset, measure: Measure, chartStage: Stage, chartIndex: number): {
    yGridLines: JSX.Element, yAxis: JSX.Element, yScale: d3.scale.Linear<number, number>
  } {
    const { yAxisStage } = this.getAxisStages(chartStage);

    const yScale = this.getYScale(measure, yAxisStage);
    const yTicks = yScale.ticks(5);

    const yGridLines: JSX.Element = <GridLines
      orientation="horizontal"
      scale={yScale}
      ticks={yTicks}
      stage={chartStage}
    />;

    const axisStage = yAxisStage.changeY(yAxisStage.y + (chartStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING) * chartIndex);

    const yAxis: JSX.Element = <VerticalAxis
      key={measure.name}
      stage={axisStage}
      ticks={yTicks}
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
    measure: Measure,
    chartIndex: number,
    chartStage: Stage,
    getX: any
  ): { yAxis: JSX.Element, chart: JSX.Element, highlight: JSX.Element } {
    const { isThumbnail, essence } = this.props;
    const mySplitDataset = dataset.data[0][SPLIT] as Dataset;

    const measureLabel = !isThumbnail ? <VisMeasureLabel measure={measure} datum={dataset.data[0]} showPrevious={essence.hasComparison()}/> : null;

    // Invalid data, early return
    if (!this.hasValidYExtent(measure, mySplitDataset.data)) {
      return {
        chart: <div className="measure-bar-chart" key={measure.name} style={{ width: chartStage.width }}>
          <svg style={chartStage.getWidthHeight(0, CHART_BOTTOM_PADDING)} viewBox={chartStage.getViewBox(0, CHART_BOTTOM_PADDING)}/>
          {measureLabel}
        </div>,
        yAxis: null,
        highlight: null
      };
    }

    let { xAxisStage } = this.getAxisStages(chartStage);

    const { yAxis, yGridLines } = this.getYAxisStuff(mySplitDataset, measure, chartStage, chartIndex);

    let bars: JSX.Element[];
    let highlight: JSX.Element;
    if (this.isChartVisible(chartIndex, xAxisStage)) {
      let renderedChart = this.renderBars(mySplitDataset.data, measure, chartIndex, chartStage, xAxisStage, coordinates);
      bars = renderedChart.bars;
      highlight = renderedChart.highlight;
    }

    const chart = <div className="measure-bar-chart" key={measure.name} style={{ width: chartStage.width }}>
      <svg style={chartStage.getWidthHeight(0, CHART_BOTTOM_PADDING)} viewBox={chartStage.getViewBox(0, CHART_BOTTOM_PADDING)}>
        {yGridLines}
        <g className="bars" transform={chartStage.getTransform()}>{bars}</g>
      </svg>
      {measureLabel}
    </div>;

    return { chart, yAxis, highlight };
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence } = props;
    const { splits } = essence;
    const split = splits.get(0);

    const dimension = split.getDimension(essence.dataCube.dimensions);
    const dimensionKind = dimension.kind;
    const measures = essence.getEffectiveMeasures().toArray();

    this.coordinatesCache = [];

    const existingDatasetLoad = this.state.datasetLoad;
    const newState: BarChartState = {};

    if (datasetLoad) {
      if (dimensionKind === "number") {
        datasetLoad = padDatasetLoad(datasetLoad, dimension, measures);
      }
      // Always keep the old dataset while loading (for now)
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      const stateDatasetLoad = this.state.datasetLoad;
      if (dimensionKind === "number") {
        datasetLoad = padDatasetLoad(stateDatasetLoad, dimension, measures);
      } else {
        datasetLoad = stateDatasetLoad;
      }
    }

    const { dataset } = datasetLoad;
    if (dataset && splits.length()) {
      let firstSplitDataSet = dataset.data[0][SPLIT] as Dataset;
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);
      let flattened = firstSplitDataSet.flatten({
        order: "preorder",
        nestingName: "__nest"
      });

      const maxima = splits.toArray().map(() => 0); // initializing maxima to 0
      this.maxNumberOfLeaves(firstSplitDataSet.data, maxima, 0);

      newState.maxNumberOfLeaves = maxima;

      newState.flatData = flattened.data;
    }

    this.setState(newState);
  }

  maxNumberOfLeaves(data: Datum[], maxima: number[], level: number) {
    maxima[level] = Math.max(maxima[level], data.length);

    if (data[0] && data[0][SPLIT] !== undefined) {
      let n = data.length;
      for (let i = 0; i < n; i++) {
        this.maxNumberOfLeaves((data[i][SPLIT] as Dataset).data, maxima, level + 1);
      }
    }
  }

  getPrimaryXScale(): d3.scale.Ordinal<string, number> {
    const { datasetLoad, maxNumberOfLeaves } = this.state;
    const data = (datasetLoad.dataset.data[0][SPLIT] as Dataset).data;

    const { essence } = this.props;
    const { splits, dataCube } = essence;
    const dimension = splits.get(0).getDimension(dataCube.dimensions);

    const getX = (d: Datum) => d[dimension.name] as string;

    const { usedWidth, padLeft } = this.getXValues(maxNumberOfLeaves);

    return d3.scale.ordinal()
      .domain(data.map(getX))
      .rangeBands([padLeft, padLeft + usedWidth]);
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

  getBarsCoordinates(chartIndex: number, xScale: d3.scale.Ordinal<string, number>): BarCoordinates[] {
    if (!!this.coordinatesCache[chartIndex]) {
      return this.coordinatesCache[chartIndex];
    }

    const { essence } = this.props;
    const { datasetLoad } = this.state;
    const { splits, dataCube } = essence;

    const measure = essence.getEffectiveMeasures().toArray()[chartIndex];
    const dataset = datasetLoad.dataset.data[0][SPLIT] as Dataset;
    const dimension = splits.get(0).getDimension(dataCube.dimensions);

    const chartStage = this.getSingleChartStage();
    const { yScale } = this.getYAxisStuff(dataset, measure, chartStage, chartIndex);

    this.coordinatesCache[chartIndex] = this.getSubCoordinates(
      dataset.data,
      measure,
      chartStage,
      (d: Datum) => d[dimension.name] as string,
      xScale,
      yScale
    );

    return this.coordinatesCache[chartIndex];
  }

  getSubCoordinates(
    data: Datum[],
    measure: Measure,
    chartStage: Stage,
    getX: (d: Datum, i: number) => string,
    xScale: d3.scale.Ordinal<string, number>,
    scaleY: d3.scale.Linear<number, number>,
    splitIndex = 1
  ): BarCoordinates[] {
    const { essence } = this.props;
    const { maxNumberOfLeaves } = this.state;

    const { stepWidth, barWidth, barOffset } = this.getBarDimensions(xScale.rangeBand());

    const coordinates: BarCoordinates[] = data.map((d, i) => {
      let x = xScale(getX(d, i));
      let y = scaleY(d[measure.name] as number);
      let h = scaleY(0) - y;
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
        let subStage: Stage = new Stage({ x, y: chartStage.y, width: barWidth, height: chartStage.height });
        let subGetX: any = (d: Datum, i: number) => String(i);
        let subData: Datum[] = (d[SPLIT] as Dataset).data;
        let subxScale = d3.scale.ordinal()
          .domain(d3.range(0, maxNumberOfLeaves[splitIndex]).map(String))
          .rangeBands([x + barOffset, x + subStage.width]);

        coordinate.children = this.getSubCoordinates(subData, measure, subStage, subGetX, subxScale, scaleY, splitIndex + 1);
      }

      return coordinate;
    });

    return coordinates;
  }

  renderRightGutter(measures: Measure[], yAxisStage: Stage, yAxes: JSX.Element[]): JSX.Element {
    const yAxesStage = yAxisStage.changeHeight((yAxisStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING) * measures.length);

    return <svg style={yAxesStage.getWidthHeight()} viewBox={yAxesStage.getViewBox()}>
      {yAxes}
    </svg>;
  }

  renderSelectionContainer(selectionHighlight: JSX.Element, chartIndex: number, chartStage: Stage): JSX.Element {
    const { scrollLeft, scrollTop } = this.state;
    const chartHeight = this.getOuterChartHeight(chartStage);

    return <div className="selection-highlight-container">
      {selectionHighlight}
    </div>;
  }

  renderInternals() {
    const { essence, stage } = this.props;
    const { datasetLoad } = this.state;
    const { splits, dataCube } = essence;
    const dimension = splits.get(0).getDimension(dataCube.dimensions);

    let scrollerLayout: ScrollerLayout;
    const measureCharts: JSX.Element[] = [];
    let xAxis: JSX.Element;
    let rightGutter: JSX.Element;
    let overlay: JSX.Element;

    if (datasetLoad.dataset && splits.length()) {
      let xScale = this.getPrimaryXScale();
      let yAxes: JSX.Element[] = [];
      let highlights: JSX.Element[] = [];
      let measures = essence.getEffectiveMeasures().toArray();

      let getX = (d: Datum) => d[dimension.name] as string;

      let chartStage = this.getSingleChartStage();
      let { xAxisStage, yAxisStage } = this.getAxisStages(chartStage);
      xAxis = this.renderXAxis((datasetLoad.dataset.data[0][SPLIT] as Dataset).data, this.getBarsCoordinates(0, xScale), xAxisStage);

      measures.forEach((measure, chartIndex) => {
        let coordinates = this.getBarsCoordinates(chartIndex, xScale);
        let { yAxis, chart, highlight } = this.renderChart(datasetLoad.dataset, coordinates, measure, chartIndex, chartStage, getX);

        measureCharts.push(chart);
        yAxes.push(yAxis);
        if (highlight) {
          overlay = this.renderSelectionContainer(highlight, chartIndex, chartStage);
        }
      });

      scrollerLayout = this.getScrollerLayout(chartStage, xAxisStage, yAxisStage);
      rightGutter = this.renderRightGutter(measures, chartStage, yAxes);
    }

    return <div className="internals measure-bar-charts" style={{ maxHeight: stage.height }}>
      <Scroller
        layout={scrollerLayout}
        ref="scroller"

        bottomGutter={xAxis}
        rightGutter={rightGutter}

        body={measureCharts}
        overlay={overlay}

        onClick={this.onClick.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onScroll={this.onScrollerScroll.bind(this)}
      />
    </div>;
  }
}
