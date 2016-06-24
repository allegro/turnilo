require('./bar-chart.css');

import * as React from 'react';
import { List } from 'immutable';
import { r, Range, Dataset, Datum, PseudoDatum, SortAction, PlywoodValue, Set, TimeRange } from 'plywood';

import {
  Stage,
  DataSource,
  Filter,
  FilterClause,
  Splits,
  Measure,
  VisualizationProps,
  DatasetLoad
} from '../../../common/models/index';
import { BAR_CHART_MANIFEST } from '../../../common/manifests/bar-chart/bar-chart';

import { SPLIT, VIS_H_PADDING } from '../../config/constants';
import { roundToPx, classNames } from '../../utils/dom/dom';
import { VisMeasureLabel } from '../../components/vis-measure-label/vis-measure-label';
import { VerticalAxis } from '../../components/vertical-axis/vertical-axis';
import { BucketMarks } from '../../components/bucket-marks/bucket-marks';
import { GridLines } from '../../components/grid-lines/grid-lines';
import { SegmentBubble } from '../../components/segment-bubble/segment-bubble';
import { Scroller, ScrollerLayout } from '../../components/scroller/scroller';

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';
import { BarCoordinates } from './bar-coordinates';

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

  // Precalculated stuff
  flatData?: PseudoDatum[];
  maxNumberOfLeaves?: number[];
}

function getFilterFromDatum(splits: Splits, dataPath: Datum[], dataSource: DataSource): Filter {
  return new Filter(List(dataPath.map((datum, i) => {
    var split = splits.get(i);
    var segment: any = datum[split.getDimension(dataSource.dimensions).name];

    return new FilterClause({
      expression: split.expression,
      selection: r(TimeRange.isTimeRange(segment) ? segment : Set.fromJS([segment]))
    });
  })));
}

export class BarChart extends BaseVisualization<BarChartState> {
  public static id = BAR_CHART_MANIFEST.name;

  private coordinatesCache: BarCoordinates[][] = [];

  constructor() {
    super();
  }

  getDefaultState(): BarChartState {
    var s = super.getDefaultState() as BarChartState;

    s.hoverInfo = null;

    return s;
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    this.precalculate(nextProps);
    var { essence } = this.props;
    var nextEssence = nextProps.essence;
    if (
      nextEssence.differentDataSource(essence) ||
      nextEssence.differentEffectiveFilter(essence, BarChart.id) ||
      nextEssence.differentEffectiveSplits(essence) ||
      nextEssence.newEffectiveMeasures(essence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  calculateMousePosition(x: number, y: number): BubbleInfo {
    var { essence } = this.props;

    var measures = essence.getEffectiveMeasures().toArray();
    var chartStage = this.getSingleChartStage();
    var chartHeight = this.getOuterChartHeight(chartStage);

    if (y >= chartHeight * measures.length) return; // on x axis
    if (x >= chartStage.width) return; // on y axis


    const xScale = this.getPrimaryXScale();
    var chartIndex = Math.floor(y / chartHeight);

    var chartCoordinates = this.getBarsCoordinates(chartIndex, xScale);

    var { path, coordinates } = this.findBarCoordinatesForX(x, chartCoordinates, []);

    return {
      path: this.findPathForIndices(path),
      measure: measures[chartIndex],
      chartIndex,
      coordinates: coordinates
    };
  }

  findPathForIndices(indices: number[]): Datum[] {
    var { datasetLoad } = this.state;
    var mySplitDataset = datasetLoad.dataset.data[0][SPLIT] as Dataset;

    var path: Datum[] = [];
    var currentData: Dataset = mySplitDataset;
    indices.forEach((i) => {
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

  onSimpleScroll(scrollTop: number, scrollLeft: number) {
    this.setState({
      hoverInfo: null,
      scrollLeft,
      scrollTop
    });
  }

  onMouseMove(x: number, y: number) {
    this.setState({hoverInfo: this.calculateMousePosition(x, y)});
  }

  onMouseLeave() {
    this.setState({hoverInfo: null});
  }

  onClick(x: number, y: number) {
    const selectionInfo = this.calculateMousePosition(x, y);

    if (!selectionInfo) return;

    const { essence, clicker } = this.props;

    if (!selectionInfo.coordinates) {
      clicker.dropHighlight();
      this.setState({selectionInfo: null});
      return;
    }

    const { path, chartIndex } = selectionInfo;

    const { splits, dataSource } = essence;
    var measures = essence.getEffectiveMeasures().toArray();

    var rowHighlight = getFilterFromDatum(splits, path, dataSource);

    if (essence.highlightOn(BarChart.id, measures[chartIndex].name)) {
      if (rowHighlight.equals(essence.highlight.delta)) {
        clicker.dropHighlight();
        this.setState({selectionInfo: null});
        return;
      }
    }

    this.setState({selectionInfo});
    clicker.changeHighlight(BarChart.id, measures[chartIndex].name, rowHighlight);
  }

  getYExtent(data: Datum[], measure: Measure): number[] {
    var measureName = measure.name;
    var getY = (d: Datum) => d[measureName] as number;
    return d3.extent(data, getY);
  }

  getYScale(measure: Measure, yAxisStage: Stage): d3.scale.Linear<number, number> {
    var { essence } = this.props;
    var { flatData } = this.state;

    var splitLength = essence.splits.length();
    var leafData = flatData.filter((d: Datum) => d['__nest'] === splitLength - 1);

    var extentY = this.getYExtent(leafData, measure);

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
    const { essence, stage } = this.props;

    const { stepWidth } = this.getBarDimensions(xScale.rangeBand());
    const xTicks = xScale.domain();
    const width = xTicks.length > 0 ? roundToPx(xScale(xTicks[xTicks.length - 1])) + stepWidth : 0;

    const measures = essence.getEffectiveMeasures();
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

  getAxisStages(chartStage: Stage): {xAxisStage: Stage, yAxisStage: Stage} {
    const { essence, stage } = this.props;

    const xHeight = Math.max(
      stage.height - (CHART_TOP_PADDING + CHART_BOTTOM_PADDING + chartStage.height) * essence.getEffectiveMeasures().size,
      X_AXIS_HEIGHT
    );

    return {
      xAxisStage: new Stage({x: chartStage.x, y: 0, height: xHeight, width: chartStage.width}),
      yAxisStage: new Stage({x: 0, y: chartStage.y, height: chartStage.height, width: Y_AXIS_WIDTH + VIS_H_PADDING})
    };
  }

  getScrollerLayout(chartStage: Stage, xAxisStage: Stage, yAxisStage: Stage): ScrollerLayout {
    var { essence } = this.props;
    var measures = essence.getEffectiveMeasures().toArray();

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
    const { scrollTop } = this.state;
    const oneChartHeight = this.getOuterChartHeight(chartStage);
    const chartsAboveMe = oneChartHeight * chartIndex;

    return chartsAboveMe - scrollTop + y - HOVER_BUBBLE_V_OFFSET + CHART_TOP_PADDING;
  }

  getBubbleLeftOffset(x: number): number {
    const { stage } = this.props;
    const { scrollLeft } = this.state;

    return stage.x + VIS_H_PADDING + x - scrollLeft;
  }

  canShowBubble(leftOffset: number, topOffset: number): boolean {
    const { stage } = this.props;

    if (topOffset <= 0) return false;
    if (topOffset > stage.height - X_AXIS_HEIGHT) return false;
    if (leftOffset - stage.x <= 0) return false;
    if (leftOffset > stage.x + stage.width - Y_AXIS_WIDTH - VIS_H_PADDING) return false;

    return true;
  }

  renderSelectionBubble(hoverInfo: BubbleInfo): JSX.Element {
    const { essence, stage, clicker, openRawDataModal } = this.props;
    const { measure, path, chartIndex, segmentLabel, coordinates } = hoverInfo;
    const chartStage = this.getSingleChartStage();

    const { splits, dataSource } = essence;
    const dimension = splits.get(hoverInfo.splitIndex).getDimension(dataSource.dimensions);

    const leftOffset = this.getBubbleLeftOffset(coordinates.middleX);
    const topOffset = this.getBubbleTopOffset(coordinates.y, chartIndex, chartStage);

    if (!this.canShowBubble(leftOffset, topOffset)) return null;

    return <SegmentBubble
      left={leftOffset}
      top={stage.y + topOffset}
      dimension={dimension}
      segmentLabel={segmentLabel}
      measureLabel={measure.formatDatum(path[path.length - 1])}
      clicker={clicker}
      openRawDataModal={openRawDataModal}
      onClose={this.onBubbleClose.bind(this)}
    />;
  }

  onBubbleClose() {
    this.setState({selectionInfo: null});
  }

  renderHoverBubble(hoverInfo: BubbleInfo): JSX.Element {
    const { stage } = this.props;
    const chartStage = this.getSingleChartStage();
    const { measure, path, chartIndex, segmentLabel, coordinates } = hoverInfo;

    const leftOffset = this.getBubbleLeftOffset(coordinates.middleX);
    const topOffset = this.getBubbleTopOffset(coordinates.y, chartIndex, chartStage);

    if (!this.canShowBubble(leftOffset, topOffset)) return null;

    return <SegmentBubble
      top={stage.y + topOffset}
      left={leftOffset}
      segmentLabel={segmentLabel}
      measureLabel={measure.formatDatum(path[path.length - 1])}
    />;
  }

  isSelected(path: Datum[], measure: Measure): boolean {
    const { essence } = this.props;
    const { splits, dataSource } = essence;

    if (essence.highlightOnDifferentMeasure(BarChart.id, measure.name)) return false;

    if (essence.highlightOn(BarChart.id, measure.name)) {
      return essence.highlight.delta.equals(getFilterFromDatum(splits, path, dataSource));
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
    const { splits, dataSource } = essence;

    if (this.hasAnySelectionGoingOn()) return false;
    if (!hoverInfo) return false;
    if (hoverInfo.measure !== measure) return false;

    const filter = (p: Datum[]) => getFilterFromDatum(splits, p, dataSource);

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
  ): {bars: JSX.Element[], highlight: JSX.Element } {
    const { essence } = this.props;

    var bars: any[] = [];
    var highlight: JSX.Element;

    const dimension = essence.splits.get(splitIndex).getDimension(essence.dataSource.dimensions);
    const splitLength = essence.splits.length();

    data.forEach((d, i) => {
      let segmentValue = d[dimension.name];
      let segmentValueStr = String(segmentValue);
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
          className={classNames('bar', { selected: selected, 'not-selected': (!selected && faded), isHovered })}
          key={segmentValueStr}
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

    return {bars, highlight};
  }

  renderSelectionHighlight(chartStage: Stage, coordinates: BarCoordinates, chartIndex: number): JSX.Element {
    const { scrollLeft, scrollTop } = this.state;
    const chartHeight = this.getOuterChartHeight(chartStage);
    const { barWidth, height, barOffset, y, x } = coordinates;

    const leftOffset = roundToPx(x) + barOffset - SELECTION_PAD + chartStage.x - scrollLeft;
    const topOffset = roundToPx(y) - SELECTION_PAD + chartStage.y  - scrollTop + chartHeight * chartIndex;

    var style: React.CSSProperties = {
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
    const dimension = split.getDimension(essence.dataSource.dimensions);

    var labels: JSX.Element[] = [];
    if (dimension.isContinuous()) {
      var lastIndex = data.length - 1;
      var ascending = split.sortAction.direction === SortAction.ASCENDING;
      var leftThing = ascending ? 'start' : 'end';
      var rightThing = ascending ? 'end' : 'start';
      data.forEach((d, i) => {
        let segmentValue = d[dimension.name];
        let segmentValueStr = String(Range.isRange(segmentValue) ? (segmentValue as any)[leftThing] : '');
        let coordinate = coordinates[i];

        labels.push(<div
          className="slanty-label continuous"
          key={segmentValueStr}
          style={{ right: xAxisStage.width - coordinate.x }}
        >{segmentValueStr}</div>);

        if (i === lastIndex) {
          segmentValueStr = String(Range.isRange(segmentValue) ? (segmentValue as any)[rightThing] : '');
          labels.push(<div
            className="slanty-label continuous"
            key={segmentValueStr}
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

    return <div className="x-axis" style={{width: xAxisStage.width}}>
      <svg style={xAxisStage.getWidthHeight()} viewBox={xAxisStage.getViewBox()}>
        <BucketMarks stage={xAxisStage} ticks={xTicks} scale={xScale}/>
      </svg>
      {labels}
    </div>;
  }

  getYAxisStuff(dataset: Dataset, measure: Measure, chartStage: Stage, chartIndex: number): {
    yGridLines: JSX.Element, yAxis: JSX.Element, yScale: d3.scale.Linear<number, number>
  } {
    var { yAxisStage } = this.getAxisStages(chartStage);

    var yScale = this.getYScale(measure, yAxisStage);
    var yTicks = yScale.ticks(5);

    var yGridLines: JSX.Element = <GridLines
      orientation="horizontal"
      scale={yScale}
      ticks={yTicks}
      stage={chartStage}
    />;

    var axisStage = yAxisStage.changeY(yAxisStage.y + (chartStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING) * chartIndex);

    var yAxis: JSX.Element = <VerticalAxis
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
  ): {yAxis: JSX.Element, chart: JSX.Element, highlight: JSX.Element} {
    var mySplitDataset = dataset.data[0][SPLIT] as Dataset;

    // Invalid data, early return
    if (!this.hasValidYExtent(measure, mySplitDataset.data)) {
      return {
        chart: <div className="measure-bar-chart" key={measure.name} style={{width: chartStage.width}}>
          <svg style={chartStage.getWidthHeight(0, CHART_BOTTOM_PADDING)} viewBox={chartStage.getViewBox(0, CHART_BOTTOM_PADDING)}/>
          <VisMeasureLabel measure={measure} datum={dataset.data[0]}/>
        </div>,
        yAxis: null,
        highlight: null
      };

    }

    let { xAxisStage } = this.getAxisStages(chartStage);

    var { yAxis, yGridLines } = this.getYAxisStuff(mySplitDataset, measure, chartStage, chartIndex);

    var bars: JSX.Element[];
    var highlight: JSX.Element;
    if (this.isChartVisible(chartIndex, xAxisStage)) {
       let renderedChart = this.renderBars(mySplitDataset.data, measure, chartIndex, chartStage, xAxisStage, coordinates);
       bars = renderedChart.bars;
       highlight = renderedChart.highlight;
    }

    var chart = <div className="measure-bar-chart" key={measure.name} style={{width: chartStage.width}}>
      <svg style={chartStage.getWidthHeight(0, CHART_BOTTOM_PADDING)} viewBox={chartStage.getViewBox(0, CHART_BOTTOM_PADDING)}>
        {yGridLines}
        <g className="bars" transform={chartStage.getTransform()}>{bars}</g>
      </svg>
      <VisMeasureLabel measure={measure} datum={dataset.data[0]}/>
    </div>;

    return {chart, yAxis, highlight};
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence, stage } = props;
    const { splits } = essence;

    this.coordinatesCache = [];

    var existingDatasetLoad = this.state.datasetLoad;
    var newState: BarChartState = {};
    if (datasetLoad) {
      // Always keep the old dataset while loading (for now)
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      datasetLoad = this.state.datasetLoad;
    }

    var { dataset } = datasetLoad;
    if (dataset && splits.length()) {
      let firstSplitDataSet = dataset.data[0][SPLIT] as Dataset;
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);
      let flatData = firstSplitDataSet.flatten({
        order: 'preorder',
        nestingName: '__nest',
        parentName: '__parent'
      });

      var maxima = splits.toArray().map(() => 0); // initializing maxima to 0
      this.maxNumberOfLeaves(firstSplitDataSet.data, maxima, 0);

      newState.maxNumberOfLeaves = maxima;

      newState.flatData = flatData;
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
    var data = (datasetLoad.dataset.data[0][SPLIT] as Dataset).data;

    const { essence } = this.props;
    const { splits, dataSource} = essence;
    const dimension = splits.get(0).getDimension(dataSource.dimensions);

    var getX = (d: Datum) => d[dimension.name] as string;

    const { usedWidth, padLeft } = this.getXValues(maxNumberOfLeaves);

    return d3.scale.ordinal()
      .domain(data.map(getX))
      .rangeBands([padLeft, padLeft + usedWidth]);
  }

  getBarDimensions(xRangeBand: number): {stepWidth: number, barWidth: number, barOffset: number} {
    if (isNaN(xRangeBand)) xRangeBand = 0;
    var stepWidth = xRangeBand;
    var barWidth = Math.max(stepWidth * BAR_PROPORTION, 0);
    var barOffset = (stepWidth - barWidth) / 2;

    return { stepWidth, barWidth, barOffset };
  }

  getXValues(maxNumberOfLeaves: number[]): {padLeft: number, usedWidth: number} {
    const { essence, stage } = this.props;
    var overallWidth = stage.width - VIS_H_PADDING * 2 - Y_AXIS_WIDTH;

    var numPrimarySteps = maxNumberOfLeaves[0];
    var minStepWidth = MIN_STEP_WIDTH * maxNumberOfLeaves.slice(1).reduce(((a, b) => a * b), 1);

    var maxAvailableWidth = overallWidth - BARS_MIN_PAD_LEFT - BARS_MIN_PAD_RIGHT;

    var stepWidth: number;
    if (minStepWidth * numPrimarySteps < maxAvailableWidth) {
      stepWidth = Math.max(Math.min(maxAvailableWidth / numPrimarySteps, MAX_STEP_WIDTH * essence.splits.length()), MIN_STEP_WIDTH);
    } else {
      stepWidth = minStepWidth;
    }

    var usedWidth = stepWidth * maxNumberOfLeaves[0];
    var padLeft = Math.max(BARS_MIN_PAD_LEFT, (overallWidth - usedWidth) / 2);

    return {padLeft, usedWidth};
  }

  getBarsCoordinates(chartIndex: number, xScale: d3.scale.Ordinal<string, number>): BarCoordinates[] {
    if (!!this.coordinatesCache[chartIndex]) {
      return this.coordinatesCache[chartIndex];
    }

    const { essence } = this.props;
    const { datasetLoad } = this.state;
    const { splits, dataSource} = essence;

    const measure = essence.getEffectiveMeasures().toArray()[chartIndex];
    const dataset = datasetLoad.dataset.data[0][SPLIT] as Dataset;
    const dimension = splits.get(0).getDimension(dataSource.dimensions);

    var chartStage = this.getSingleChartStage();
    var { yScale } = this.getYAxisStuff(dataset, measure, chartStage, chartIndex);

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

    var { stepWidth, barWidth, barOffset } = this.getBarDimensions(xScale.rangeBand());

    var coordinates: BarCoordinates[] = data.map((d, i) => {
      let x = xScale(getX(d, i));
      let y = scaleY(d[measure.name] as number);
      let h = scaleY(0) - y;
      var children: BarCoordinates[] = [];
      var coordinate = new BarCoordinates({
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
        let subStage: Stage = new Stage({x: x, y: chartStage.y, width: barWidth, height: chartStage.height});
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
    var yAxesStage = yAxisStage.changeHeight((yAxisStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING) * measures.length);

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
    const { splits, dataSource } = essence;
    const dimension = splits.get(0).getDimension(dataSource.dimensions);

    var scrollerLayout: ScrollerLayout;
    var measureCharts: JSX.Element[] = [];
    var xAxis: JSX.Element;
    var rightGutter: JSX.Element;
    var overlay: JSX.Element;

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

    return <div className="internals measure-bar-charts" style={{maxHeight: stage.height}}>
       <Scroller
        layout={scrollerLayout}

        bottomGutter={xAxis}
        rightGutter={rightGutter}

        body={measureCharts}
        overlay={overlay}

        onClick={this.onClick.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onScroll={this.onSimpleScroll.bind(this)}

      />
    </div>;
  }
}
