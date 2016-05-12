require('./bar-chart.css');

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';

import * as React from 'react';
import { generalEqual } from 'immutable-class';
import { $, ply, r, Expression, Executor, Dataset, Datum, SortAction, PlywoodValue, Set, TimeRange } from 'plywood';
import { Stage, Essence, DataSource, Filter, FilterClause, Splits, SplitCombine, Dimension, Measure, Colors, VisualizationProps, DatasetLoad, Resolve } from '../../../common/models/index';
import { SPLIT, VIS_H_PADDING } from '../../config/constants';
import { roundToPx, roundToHalfPx, classNames } from '../../utils/dom/dom';
import { VisMeasureLabel } from '../../components/vis-measure-label/vis-measure-label';
import { VerticalAxis } from '../../components/vertical-axis/vertical-axis';
import { BucketMarks } from '../../components/bucket-marks/bucket-marks';
import { GridLines } from '../../components/grid-lines/grid-lines';
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';
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

export interface HoverValue {
  value: PlywoodValue;
}

export interface BarChartState extends BaseVisualizationState {
  hoverValue?: HoverValue;

  // Cached props
  xTicks?: PlywoodValue[];
  scaleX?: any;
}

function getFilterFromDatum(splits: Splits, datum: Datum, xField: string): Filter {
  var segment = datum[xField];
  return Filter.fromClause(new FilterClause({
    expression: splits.get(0).expression,
    selection: r(TimeRange.isTimeRange(segment) ? segment : Set.fromJS([segment]))
  }));
}

export class BarChart extends BaseVisualization<BarChartState> {
  public static id = 'bar-chart';
  public static title = 'Bar Chart';

  private static handler = CircumstancesHandler.EMPTY()
    .needsAtLeastOneSplit()
    .when(
      CircumstancesHandler.areExactSplitKinds('*'),
      (splits: Splits, dataSource: DataSource, colors: Colors, current: boolean) => {
        var booleanBoost = 0;

        // Auto adjustment
        var autoChanged = false;
        splits = splits.map((split, i) => {
          var splitDimension = dataSource.getDimensionByExpression(split.expression);

          if (splitDimension.kind === 'boolean') {
            booleanBoost = 2;
          }

          if (!split.sortAction) {
            if (splitDimension.kind === 'boolean') {
              split = split.changeSortAction(new SortAction({
                expression: $(splitDimension.name),
                direction: 'descending'
              }));
            } else {
              split = split.changeSortAction(dataSource.getDefaultSortAction());
            }
            autoChanged = true;
          } else if (split.sortAction.refName() === dataSource.getTimeDimension().name) {
            split = split.changeSortAction(new SortAction({
              expression: $(splitDimension.name),
              direction: split.sortAction.direction
            }));
            autoChanged = true;
          }

          // ToDo: review this
          if (!split.limitAction && (autoChanged || splitDimension.kind !== 'time')) {
            split = split.changeLimit(i ? 5 : 25);
            autoChanged = true;
          }

          return split;
        });

        if (colors) {
          colors = null;
          autoChanged = true;
        }

        return autoChanged ? Resolve.automatic(5 + booleanBoost, { splits }) : Resolve.ready(current ? 10 : (7 + booleanBoost));
      }
    ).otherwise(
      (splits: Splits) => {
        return Resolve.manual(3, 'This visualization needs one split exactly', [
        {
          description: `Remove all but the first split`,
          adjustment: {
            splits: Splits.fromSplitCombine(splits.get(0))
          }
        }
      ]);
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

    s.hoverValue = null;

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

  onMouseEnter(measure: Measure, hoverValue: PlywoodValue, e: MouseEvent) {
    this.setState({
      hoverValue: { value: hoverValue },
      hoverMeasure: measure
    });
  }

  onMouseLeave(measure: Measure, e: MouseEvent) {
    const { hoverMeasure } = this.state;
    if (hoverMeasure === measure) {
      this.setState({
        hoverValue: null,
        hoverMeasure: null
      });
    }
  }

  onClick(measure: Measure, datum: Datum, e: MouseEvent) {
    const { essence, clicker } = this.props;
    const { splits, dataSource } = essence;

    const dimension = splits.get(0).getDimension(dataSource.dimensions);

    var rowHighlight = getFilterFromDatum(splits, datum, dimension.name);

    if (essence.highlightOn(BarChart.id, measure.name)) {
      if (rowHighlight.equals(essence.highlight.delta)) {
        clicker.dropHighlight();
        return;
      }
    }

    clicker.changeHighlight(BarChart.id, measure.name, rowHighlight);
  }

  renderChartBubble(dataset: Dataset, measure: Measure, chartIndex: number, containerStage: Stage, chartStage: Stage, extentY: number[], scaleY: any): JSX.Element {
    const { essence, clicker, openRawDataModal } = this.props;
    const { scrollTop, hoverValue, hoverMeasure, scaleX } = this.state;
    const { splits, dataSource } = essence;
    const dimension = splits.get(0).getDimension(dataSource.dimensions);

    var stepWidth = scaleX.rangeBand();

    if (essence.highlightOnDifferentMeasure(BarChart.id, measure.name)) return null;

    if (essence.highlightOn(BarChart.id, measure.name)) {
      var bubbleHighlightDelta = essence.highlight.delta;
      var highlightDatum = dataset.data.filter((d) => bubbleHighlightDelta.equals(getFilterFromDatum(splits, d, dimension.name)))[0];
      if (!highlightDatum) return null;

      var leftOffset = containerStage.x + VIS_H_PADDING + scaleX(highlightDatum[dimension.name]) + stepWidth / 2;
      var topOffset = chartStage.height * chartIndex - scrollTop + scaleY(highlightDatum[measure.name]) + TEXT_SPACER - HOVER_BUBBLE_V_OFFSET;
      if (topOffset > 0) {
        return <SegmentBubble
          left={leftOffset}
          top={containerStage.y + topOffset}
          dimension={dimension}
          segmentLabel={String(highlightDatum[dimension.name])}
          measureLabel={measure.formatDatum(highlightDatum)}
          clicker={clicker}
          openRawDataModal={openRawDataModal}
        />;
      }

    } else if (hoverValue && hoverMeasure === measure) {
      var hoverDatum = dataset.findDatumByAttribute(dimension.name, hoverValue.value);
      var leftOffset = containerStage.x + VIS_H_PADDING + scaleX(hoverValue.value) + stepWidth / 2;
      var topOffset = chartStage.height * chartIndex - scrollTop + scaleY(hoverDatum[measure.name]) + TEXT_SPACER - HOVER_BUBBLE_V_OFFSET;
      if (topOffset > 0) {
        return <SegmentBubble
          top={containerStage.y + topOffset}
          left={leftOffset}
          segmentLabel={String(hoverValue.value)}
          measureLabel={measure.formatDatum(hoverDatum)}
        />;
      }
    }

    return null;
  }

  renderChart(dataset: Dataset, measure: Measure, chartIndex: number, containerStage: Stage, chartStage: Stage, getX: any): JSX.Element {
    const { essence } = this.props;
    const { hoverValue, hoverMeasure, xTicks, scaleX } = this.state;
    const { splits, dataSource } = essence;
    const dimension = splits.get(0).getDimension(dataSource.dimensions);

    var myDatum: Datum = dataset.data[0];
    var mySplitDataset = myDatum[SPLIT] as Dataset;

    var barStage = chartStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH, bottom: X_AXIS_HEIGHT });
    var xAxisStage = chartStage.within({ right: Y_AXIS_WIDTH, top: TEXT_SPACER + barStage.height });
    var yAxisStage = chartStage.within({ top: TEXT_SPACER, left: barStage.width });

    var measureName = measure.name;
    var getY = (d: Datum) => d[measureName] as number;

    var borderHighlightDelta: Filter = null;
    var bubbleHighlightDelta: Filter = null;
    if (essence.highlightOn(BarChart.id)) {
      borderHighlightDelta = essence.highlight.delta;
      if (essence.highlightOn(BarChart.id, measureName)) {
        bubbleHighlightDelta = borderHighlightDelta;
      }
    }

    var extentY = d3.extent(mySplitDataset.data, getY);

    var stepWidth = scaleX.rangeBand();

    var bubble: JSX.Element;
    var horizontalGridLines: JSX.Element;
    var bars: JSX.Element[];
    var barHighlight: JSX.Element;
    var barGhosts: JSX.Element[];
    var slantyLabels: JSX.Element[];
    var verticalAxis: JSX.Element;
    if (!isNaN(extentY[0]) && !isNaN(extentY[1])) {
      var scaleY = d3.scale.linear()
        .domain([Math.min(extentY[0] * 1.1, 0), Math.max(extentY[1] * 1.1, 0)])
        .range([barStage.height, 0]);

      var yTicks = scaleY.ticks(5).filter((n: number) => n !== 0);

      horizontalGridLines = <GridLines
        orientation="horizontal"
        scale={scaleY}
        ticks={yTicks}
        stage={barStage}
      />;

      verticalAxis = <VerticalAxis
        stage={yAxisStage}
        ticks={yTicks}
        scale={scaleY}
        topLineExtend={TEXT_SPACER - (chartIndex ? 0 : 10)}
      />;

      var barWidth = Math.max(stepWidth * BAR_PROPORTION, 0);
      var barOffset = (stepWidth - barWidth) / 2;
      bars = [];
      barGhosts = [];
      slantyLabels = [];
      var scaleY0 = scaleY(0);
      mySplitDataset.data.forEach((d) => {
        var segmentValue = d[dimension.name];
        var segmentValueStr = String(segmentValue);
        var x = scaleX(getX(d));
        var y = scaleY(getY(d));
        var onMouseEnter = this.onMouseEnter.bind(this, measure, segmentValue);
        var onMouseLeave = this.onMouseLeave.bind(this, measure);

        if (barStage.width < x) return;
        var hover: boolean;
        if (bubbleHighlightDelta) {
          hover = false;
        } else {
          hover = hoverMeasure === measure && hoverValue && generalEqual(hoverValue.value, segmentValue);
        }

        var selected: boolean;
        var selectedClass: string;
        if (borderHighlightDelta) {
          selected = borderHighlightDelta.equals(getFilterFromDatum(splits, d, dimension.name));
          selectedClass = selected ? 'selected' : 'not-selected';
        }

        var h = scaleY0 - y;
        bars.push(<rect
          className={classNames(selectedClass, { hover })}
          key={segmentValueStr}
          x={roundToPx(x + barOffset)}
          y={roundToPx(h >= 0 ? y : scaleY0)}
          width={roundToPx(barWidth)}
          height={roundToPx(Math.abs(h))}
        />);

        if (selected) {
          barHighlight = <rect
            className="selection"
            x={roundToPx(x + barOffset) - SELECTION_PAD}
            y={roundToPx(y) - SELECTION_PAD}
            width={roundToPx(barWidth) + SELECTION_PAD * 2}
            height={roundToPx(Math.abs(y - scaleY0)) + SELECTION_PAD * 2}
            rx={SELECTION_CORNERS}
            ry={SELECTION_CORNERS}
            strokeDasharray={SELECTION_DASHARRAY}
          />;
        }

        barGhosts.push(<rect
          key={segmentValueStr}
          x={x}
          y={-TEXT_SPACER}
          width={stepWidth}
          height={barStage.height + TEXT_SPACER}
          onClick={this.onClick.bind(this, measure, d)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />);

        slantyLabels.push(<div
          className="slanty-label"
          key={segmentValueStr}
          style={{ right: xAxisStage.width - (x + stepWidth / 2) }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >{segmentValueStr}</div>);
      });

      bubble = this.renderChartBubble(mySplitDataset, measure, chartIndex, containerStage, chartStage, extentY, scaleY);
    }

    return <div
      className="measure-bar-chart"
      key={measureName}
    >
      <svg style={chartStage.getWidthHeight()} viewBox={chartStage.getViewBox()}>
        {horizontalGridLines}
        <g className="bars" transform={barStage.getTransform()}>{bars}</g>
        <g className="bar-ghosts" transform={barStage.getTransform()}>{barGhosts}</g>
        <rect className="mask" transform={yAxisStage.getTransform()} width={yAxisStage.width} height={yAxisStage.height + X_AXIS_HEIGHT}/>
        {verticalAxis}
        <BucketMarks stage={xAxisStage} ticks={xTicks} scale={scaleX}/>
        <line
          className="vis-bottom"
          x1="0"
          y1={TEXT_SPACER + barStage.height - 0.5}
          x2={chartStage.width}
          y2={TEXT_SPACER + barStage.height - 0.5}
        />
        <g className="bar-highlight" transform={barStage.getTransform()}>{barHighlight}</g>
      </svg>
      <div className="slanty-labels" style={xAxisStage.getLeftTopWidthHeight()}>{slantyLabels}</div>
      <VisMeasureLabel measure={measure} datum={myDatum}/>
      {bubble}
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

      var myDatum: Datum = dataset.data[0];
      var mySplitDataset = myDatum[SPLIT] as Dataset;

      var xTicks = mySplitDataset.data.map(getX);
      var numSteps = xTicks.length;
      var overallWidth = stage.width - VIS_H_PADDING * 2 - Y_AXIS_WIDTH;
      var maxAvailableWidth = overallWidth - BARS_MIN_PAD_LEFT - BARS_MIN_PAD_RIGHT;
      var stepWidth = Math.max(Math.min(maxAvailableWidth / numSteps, MAX_STEP_WIDTH), MIN_STEP_WIDTH);
      var usedWidth = stepWidth * numSteps;
      var padLeft = Math.max(BARS_MIN_PAD_LEFT, (overallWidth - usedWidth) / 2);

      newState.xTicks = xTicks;
      newState.scaleX = d3.scale.ordinal()
        .domain(xTicks)
        .rangeBands([padLeft, padLeft + usedWidth]);
    }

    this.setState(newState);
  }

  renderInternals() {
    var { essence, stage } = this.props;
    var { datasetLoad } = this.state;
    var { splits, dataSource } = essence;
    const dimension = splits.get(0).getDimension(dataSource.dimensions);

    var measureCharts: JSX.Element[];

    if (datasetLoad.dataset && splits.length()) {
      var measures = essence.getEffectiveMeasures().toArray();

      var getX = (d: Datum) => d[dimension.name] as string;

      var parentWidth = stage.width - VIS_H_PADDING * 2;
      var chartHeight = Math.max(MIN_CHART_HEIGHT, Math.floor(stage.height / measures.length));
      var chartStage = new Stage({
        x: VIS_H_PADDING,
        y: 0,
        width: parentWidth,
        height: chartHeight
      });

      measureCharts = measures.map((measure, chartIndex) => {
        return this.renderChart(datasetLoad.dataset, measure, chartIndex, stage, chartStage, getX);
      });
    }

    var measureChartsStyle = {
      maxHeight: stage.height
    };

    return <div className="internals measure-bar-charts" style={measureChartsStyle} onScroll={this.onScroll.bind(this)}>
      {measureCharts}
    </div>;
  }
}
