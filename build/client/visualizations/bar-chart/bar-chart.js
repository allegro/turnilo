"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
var immutable_1 = require("immutable");
var plywood_1 = require("plywood");
var React = require("react");
var date_range_1 = require("../../../common/models/date-range/date-range");
var filter_clause_1 = require("../../../common/models/filter-clause/filter-clause");
var concrete_series_1 = require("../../../common/models/series/concrete-series");
var sort_1 = require("../../../common/models/sort/sort");
var split_1 = require("../../../common/models/split/split");
var stage_1 = require("../../../common/models/stage/stage");
var visualization_props_1 = require("../../../common/models/visualization-props/visualization-props");
var formatter_1 = require("../../../common/utils/formatter/formatter");
var bar_chart_1 = require("../../../common/visualization-manifests/bar-chart/bar-chart");
var bucket_marks_1 = require("../../components/bucket-marks/bucket-marks");
var grid_lines_1 = require("../../components/grid-lines/grid-lines");
var highlight_modal_1 = require("../../components/highlight-modal/highlight-modal");
var measure_bubble_content_1 = require("../../components/measure-bubble-content/measure-bubble-content");
var scroller_1 = require("../../components/scroller/scroller");
var segment_bubble_1 = require("../../components/segment-bubble/segment-bubble");
var vertical_axis_1 = require("../../components/vertical-axis/vertical-axis");
var vis_measure_label_1 = require("../../components/vis-measure-label/vis-measure-label");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var base_visualization_1 = require("../base-visualization/base-visualization");
require("./bar-chart.scss");
var bar_coordinates_1 = require("./bar-coordinates");
var X_AXIS_HEIGHT = 84;
var Y_AXIS_WIDTH = 60;
var CHART_TOP_PADDING = 10;
var CHART_BOTTOM_PADDING = 0;
var MIN_CHART_HEIGHT = 200;
var MAX_STEP_WIDTH = 140;
var MIN_STEP_WIDTH = 20;
var BAR_PROPORTION = 0.8;
var BARS_MIN_PAD_LEFT = 30;
var BARS_MIN_PAD_RIGHT = 6;
var HOVER_BUBBLE_V_OFFSET = 8;
var SELECTION_PAD = 4;
function getFilterFromDatum(splits, dataPath) {
    return immutable_1.List(dataPath.map(function (datum, i) {
        var _a = splits.getSplit(i), type = _a.type, reference = _a.reference;
        var segment = datum[reference];
        switch (type) {
            case split_1.SplitType.number:
                return new filter_clause_1.NumberFilterClause({ reference: reference, values: immutable_1.List.of(segment) });
            case split_1.SplitType.time:
                return new filter_clause_1.FixedTimeFilterClause({ reference: reference, values: immutable_1.List.of(new date_range_1.DateRange(segment)) });
            case split_1.SplitType.string:
                return new filter_clause_1.StringFilterClause({ reference: reference, action: filter_clause_1.StringFilterAction.IN, values: immutable_1.Set.of(segment) });
        }
    }));
}
function padDataset(originalDataset, dimension, measures) {
    var data = originalDataset.data[0][constants_1.SPLIT].data;
    var dimensionName = dimension.name;
    var firstBucket = data[0][dimensionName];
    if (!firstBucket)
        return originalDataset;
    var start = Number(firstBucket.start);
    var end = Number(firstBucket.end);
    var size = end - start;
    var i = start;
    var j = 0;
    var filledData = [];
    data.forEach(function (d) {
        var segmentValue = d[dimensionName];
        var segmentStart = segmentValue.start;
        while (i < segmentStart) {
            filledData[j] = {};
            filledData[j][dimensionName] = plywood_1.NumberRange.fromJS({
                start: i,
                end: i + size
            });
            measures.forEach(function (m) {
                filledData[j][m.name] = 0;
            });
            if (d[constants_1.SPLIT]) {
                filledData[j][constants_1.SPLIT] = new plywood_1.Dataset({
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
    var value = originalDataset.valueOf();
    value.data[0][constants_1.SPLIT].data = filledData;
    return new plywood_1.Dataset(value);
}
var BarChart = (function (_super) {
    __extends(BarChart, _super);
    function BarChart() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = bar_chart_1.BAR_CHART_MANIFEST.name;
        _this.coordinatesCache = [];
        _this.scroller = React.createRef();
        _this.onScrollerScroll = function (scrollTop, scrollLeft) {
            _this.setState({
                hoverInfo: null,
                scrollLeft: scrollLeft,
                scrollTop: scrollTop
            });
        };
        _this.onMouseMove = function (x, y) {
            _this.setState({ hoverInfo: _this.calculateMousePosition(x, y) });
        };
        _this.onMouseLeave = function () {
            _this.setState({ hoverInfo: null });
        };
        _this.onClick = function (x, y) {
            var essence = _this.props.essence;
            var selectionInfo = _this.calculateMousePosition(x, y);
            if (!selectionInfo)
                return;
            if (!selectionInfo.coordinates) {
                _this.dropHighlight();
                _this.setState({ selectionInfo: null });
                return;
            }
            var path = selectionInfo.path, chartIndex = selectionInfo.chartIndex;
            var splits = essence.splits;
            var series = essence.getConcreteSeries();
            var rowHighlight = getFilterFromDatum(splits, path);
            var currentSeries = series.get(chartIndex).definition;
            if (_this.highlightOn(currentSeries.key())) {
                var delta = _this.getHighlightClauses();
                if (rowHighlight.equals(delta)) {
                    _this.dropHighlight();
                    _this.setState({ selectionInfo: null });
                    return;
                }
            }
            _this.setState({ selectionInfo: selectionInfo });
            _this.highlight(rowHighlight, series.get(chartIndex).definition.key());
        };
        return _this;
    }
    BarChart.prototype.getDefaultState = function () {
        return __assign({ hoverInfo: null, maxNumberOfLeaves: [], flatData: [] }, _super.prototype.getDefaultState.call(this));
    };
    BarChart.prototype.componentDidUpdate = function () {
        var _a = this.state, scrollerYPosition = _a.scrollerYPosition, scrollerXPosition = _a.scrollerXPosition;
        var scrollerComponent = this.scroller.current;
        if (!scrollerComponent)
            return;
        var rect = scrollerComponent.scroller.current.getBoundingClientRect();
        if (scrollerYPosition !== rect.top || scrollerXPosition !== rect.left) {
            this.setState({ scrollerYPosition: rect.top, scrollerXPosition: rect.left });
        }
    };
    BarChart.prototype.calculateMousePosition = function (x, y) {
        var essence = this.props.essence;
        var series = essence.getConcreteSeries();
        var chartStage = this.getSingleChartStage();
        var chartHeight = this.getOuterChartHeight(chartStage);
        if (y >= chartHeight * series.size)
            return null;
        if (x >= chartStage.width)
            return null;
        var xScale = this.getPrimaryXScale();
        var chartIndex = Math.floor(y / chartHeight);
        var chartCoordinates = this.getBarsCoordinates(chartIndex, xScale);
        var _a = this.findBarCoordinatesForX(x, chartCoordinates, []), path = _a.path, coordinates = _a.coordinates;
        return {
            path: this.findPathForIndices(path),
            series: series.get(chartIndex),
            chartIndex: chartIndex,
            coordinates: coordinates
        };
    };
    BarChart.prototype.findPathForIndices = function (indices) {
        var datasetLoad = this.state.datasetLoad;
        if (!visualization_props_1.isLoaded(datasetLoad))
            return null;
        var mySplitDataset = datasetLoad.dataset.data[0][constants_1.SPLIT];
        var path = [];
        var currentData = mySplitDataset;
        indices.forEach(function (i) {
            var datum = currentData.data[i];
            path.push(datum);
            currentData = datum[constants_1.SPLIT];
        });
        return path;
    };
    BarChart.prototype.findBarCoordinatesForX = function (x, coordinates, currentPath) {
        for (var i = 0; i < coordinates.length; i++) {
            if (coordinates[i].isXWithin(x)) {
                currentPath.push(i);
                if (coordinates[i].hasChildren()) {
                    return this.findBarCoordinatesForX(x, coordinates[i].children, currentPath);
                }
                else {
                    return { path: currentPath, coordinates: coordinates[i] };
                }
            }
        }
        return { path: [], coordinates: null };
    };
    BarChart.prototype.getYExtent = function (data, series) {
        var getY = function (d) { return series.selectValue(d); };
        return d3.extent(data, getY);
    };
    BarChart.prototype.getYScale = function (series, yAxisStage) {
        var essence = this.props.essence;
        var flatData = this.state.flatData;
        var splitLength = essence.splits.length();
        var leafData = flatData.filter(function (d) { return d["__nest"] === splitLength - 1; });
        var extentY = this.getYExtent(leafData, series);
        return d3.scale.linear()
            .domain([Math.min(extentY[0] * 1.1, 0), Math.max(extentY[1] * 1.1, 0)])
            .range([yAxisStage.height, yAxisStage.y]);
    };
    BarChart.prototype.hasValidYExtent = function (series, data) {
        var _a = this.getYExtent(data, series), yMin = _a[0], yMax = _a[1];
        return !isNaN(yMin) && !isNaN(yMax);
    };
    BarChart.prototype.getSingleChartStage = function () {
        var xScale = this.getPrimaryXScale();
        var _a = this.props, essence = _a.essence, stage = _a.stage;
        var stepWidth = this.getBarDimensions(xScale.rangeBand()).stepWidth;
        var xTicks = xScale.domain();
        var width = xTicks.length > 0 ? dom_1.roundToPx(xScale(xTicks[xTicks.length - 1])) + stepWidth : 0;
        var measures = essence.getConcreteSeries();
        var availableHeight = stage.height - X_AXIS_HEIGHT;
        var height = Math.max(MIN_CHART_HEIGHT, Math.floor(availableHeight / measures.size));
        return new stage_1.Stage({
            x: 0,
            y: CHART_TOP_PADDING,
            width: Math.max(width, stage.width - Y_AXIS_WIDTH - constants_1.VIS_H_PADDING * 2),
            height: height - CHART_TOP_PADDING - CHART_BOTTOM_PADDING
        });
    };
    BarChart.prototype.getOuterChartHeight = function (chartStage) {
        return chartStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING;
    };
    BarChart.prototype.getAxisStages = function (chartStage) {
        var _a = this.props, essence = _a.essence, stage = _a.stage;
        var xHeight = Math.max(stage.height - (CHART_TOP_PADDING + CHART_BOTTOM_PADDING + chartStage.height) * essence.getConcreteSeries().size, X_AXIS_HEIGHT);
        return {
            xAxisStage: new stage_1.Stage({ x: chartStage.x, y: 0, height: xHeight, width: chartStage.width }),
            yAxisStage: new stage_1.Stage({ x: 0, y: chartStage.y, height: chartStage.height, width: Y_AXIS_WIDTH + constants_1.VIS_H_PADDING })
        };
    };
    BarChart.prototype.getScrollerLayout = function (chartStage, xAxisStage, yAxisStage) {
        var essence = this.props.essence;
        var measures = essence.getConcreteSeries().toArray();
        var oneChartHeight = this.getOuterChartHeight(chartStage);
        return {
            bodyWidth: chartStage.width,
            bodyHeight: oneChartHeight * measures.length - CHART_BOTTOM_PADDING,
            top: 0,
            right: yAxisStage.width,
            bottom: xAxisStage.height,
            left: 0
        };
    };
    BarChart.prototype.getBubbleTopOffset = function (y, chartIndex, chartStage) {
        var _a = this.state, scrollTop = _a.scrollTop, scrollerYPosition = _a.scrollerYPosition;
        var oneChartHeight = this.getOuterChartHeight(chartStage);
        var chartsAboveMe = oneChartHeight * chartIndex;
        return chartsAboveMe - scrollTop + scrollerYPosition + y - HOVER_BUBBLE_V_OFFSET + CHART_TOP_PADDING;
    };
    BarChart.prototype.getBubbleLeftOffset = function (x) {
        var _a = this.state, scrollLeft = _a.scrollLeft, scrollerXPosition = _a.scrollerXPosition;
        return scrollerXPosition + x - scrollLeft;
    };
    BarChart.prototype.canShowBubble = function (leftOffset, topOffset) {
        var stage = this.props.stage;
        var _a = this.state, scrollerYPosition = _a.scrollerYPosition, scrollerXPosition = _a.scrollerXPosition;
        if (topOffset <= 0)
            return false;
        if (topOffset > scrollerYPosition + stage.height - X_AXIS_HEIGHT)
            return false;
        if (leftOffset <= 0)
            return false;
        if (leftOffset > scrollerXPosition + stage.width - Y_AXIS_WIDTH)
            return false;
        return true;
    };
    BarChart.prototype.renderSelectionBubble = function (hoverInfo) {
        var series = hoverInfo.series, path = hoverInfo.path, chartIndex = hoverInfo.chartIndex, segmentLabel = hoverInfo.segmentLabel, coordinates = hoverInfo.coordinates;
        var chartStage = this.getSingleChartStage();
        var leftOffset = this.getBubbleLeftOffset(coordinates.middleX);
        var topOffset = this.getBubbleTopOffset(coordinates.y, chartIndex, chartStage);
        if (!this.canShowBubble(leftOffset, topOffset))
            return null;
        var segmentValue = series.formatValue(path[path.length - 1]);
        return React.createElement(highlight_modal_1.HighlightModal, { left: leftOffset, top: topOffset, dropHighlight: this.dropHighlight, acceptHighlight: this.acceptHighlight, title: segmentLabel }, segmentValue);
    };
    BarChart.prototype.renderHoverBubble = function (hoverInfo) {
        var chartStage = this.getSingleChartStage();
        var series = hoverInfo.series, path = hoverInfo.path, chartIndex = hoverInfo.chartIndex, segmentLabel = hoverInfo.segmentLabel, coordinates = hoverInfo.coordinates;
        var essence = this.props.essence;
        var leftOffset = this.getBubbleLeftOffset(coordinates.middleX);
        var topOffset = this.getBubbleTopOffset(coordinates.y, chartIndex, chartStage);
        if (!this.canShowBubble(leftOffset, topOffset))
            return null;
        var measureContent = this.renderMeasureLabel(path[path.length - 1], series);
        return React.createElement(segment_bubble_1.SegmentBubble, { top: topOffset, left: leftOffset, title: segmentLabel, content: measureContent });
    };
    BarChart.prototype.renderMeasureLabel = function (datum, series) {
        if (!this.props.essence.hasComparison()) {
            return series.formatValue(datum);
        }
        var currentValue = series.selectValue(datum);
        var previousValue = series.selectValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS);
        var formatter = series.formatter();
        return React.createElement(measure_bubble_content_1.MeasureBubbleContent, { lowerIsBetter: series.measure.lowerIsBetter, formatter: formatter, current: currentValue, previous: previousValue });
    };
    BarChart.prototype.isSelected = function (path, series) {
        var essence = this.props.essence;
        var splits = essence.splits;
        return this.highlightOn(series.key()) && this.getHighlightClauses().equals(getFilterFromDatum(splits, path));
    };
    BarChart.prototype.isFaded = function () {
        return this.hasHighlight();
    };
    BarChart.prototype.hasAnySelectionGoingOn = function () {
        return this.hasHighlight();
    };
    BarChart.prototype.isHovered = function (path, series) {
        var essence = this.props.essence;
        var hoverInfo = this.state.hoverInfo;
        var splits = essence.splits;
        if (this.hasAnySelectionGoingOn())
            return false;
        if (!hoverInfo)
            return false;
        if (!hoverInfo.series.equals(series))
            return false;
        var filter = function (path) { return getFilterFromDatum(splits, path); };
        return filter(hoverInfo.path).equals(filter(path));
    };
    BarChart.prototype.renderBars = function (data, series, chartIndex, chartStage, xAxisStage, coordinates, splitIndex, path) {
        var _this = this;
        if (splitIndex === void 0) { splitIndex = 0; }
        if (path === void 0) { path = []; }
        var essence = this.props.essence;
        var timezone = essence.timezone;
        var bars = [];
        var highlight;
        var dimension = essence.dataCube.getDimension(essence.splits.splits.get(splitIndex).reference);
        var splitLength = essence.splits.length();
        data.forEach(function (d, i) {
            var segmentValue = d[dimension.name];
            var segmentValueStr = formatter_1.formatValue(segmentValue, timezone);
            var subPath = path.concat(d);
            var bar;
            var bubble = null;
            var subCoordinates = coordinates[i];
            var _a = coordinates[i], x = _a.x, y = _a.y, height = _a.height, barWidth = _a.barWidth, barOffset = _a.barOffset;
            if (splitIndex < splitLength - 1) {
                var subData = d[constants_1.SPLIT].data;
                var subRender = _this.renderBars(subData, series, chartIndex, chartStage, xAxisStage, subCoordinates.children, splitIndex + 1, subPath);
                bar = subRender.bars;
                if (!highlight && subRender.highlight)
                    highlight = subRender.highlight;
            }
            else {
                var bubbleInfo = {
                    series: series,
                    chartIndex: chartIndex,
                    path: subPath,
                    coordinates: subCoordinates,
                    segmentLabel: segmentValueStr,
                    splitIndex: splitIndex
                };
                var isHovered = _this.isHovered(subPath, series);
                if (isHovered) {
                    bubble = _this.renderHoverBubble(bubbleInfo);
                }
                var selected = _this.isSelected(subPath, series.definition);
                var faded = _this.isFaded();
                if (selected) {
                    bubble = _this.renderSelectionBubble(bubbleInfo);
                    if (bubble)
                        highlight = _this.renderSelectionHighlight(chartStage, subCoordinates, chartIndex);
                }
                bar = React.createElement("g", { className: dom_1.classNames("bar", { "selected": selected, "not-selected": (!selected && faded), isHovered: isHovered }), key: String(segmentValue), transform: "translate(" + dom_1.roundToPx(x) + ", 0)" },
                    React.createElement("rect", { className: "background", width: dom_1.roundToPx(barWidth), height: dom_1.roundToPx(Math.abs(height)), x: barOffset, y: dom_1.roundToPx(y) }),
                    bubble);
            }
            bars.push(bar);
        });
        return { bars: bars, highlight: highlight };
    };
    BarChart.prototype.renderSelectionHighlight = function (chartStage, coordinates, chartIndex) {
        var _a = this.state, scrollLeft = _a.scrollLeft, scrollTop = _a.scrollTop;
        var chartHeight = this.getOuterChartHeight(chartStage);
        var barWidth = coordinates.barWidth, height = coordinates.height, barOffset = coordinates.barOffset, y = coordinates.y, x = coordinates.x;
        var leftOffset = dom_1.roundToPx(x) + barOffset - SELECTION_PAD + chartStage.x - scrollLeft;
        var topOffset = dom_1.roundToPx(y) - SELECTION_PAD + chartStage.y - scrollTop + chartHeight * chartIndex;
        var style = {
            left: leftOffset,
            top: topOffset,
            width: dom_1.roundToPx(barWidth + SELECTION_PAD * 2),
            height: dom_1.roundToPx(Math.abs(height) + SELECTION_PAD * 2)
        };
        return React.createElement("div", { className: "selection-highlight", style: style });
    };
    BarChart.prototype.renderXAxis = function (data, coordinates, xAxisStage) {
        var essence = this.props.essence;
        var xScale = this.getPrimaryXScale();
        var xTicks = xScale.domain();
        var split = essence.splits.splits.first();
        var dimension = essence.dataCube.getDimension(split.reference);
        var labels = [];
        if (dimension.canBucketByDefault()) {
            var lastIndex_1 = data.length - 1;
            var ascending = split.sort.direction === sort_1.SortDirection.ascending;
            var leftThing_1 = ascending ? "start" : "end";
            var rightThing_1 = ascending ? "end" : "start";
            data.forEach(function (d, i) {
                var segmentValue = d[dimension.name];
                var segmentValueStr = String(plywood_1.Range.isRange(segmentValue) ? segmentValue[leftThing_1] : "");
                var coordinate = coordinates[i];
                labels.push(React.createElement("div", { className: "slanty-label continuous", key: i, style: { right: xAxisStage.width - coordinate.x } }, segmentValueStr));
                if (i === lastIndex_1) {
                    segmentValueStr = String(plywood_1.Range.isRange(segmentValue) ? segmentValue[rightThing_1] : "");
                    labels.push(React.createElement("div", { className: "slanty-label continuous", key: "last-one", style: { right: xAxisStage.width - (coordinate.x + coordinate.stepWidth) } }, segmentValueStr));
                }
            });
        }
        else {
            data.forEach(function (d, i) {
                var segmentValueStr = String(d[dimension.name]);
                var coordinate = coordinates[i];
                labels.push(React.createElement("div", { className: "slanty-label categorical", key: segmentValueStr, style: { right: xAxisStage.width - (coordinate.x + coordinate.stepWidth / 2) } }, segmentValueStr));
            });
        }
        return React.createElement("div", { className: "x-axis", style: { width: xAxisStage.width } },
            React.createElement("svg", { style: xAxisStage.getWidthHeight(), viewBox: xAxisStage.getViewBox() },
                React.createElement(bucket_marks_1.BucketMarks, { stage: xAxisStage, ticks: xTicks, scale: xScale })),
            labels);
    };
    BarChart.prototype.getYAxisStuff = function (dataset, series, chartStage, chartIndex) {
        var yAxisStage = this.getAxisStages(chartStage).yAxisStage;
        var yScale = this.getYScale(series, yAxisStage);
        var yTicks = yScale.ticks(5);
        var yGridLines = React.createElement(grid_lines_1.GridLines, { orientation: "horizontal", scale: yScale, ticks: yTicks, stage: chartStage });
        var axisStage = yAxisStage.changeY(yAxisStage.y + (chartStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING) * chartIndex);
        var yAxis = React.createElement(vertical_axis_1.VerticalAxis, { formatter: series.formatter(), key: series.reactKey(), stage: axisStage, ticks: yTicks, tickSize: 5, scale: yScale, hideZero: true });
        return { yGridLines: yGridLines, yAxis: yAxis, yScale: yScale };
    };
    BarChart.prototype.isChartVisible = function (chartIndex, xAxisStage) {
        var stage = this.props.stage;
        var scrollTop = this.state.scrollTop;
        var chartStage = this.getSingleChartStage();
        var chartHeight = this.getOuterChartHeight(chartStage);
        var topY = chartIndex * chartHeight;
        var viewPortHeight = stage.height - xAxisStage.height;
        var hiddenAtBottom = topY - scrollTop >= viewPortHeight;
        var bottomY = topY + chartHeight;
        var hiddenAtTop = bottomY < scrollTop;
        return !hiddenAtTop && !hiddenAtBottom;
    };
    BarChart.prototype.renderChart = function (dataset, coordinates, series, chartIndex, chartStage) {
        var essence = this.props.essence;
        var mySplitDataset = dataset.data[0][constants_1.SPLIT];
        var measureLabel = React.createElement(vis_measure_label_1.VisMeasureLabel, { series: series, datum: dataset.data[0], showPrevious: essence.hasComparison() });
        if (!this.hasValidYExtent(series, mySplitDataset.data)) {
            return {
                chart: React.createElement("div", { className: "measure-bar-chart", key: series.reactKey(), style: { width: chartStage.width } },
                    React.createElement("svg", { style: chartStage.getWidthHeight(0, CHART_BOTTOM_PADDING), viewBox: chartStage.getViewBox(0, CHART_BOTTOM_PADDING) }),
                    measureLabel),
                yAxis: null,
                highlight: null
            };
        }
        var xAxisStage = this.getAxisStages(chartStage).xAxisStage;
        var _a = this.getYAxisStuff(mySplitDataset, series, chartStage, chartIndex), yAxis = _a.yAxis, yGridLines = _a.yGridLines;
        var bars;
        var highlight;
        if (this.isChartVisible(chartIndex, xAxisStage)) {
            var renderedChart = this.renderBars(mySplitDataset.data, series, chartIndex, chartStage, xAxisStage, coordinates);
            bars = renderedChart.bars;
            highlight = renderedChart.highlight;
        }
        var chart = React.createElement("div", { className: "measure-bar-chart", key: series.reactKey(), style: { width: chartStage.width } },
            React.createElement("svg", { style: chartStage.getWidthHeight(0, CHART_BOTTOM_PADDING), viewBox: chartStage.getViewBox(0, CHART_BOTTOM_PADDING) },
                yGridLines,
                React.createElement("g", { className: "bars", transform: chartStage.getTransform() }, bars)),
            measureLabel);
        return { chart: chart, yAxis: yAxis, highlight: highlight };
    };
    BarChart.prototype.deriveDatasetState = function (dataset) {
        var essence = this.props.essence;
        var splits = essence.splits;
        this.coordinatesCache = [];
        if (!splits.length())
            return {};
        var split = splits.splits.first();
        var dimension = essence.dataCube.getDimension(split.reference);
        var dimensionKind = dimension.kind;
        var series = essence.getConcreteSeries().toArray();
        var paddedDataset = dimensionKind === "number" ? padDataset(dataset, dimension, series.map(function (s) { return s.measure; })) : dataset;
        var firstSplitDataSet = paddedDataset.data[0][constants_1.SPLIT];
        var flattened = firstSplitDataSet.flatten({
            order: "preorder",
            nestingName: "__nest"
        });
        var maxNumberOfLeaves = splits.splits.map(function () { return 0; }).toArray();
        this.maxNumberOfLeaves(firstSplitDataSet.data, maxNumberOfLeaves, 0);
        var flatData = flattened.data;
        return { maxNumberOfLeaves: maxNumberOfLeaves, flatData: flatData };
    };
    BarChart.prototype.maxNumberOfLeaves = function (data, maxima, level) {
        maxima[level] = Math.max(maxima[level], data.length);
        if (data[0] && data[0][constants_1.SPLIT] !== undefined) {
            var n = data.length;
            for (var i = 0; i < n; i++) {
                this.maxNumberOfLeaves(data[i][constants_1.SPLIT].data, maxima, level + 1);
            }
        }
    };
    BarChart.prototype.getPrimaryXScale = function () {
        var _a = this.state, datasetLoad = _a.datasetLoad, maxNumberOfLeaves = _a.maxNumberOfLeaves;
        if (!visualization_props_1.isLoaded(datasetLoad))
            return null;
        var data = datasetLoad.dataset.data[0][constants_1.SPLIT].data;
        var essence = this.props.essence;
        var splits = essence.splits, dataCube = essence.dataCube;
        var firstSplit = splits.splits.first();
        var dimension = dataCube.getDimension(firstSplit.reference);
        var getX = function (d) { return d[dimension.name]; };
        var _b = this.getXValues(maxNumberOfLeaves), usedWidth = _b.usedWidth, padLeft = _b.padLeft;
        return d3.scale.ordinal()
            .domain(data.map(getX))
            .rangeBands([padLeft, padLeft + usedWidth]);
    };
    BarChart.prototype.getBarDimensions = function (xRangeBand) {
        if (isNaN(xRangeBand))
            xRangeBand = 0;
        var stepWidth = xRangeBand;
        var barWidth = Math.max(stepWidth * BAR_PROPORTION, 0);
        var barOffset = (stepWidth - barWidth) / 2;
        return { stepWidth: stepWidth, barWidth: barWidth, barOffset: barOffset };
    };
    BarChart.prototype.getXValues = function (maxNumberOfLeaves) {
        var _a = this.props, essence = _a.essence, stage = _a.stage;
        var overallWidth = stage.width - constants_1.VIS_H_PADDING * 2 - Y_AXIS_WIDTH;
        var numPrimarySteps = maxNumberOfLeaves[0];
        var minStepWidth = MIN_STEP_WIDTH * maxNumberOfLeaves.slice(1).reduce((function (a, b) { return a * b; }), 1);
        var maxAvailableWidth = overallWidth - BARS_MIN_PAD_LEFT - BARS_MIN_PAD_RIGHT;
        var stepWidth;
        if (minStepWidth * numPrimarySteps < maxAvailableWidth) {
            stepWidth = Math.max(Math.min(maxAvailableWidth / numPrimarySteps, MAX_STEP_WIDTH * essence.splits.length()), MIN_STEP_WIDTH);
        }
        else {
            stepWidth = minStepWidth;
        }
        var usedWidth = stepWidth * maxNumberOfLeaves[0];
        var padLeft = Math.max(BARS_MIN_PAD_LEFT, (overallWidth - usedWidth) / 2);
        return { padLeft: padLeft, usedWidth: usedWidth };
    };
    BarChart.prototype.getBarsCoordinates = function (chartIndex, xScale) {
        if (!!this.coordinatesCache[chartIndex]) {
            return this.coordinatesCache[chartIndex];
        }
        var datasetLoad = this.state.datasetLoad;
        if (!visualization_props_1.isLoaded(datasetLoad))
            return null;
        var dataset = datasetLoad.dataset.data[0][constants_1.SPLIT];
        var essence = this.props.essence;
        var splits = essence.splits, dataCube = essence.dataCube;
        var series = essence.getConcreteSeries().get(chartIndex);
        var firstSplit = splits.splits.first();
        var dimension = dataCube.getDimension(firstSplit.reference);
        var chartStage = this.getSingleChartStage();
        var yScale = this.getYScale(series, this.getAxisStages(chartStage).yAxisStage);
        this.coordinatesCache[chartIndex] = this.getSubCoordinates(dataset.data, series, chartStage, function (d) { return d[dimension.name]; }, xScale, yScale);
        return this.coordinatesCache[chartIndex];
    };
    BarChart.prototype.getSubCoordinates = function (data, series, chartStage, getX, xScale, scaleY, splitIndex) {
        var _this = this;
        if (splitIndex === void 0) { splitIndex = 1; }
        var essence = this.props.essence;
        var maxNumberOfLeaves = this.state.maxNumberOfLeaves;
        var _a = this.getBarDimensions(xScale.rangeBand()), stepWidth = _a.stepWidth, barWidth = _a.barWidth, barOffset = _a.barOffset;
        var coordinates = data.map(function (d, i) {
            var x = xScale(getX(d, i));
            var y = scaleY(series.selectValue(d));
            var h = scaleY(0) - y;
            var children = [];
            var coordinate = new bar_coordinates_1.BarCoordinates({
                x: x,
                y: h >= 0 ? y : scaleY(0),
                width: dom_1.roundToPx(barWidth),
                height: dom_1.roundToPx(Math.abs(h)),
                stepWidth: stepWidth,
                barWidth: barWidth,
                barOffset: barOffset,
                children: children
            });
            if (splitIndex < essence.splits.length()) {
                var subStage = new stage_1.Stage({ x: x, y: chartStage.y, width: barWidth, height: chartStage.height });
                var subGetX = function (d, i) { return String(i); };
                var subData = d[constants_1.SPLIT].data;
                var subxScale = d3.scale.ordinal()
                    .domain(d3.range(0, maxNumberOfLeaves[splitIndex]).map(String))
                    .rangeBands([x + barOffset, x + subStage.width]);
                coordinate.children = _this.getSubCoordinates(subData, series, subStage, subGetX, subxScale, scaleY, splitIndex + 1);
            }
            return coordinate;
        });
        return coordinates;
    };
    BarChart.prototype.renderRightGutter = function (seriesCount, yAxisStage, yAxes) {
        var yAxesStage = yAxisStage.changeHeight((yAxisStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING) * seriesCount);
        return React.createElement("svg", { style: yAxesStage.getWidthHeight(), viewBox: yAxesStage.getViewBox() }, yAxes);
    };
    BarChart.prototype.renderSelectionContainer = function (selectionHighlight, chartIndex, chartStage) {
        return React.createElement("div", { className: "selection-highlight-container" }, selectionHighlight);
    };
    BarChart.prototype.renderInternals = function (dataset) {
        var _this = this;
        var _a = this.props, essence = _a.essence, stage = _a.stage;
        var splits = essence.splits;
        var scrollerLayout;
        var measureCharts = [];
        var xAxis;
        var rightGutter;
        var overlay;
        if (splits.length()) {
            var xScale_1 = this.getPrimaryXScale();
            var yAxes_1 = [];
            var series = essence.getConcreteSeries();
            var chartStage_1 = this.getSingleChartStage();
            var _b = this.getAxisStages(chartStage_1), xAxisStage = _b.xAxisStage, yAxisStage = _b.yAxisStage;
            xAxis = this.renderXAxis(dataset.data[0][constants_1.SPLIT].data, this.getBarsCoordinates(0, xScale_1), xAxisStage);
            series.forEach(function (series, chartIndex) {
                var coordinates = _this.getBarsCoordinates(chartIndex, xScale_1);
                var _a = _this.renderChart(dataset, coordinates, series, chartIndex, chartStage_1), yAxis = _a.yAxis, chart = _a.chart, highlight = _a.highlight;
                measureCharts.push(chart);
                yAxes_1.push(yAxis);
                if (highlight) {
                    overlay = _this.renderSelectionContainer(highlight, chartIndex, chartStage_1);
                }
            });
            scrollerLayout = this.getScrollerLayout(chartStage_1, xAxisStage, yAxisStage);
            rightGutter = this.renderRightGutter(series.count(), chartStage_1, yAxes_1);
        }
        return React.createElement("div", { className: "internals measure-bar-charts", style: { maxHeight: stage.height } },
            React.createElement(scroller_1.Scroller, { layout: scrollerLayout, ref: this.scroller, bottomGutter: xAxis, rightGutter: rightGutter, body: measureCharts, overlay: overlay, onClick: this.onClick, onMouseMove: this.onMouseMove, onMouseLeave: this.onMouseLeave, onScroll: this.onScrollerScroll }));
    };
    return BarChart;
}(base_visualization_1.BaseVisualization));
exports.BarChart = BarChart;
//# sourceMappingURL=bar-chart.js.map