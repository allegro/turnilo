require('./bar-chart.css');

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';

import * as React from 'react';
import { List } from 'immutable';
import { generalEqual } from 'immutable-class';
import { $, ply, r, Expression, Executor, Dataset, Datum, PseudoDatum, SortAction, PlywoodValue, Set, TimeRange } from 'plywood';

import {
  Stage,
  Essence,
  DataSource,
  Filter,
  FilterClause,
  Splits,
  SplitCombine,
  Dimension,
  Measure,
  Colors,
  VisualizationProps,
  DatasetLoad,
  Resolve
} from '../../../common/models/index';

import { SPLIT, VIS_H_PADDING } from '../../config/constants';
import { roundToPx, roundToHalfPx, classNames } from '../../utils/dom/dom';
import { VisMeasureLabel } from '../../components/vis-measure-label/vis-measure-label';
import { VerticalAxis } from '../../components/vertical-axis/vertical-axis';
import { BucketMarks } from '../../components/bucket-marks/bucket-marks';
import { GridLines } from '../../components/grid-lines/grid-lines';
import { SegmentBubble } from '../../components/segment-bubble/segment-bubble';

import { CircumstancesHandler } from '../../../common/utils/circumstances-handler/circumstances-handler';

const TEXT_SPACER = 36;
const X_AXIS_HEIGHT = 84;
const Y_AXIS_WIDTH = 60;
const MIN_CHART_HEIGHT = 200;
const MAX_STEP_WIDTH = 140; // Note that the step is bar + empty space around it. The width of the rectangle is step * BAR_PROPORTION
const MIN_STEP_WIDTH = 20;
const BAR_PROPORTION = 0.8;
const BARS_MIN_PAD_LEFT = 30;
const BARS_MIN_PAD_RIGHT = 6;
const HOVER_BUBBLE_V_OFFSET = 8;
const SELECTION_PAD = 3.5; // Must be a x.5
const SELECTION_CORNERS = 2;
const SELECTION_DASHARRAY = "3,3"; // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray

export interface BubbleInfo {
  x: number;
  y: number;
  segmentLabel: string;
  measure: Measure;
  chartIndex: number;
  path: Datum[];
  splitIndex: number;
}

export interface BarCoordinates {
  x: number;
  y: number;
  height: number;
  width: number;

  barOffset: number;
  barWidth: number;
  stepWidth: number;
  children: BarCoordinates[];
}

export interface BarChartState extends BaseVisualizationState {
  hoverInfo?: BubbleInfo;
  selectionInfo?: BubbleInfo;

  // Cached props
  xTicks?: PlywoodValue[];
  scaleX?: d3.scale.Ordinal<string, number>;
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
  public static id = 'bar-chart';
  public static title = 'Bar Chart';

  private static handler = CircumstancesHandler.EMPTY()
    .needsAtLeastOneSplit('The Bar Chart requires at least one split')
    .when(
      CircumstancesHandler.areExactSplitKinds('*'),
      (splits: Splits, dataSource: DataSource, colors: Colors, current: boolean) => {
        var booleanBoost = 0;

        // Auto adjustment
        var autoChanged = false;

        splits = splits.map((split: SplitCombine) => {
          var splitDimension = dataSource.getDimensionByExpression(split.expression);

          if (!split.sortAction) {
            // Must sort boolean in deciding order!
            if (splitDimension.kind === 'boolean') {
              split = split.changeSortAction(new SortAction({
                expression: $(splitDimension.name),
                direction: SortAction.DESCENDING
              }));
            } else {
              split = split.changeSortAction(dataSource.getDefaultSortAction());
            }
            autoChanged = true;
          } else if (splitDimension.isContinuous() && split.sortAction.refName() !== splitDimension.name) {
            split = split.changeSortAction(new SortAction({
              expression: $(splitDimension.name),
              direction: split.sortAction.direction
            }));
            autoChanged = true;
          }


          // ToDo: review this
          if (!split.limitAction && (autoChanged || splitDimension.kind !== 'time')) {
            split = split.changeLimit(25);
            autoChanged = true;
          }

          if (colors) {
            colors = null;
            autoChanged = true;
          }

          return split;
        });

        if (autoChanged) {
          return Resolve.automatic(5 + booleanBoost, { splits });
        }

        return Resolve.ready(current ? 10 : (7 + booleanBoost));
      }
    ).otherwise(
      (splits: Splits, dataSource: DataSource) => {
        let categoricalDimensions = dataSource.dimensions.filter((d) => d.kind !== 'time');

        return Resolve.manual(
          3,
          'The Bar Chart needs one category split exactly',
          categoricalDimensions.toArray().slice(0, 2).map((dimension: Dimension) => {
            return {
              description: `Split on ${dimension.title} instead`,
              adjustment: {
                splits: Splits.fromSplitCombine(SplitCombine.fromExpression(dimension.expression))
              }
            };
          })
        );
      }
    );

  public static handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
    return this.handler.evaluate(dataSource, splits, colors, current);
  }

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

  onMouseEnter(hoverInfo: BubbleInfo) {
    this.setState({hoverInfo});
  }

  onMouseLeave(targetHoverInfo: BubbleInfo) {
    const { hoverInfo } = this.state;
    if (hoverInfo && targetHoverInfo.measure === hoverInfo.measure) {
      this.setState({hoverInfo: null});
    }
  }

  onClick(measure: Measure, dataPath: Datum[], splitIndex: number, selectionInfo: BubbleInfo, e: MouseEvent) {
    const { essence, clicker } = this.props;
    const { splits, dataSource } = essence;

    var rowHighlight = getFilterFromDatum(splits, dataPath, dataSource);

    if (essence.highlightOn(BarChart.id, measure.name)) {
      if (rowHighlight.equals(essence.highlight.delta)) {
        clicker.dropHighlight();
        this.setState({selectionInfo: null});
        return;
      }
    }

    this.setState({selectionInfo});
    clicker.changeHighlight(BarChart.id, measure.name, rowHighlight);
  }

  getYExtent(data: Datum[], measure: Measure): number[] {
    var measureName = measure.name;
    var getY = (d: Datum) => d[measureName] as number;
    return d3.extent(data, getY);
  }

  getYScale(dataset: Dataset, measure: Measure, stage: Stage): d3.scale.Linear<number, number> {
    var { essence } = this.props;

    var splitLength = essence.splits.length();
    var leafData = dataset.flatten({
      order: 'preorder',
      nestingName: '__nest',
      parentName: '__parent'
    }).filter((d: Datum) => d['__nest'] === splitLength - 1);

    var extentY = this.getYExtent(leafData, measure);

    return d3.scale.linear()
      .domain([Math.min(extentY[0] * 1.1, 0), Math.max(extentY[1] * 1.1, 0)])
      .range([stage.height, 0]);
  }

  hasValidYExtent(measure: Measure, data: Datum[]): boolean {
    let [yMin, yMax] = this.getYExtent(data, measure);
    return !isNaN(yMin) && !isNaN(yMax);
  }

  getStages(chartStage: Stage): {barStage: Stage, xAxisStage: Stage, yAxisStage: Stage} {
    var barStage = chartStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH, bottom: X_AXIS_HEIGHT });
    var xAxisStage = chartStage.within({ right: Y_AXIS_WIDTH, top: TEXT_SPACER + barStage.height });
    var yAxisStage = chartStage.within({ top: TEXT_SPACER, left: barStage.width });

    return { barStage, xAxisStage, yAxisStage };
  }

  getBarDimensions(xRangeBand: number): {stepWidth: number, barWidth: number, barOffset: number} {
    var stepWidth = xRangeBand;
    var barWidth = Math.max(stepWidth * BAR_PROPORTION, 0);
    var barOffset = (stepWidth - barWidth) / 2;

    return { stepWidth, barWidth, barOffset };
  }

  renderSelectionBubble(hoverInfo: BubbleInfo): JSX.Element {
    const { essence, stage, clicker, openRawDataModal } = this.props;
    const { scrollTop } = this.state;
    const chartStage = this.getChartStage();
    const { measure, path, segmentLabel, chartIndex } = hoverInfo;

    const { splits, dataSource } = essence;
    const dimension = splits.get(hoverInfo.splitIndex).getDimension(dataSource.dimensions);

    const leftOffset = stage.x + VIS_H_PADDING + hoverInfo.x;
    const topOffset = chartStage.height * chartIndex - scrollTop + hoverInfo.y + TEXT_SPACER - HOVER_BUBBLE_V_OFFSET;

    if (topOffset <= 0) return null;


    return <SegmentBubble
      left={leftOffset}
      top={stage.y + topOffset}
      dimension={dimension}
      segmentLabel={segmentLabel}
      measureLabel={measure.formatDatum(path[path.length - 1])}
      clicker={clicker}
      openRawDataModal={openRawDataModal}
    />;
  }

  renderHoverBubble(hoverInfo: BubbleInfo): JSX.Element {
    const { stage } = this.props;
    const { scrollTop } = this.state;
    const chartStage = this.getChartStage();
    const { measure, path, segmentLabel, chartIndex } = hoverInfo;

    const leftOffset = stage.x + VIS_H_PADDING + hoverInfo.x;
    const topOffset = chartStage.height * chartIndex - scrollTop + hoverInfo.y + TEXT_SPACER - HOVER_BUBBLE_V_OFFSET;

    if (topOffset <= 0) return null;

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
    barStage: Stage,
    xAxisStage: Stage,
    coordinates: BarCoordinates[],
    splitIndex = 0,
    path: Datum[] = []
  ): {bars: JSX.Element[], labels: JSX.Element[], bubble?: JSX.Element} {
    const { essence } = this.props;
    const { selectionInfo } = this.state;

    var bars: JSX.Element[] = [];
    var labels: JSX.Element[] = [];

    const dimension = essence.splits.get(splitIndex).getDimension(essence.dataSource.dimensions);

    data.forEach((d, i) => {
      let segmentValue = d[dimension.name];
      let segmentValueStr = String(segmentValue);
      let subPath = path.concat(d);

      let bar: JSX.Element;
      let highlight: JSX.Element = null;
      let bubble: JSX.Element = null;
      let subCoordinates = coordinates[i];
      let { x, y, height, width, stepWidth, barWidth, barOffset } = coordinates[i];


      if (splitIndex < essence.splits.length() - 1) {
        let subData: Datum[] = (d[SPLIT] as Dataset).data;
        let result: any = this.renderBars(subData, measure, chartIndex, barStage, xAxisStage, subCoordinates.children, splitIndex + 1, subPath);

        bar = result.bars;
      } else {

        let bubbleInfo: BubbleInfo = {
          x: x + stepWidth / 2,
          y,
          segmentLabel: segmentValueStr,
          measure,
          chartIndex,
          path: subPath,
          splitIndex
        };

        let isHovered = this.isHovered(subPath, measure);
        if (isHovered) {
          bubble = this.renderHoverBubble(bubbleInfo);
        }

        let selected = this.isSelected(subPath, measure);
        if (selected) {
          bubble = this.renderSelectionBubble(bubbleInfo);
          highlight = <rect
            className="selection"
            x={barOffset - SELECTION_PAD}
            y={roundToPx(y) - SELECTION_PAD}
            width={roundToPx(barWidth + SELECTION_PAD * 2)}
            height={roundToPx(Math.abs(height) + SELECTION_PAD * 2)}
            rx={SELECTION_CORNERS}
            ry={SELECTION_CORNERS}
            strokeDasharray={SELECTION_DASHARRAY}
          />;
        }

        bar = <g
          className={classNames('bar', { selected: selected, 'not-selected': (!!selectionInfo && !selected), isHovered })}
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
          <rect
            className="mouse-event-target"
            key={segmentValueStr}
            y={-TEXT_SPACER}
            width={stepWidth}
            height={barStage.height + TEXT_SPACER}
            onClick={this.onClick.bind(this, measure, subPath, splitIndex, bubbleInfo)}
            onMouseEnter={this.onMouseEnter.bind(this, bubbleInfo)}
            onMouseLeave={this.onMouseLeave.bind(this, bubbleInfo)}
          />
          {highlight}
          {bubble}
        </g>;

      }

      bars.push(bar);

      if (splitIndex === 0) {
        labels.push(<div
          className="slanty-label"
          key={segmentValueStr}
          style={{ right: xAxisStage.width - (x + stepWidth / 2) }}
        >{segmentValueStr}</div>);
      }
    });

    return { bars, labels };
  }

  getYAxisStuff(dataset: Dataset, measure: Measure, chartStage: Stage, chartIndex: number): {
    yGridLines: JSX.Element, yAxis: JSX.Element, yScale: d3.scale.Linear<number, number>
  } {
    var { barStage, yAxisStage } = this.getStages(chartStage);

    var yScale = this.getYScale(dataset, measure, barStage);
    var yTicks = yScale.ticks(5).filter((n: number) => n !== 0);

    var yGridLines: JSX.Element = <GridLines
      orientation="horizontal"
      scale={yScale}
      ticks={yTicks}
      stage={barStage}
    />;

    var yAxis: JSX.Element = <VerticalAxis
      stage={yAxisStage}
      ticks={yTicks}
      scale={yScale}
      topLineExtend={TEXT_SPACER - (chartIndex ? 0 : 10)}
    />;

    return { yGridLines, yAxis, yScale };
  }

  renderChart(dataset: Dataset, coordinates: BarCoordinates[], measure: Measure, chartIndex: number, containerStage: Stage, chartStage: Stage, getX: any): JSX.Element {
    const { xTicks, scaleX } = this.state;
    var mySplitDataset = dataset.data[0][SPLIT] as Dataset;

    // Invalid data, early return
    if (!this.hasValidYExtent(measure, mySplitDataset.data)) {
      return <div className="measure-bar-chart" key={measure.name}>
        <svg style={chartStage.getWidthHeight()} viewBox={chartStage.getViewBox()}/>
        <VisMeasureLabel measure={measure} datum={dataset.data[0]}/>
      </div>;
    }

    let { barStage, xAxisStage, yAxisStage } = this.getStages(chartStage);

    var { yAxis, yGridLines } = this.getYAxisStuff(mySplitDataset, measure, chartStage, chartIndex);

    var { bars, labels } = this.renderBars(mySplitDataset.data, measure, chartIndex, barStage, xAxisStage, coordinates);

    return <div className="measure-bar-chart" key={measure.name}>
      <svg style={chartStage.getWidthHeight()} viewBox={chartStage.getViewBox()}>
        {yGridLines}
        <g className="bars" transform={barStage.getTransform()}>{bars}</g>
        <rect className="mask" transform={yAxisStage.getTransform()} width={yAxisStage.width} height={yAxisStage.height + X_AXIS_HEIGHT}/>
        {yAxis}
        <BucketMarks stage={xAxisStage} ticks={xTicks} scale={scaleX}/>
        <line
          className="vis-bottom"
          x1="0"
          x2={chartStage.width}
          y1={TEXT_SPACER + barStage.height - 0.5}
          y2={TEXT_SPACER + barStage.height - 0.5}
        />
      </svg>
      <div className="slanty-labels" style={xAxisStage.getLeftTopWidthHeight()}>{labels}</div>
      <VisMeasureLabel measure={measure} datum={dataset.data[0]}/>
    </div>;
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence, stage } = props;
    const { splits, dataSource} = essence;
    const dimension = splits.get(0).getDimension(dataSource.dimensions);

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
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);

      var getX = (d: Datum) => d[dimension.name] as string;

      var mySplitDataset = dataset.data[0][SPLIT] as Dataset;

      var xTicks = mySplitDataset.data.map(getX);
      var numSteps = xTicks.length;
      var overallWidth = stage.width - VIS_H_PADDING * 2 - Y_AXIS_WIDTH;
      var maxAvailableWidth = overallWidth - BARS_MIN_PAD_LEFT - BARS_MIN_PAD_RIGHT;
      var stepWidth = Math.max(Math.min(maxAvailableWidth / numSteps, MAX_STEP_WIDTH * essence.splits.length()), MIN_STEP_WIDTH);
      var usedWidth = stepWidth * numSteps;
      var padLeft = Math.max(BARS_MIN_PAD_LEFT, (overallWidth - usedWidth) / 2);

      newState.xTicks = xTicks;
      newState.scaleX = d3.scale.ordinal()
        .domain(xTicks)
        .rangeBands([padLeft, padLeft + usedWidth]);
    }

    this.setState(newState);
  }

  getBarsCoordinates(dataset: Dataset, measure: Measure, chartIndex: number, scaleX: d3.scale.Ordinal<string, number>): BarCoordinates[] {
    const { essence } = this.props;
    const { splits, dataSource} = essence;
    const dimension = splits.get(0).getDimension(dataSource.dimensions);

    var chartStage = this.getChartStage();
    let { barStage, xAxisStage } = this.getStages(chartStage);
    var { yScale } = this.getYAxisStuff(dataset, measure, chartStage, chartIndex);

    return this.getSubCoordinates(
      dataset.data,
      measure,
      barStage,
      xAxisStage,
      (d: Datum) => d[dimension.name] as string,
      scaleX,
      yScale
    );
  }

  getSubCoordinates(
    data: Datum[],
    measure: Measure,
    barStage: Stage,
    xAxisStage: Stage,
    getX: (d: Datum, i: number) => string,
    scaleX: d3.scale.Ordinal<string, number>,
    scaleY: d3.scale.Linear<number, number>,
    splitIndex = 0
  ): BarCoordinates[] {
    const { essence } = this.props;

    var { stepWidth, barWidth, barOffset } = this.getBarDimensions(scaleX.rangeBand());

    var coordinates: BarCoordinates[] = data.map((d, i) => {
      let x = scaleX(getX(d, i));
      let y = scaleY(d[measure.name] as number);
      let h = scaleY(0) - y;
      var children: BarCoordinates[] = [];
      var coordinate = {
        x,
        y: h >= 0 ? y : scaleY(0),
        width: roundToPx(barWidth),
        height: roundToPx(Math.abs(h)),
        stepWidth,
        barWidth,
        barOffset,
        children
      };

      if (splitIndex < essence.splits.length() - 1) {
        let subStage: Stage = new Stage({x: x, y: barStage.y, width: barWidth, height: barStage.height});
        let subSplit: SplitCombine = essence.splits.get(splitIndex + 1);
        let subGetX: any = (d: Datum, i: number) => String(i);
        let subData: Datum[] = (d[SPLIT] as Dataset).data;
        let subScaleX = d3.scale.ordinal()
          .domain(d3.range(0, subSplit.limitAction.limit).map(String))
          .rangeBands([x + barOffset, x + subStage.width]);

        coordinate.children = this.getSubCoordinates(subData, measure, subStage, xAxisStage, subGetX, subScaleX, scaleY, splitIndex + 1);
      }

      return coordinate;
    });

    return coordinates;
  }

  getChartStage(): Stage {
    var { essence, stage } = this.props;
    var measures = essence.getEffectiveMeasures().toArray();

    var parentWidth = stage.width - VIS_H_PADDING * 2;
    var chartHeight = Math.max(MIN_CHART_HEIGHT, Math.floor(stage.height / measures.length));
    return new Stage({
      x: VIS_H_PADDING,
      y: 0,
      width: parentWidth,
      height: chartHeight
    });
  }

  renderInternals() {
    var { essence, stage } = this.props;
    var { datasetLoad, scaleX } = this.state;
    var { splits, dataSource } = essence;
    const dimension = splits.get(0).getDimension(dataSource.dimensions);

    var measureCharts: JSX.Element[];

    if (datasetLoad.dataset && splits.length()) {
      let measures = essence.getEffectiveMeasures().toArray();

      let getX = (d: Datum) => d[dimension.name] as string;

      let chartStage = this.getChartStage();

      measureCharts = measures.map((measure, chartIndex) => {
        let mySplitDataset = datasetLoad.dataset.data[0][SPLIT] as Dataset;
        let coordinates = this.getBarsCoordinates(mySplitDataset, measure, chartIndex, scaleX);

        return this.renderChart(datasetLoad.dataset, coordinates, measure, chartIndex, stage, chartStage, getX);
      });
    }

    return <div
      className="internals measure-bar-charts"
      style={{maxHeight: stage.height}}
      onScroll={this.onScroll.bind(this)}
     >
      {measureCharts}
    </div>;
  }
}
