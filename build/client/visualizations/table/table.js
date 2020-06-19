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
var React = require("react");
var essence_1 = require("../../../common/models/essence/essence");
var sort_1 = require("../../../common/models/sort/sort");
var table_1 = require("../../../common/visualization-manifests/table/table");
var highlight_modal_1 = require("../../components/highlight-modal/highlight-modal");
var resize_handle_1 = require("../../components/resize-handle/resize-handle");
var scroller_1 = require("../../components/scroller/scroller");
var base_visualization_1 = require("../base-visualization/base-visualization");
var measure_rows_1 = require("./body/measures/measure-rows");
var nested_split_name_1 = require("./body/splits/nested-split-name");
var split_rows_1 = require("./body/splits/split-rows");
var measures_header_1 = require("./header/measures/measures-header");
var splits_header_1 = require("./header/splits/splits-header");
var highlight_1 = require("./highlight/highlight");
require("./table.scss");
var calculate_hover_position_1 = require("./utils/calculate-hover-position");
var filter_for_datum_1 = require("./utils/filter-for-datum");
var measure_columns_count_1 = require("./utils/measure-columns-count");
var visible_index_range_1 = require("./utils/visible-index-range");
exports.HEADER_HEIGHT = 38;
exports.INDENT_WIDTH = 25;
exports.ROW_HEIGHT = 30;
exports.SPACE_LEFT = 10;
var HIGHLIGHT_BUBBLE_V_OFFSET = -4;
var SEGMENT_WIDTH = 300;
var MEASURE_WIDTH = 130;
var SPACE_RIGHT = 10;
var MIN_DIMENSION_WIDTH = 100;
var Table = (function (_super) {
    __extends(Table, _super);
    function Table() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = table_1.TABLE_MANIFEST.name;
        _this.innerTableRef = React.createRef();
        _this.onClick = function (x, y, part) {
            var position = _this.calculateMousePosition(x, y, part);
            switch (position.element) {
                case calculate_hover_position_1.HoverElement.CORNER:
                    _this.setSortToDimension();
                    break;
                case calculate_hover_position_1.HoverElement.HEADER:
                    _this.setSortToSeries(position.series, position.period);
                    break;
                case calculate_hover_position_1.HoverElement.ROW:
                    _this.highlightRow(position.datum);
                    break;
            }
        };
        _this.setHoverRow = function (x, y, part) {
            var hoverRow = _this.state.hoverRow;
            var position = _this.calculateMousePosition(x, y, part);
            if (position.element === calculate_hover_position_1.HoverElement.ROW && position.datum !== hoverRow) {
                _this.setState({ hoverRow: position.datum });
            }
        };
        _this.resetHover = function () {
            var hoverRow = _this.state.hoverRow;
            if (hoverRow) {
                _this.setState({ hoverRow: null });
            }
        };
        _this.setScroll = function (scrollTop, scrollLeft) { return _this.setState({ scrollLeft: scrollLeft, scrollTop: scrollTop }); };
        _this.setSegmentWidth = function (segmentWidth) { return _this.setState({ segmentWidth: segmentWidth }); };
        return _this;
    }
    Table.prototype.getDefaultState = function () {
        return __assign({ flatData: null, hoverRow: null, segmentWidth: SEGMENT_WIDTH }, _super.prototype.getDefaultState.call(this));
    };
    Table.prototype.getIdealColumnWidth = function () {
        var availableWidth = this.props.stage.width - exports.SPACE_LEFT - this.getSegmentWidth();
        var count = measure_columns_count_1.measureColumnsCount(this.props.essence);
        return count * MEASURE_WIDTH >= availableWidth ? MEASURE_WIDTH : availableWidth / count;
    };
    Table.prototype.maxSegmentWidth = function () {
        if (this.innerTableRef.current) {
            return this.innerTableRef.current.clientWidth - MIN_DIMENSION_WIDTH;
        }
        return SEGMENT_WIDTH;
    };
    Table.prototype.getSegmentWidth = function () {
        var segmentWidth = this.state.segmentWidth;
        return segmentWidth || SEGMENT_WIDTH;
    };
    Table.prototype.setSortToSeries = function (series, period) {
        var _a = this.props, clicker = _a.clicker, essence = _a.essence;
        var splits = essence.splits;
        var commonSort = essence.getCommonSort();
        var reference = series.key();
        var sort = new sort_1.SeriesSort({ reference: reference, period: period, direction: sort_1.SortDirection.descending });
        var sortWithDirection = commonSort && commonSort.equals(sort) ? sort.set("direction", sort_1.SortDirection.ascending) : sort;
        clicker.changeSplits(splits.changeSort(sortWithDirection), essence_1.VisStrategy.KeepAlways);
    };
    Table.prototype.setSortToDimension = function () {
        var _a = this.props, clicker = _a.clicker, splits = _a.essence.splits;
        clicker.changeSplits(splits.setSortToDimension(), essence_1.VisStrategy.KeepAlways);
    };
    Table.prototype.highlightRow = function (datum) {
        var splits = this.props.essence.splits;
        var rowHighlight = filter_for_datum_1.getFilterFromDatum(splits, datum);
        if (!rowHighlight)
            return;
        var alreadyHighlighted = this.hasHighlight() && rowHighlight.equals(this.getHighlightClauses());
        if (alreadyHighlighted) {
            this.dropHighlight();
            return;
        }
        this.highlight(rowHighlight, null);
    };
    Table.prototype.calculateMousePosition = function (x, y, part) {
        switch (part) {
            case "top-left-corner":
                return { element: calculate_hover_position_1.HoverElement.CORNER };
            case "top-gutter":
                return calculate_hover_position_1.seriesPosition(x, this.props.essence, this.getSegmentWidth(), this.getIdealColumnWidth());
            case "body":
            case "left-gutter":
                return calculate_hover_position_1.rowPosition(y, this.state.flatData);
            default:
                return { element: calculate_hover_position_1.HoverElement.WHITESPACE };
        }
    };
    Table.prototype.flattenOptions = function () {
        if (this.shouldCollapseRows()) {
            return { order: "inline", nestingName: "__nest" };
        }
        return { order: "preorder", nestingName: "__nest" };
    };
    Table.prototype.deriveDatasetState = function (dataset) {
        if (!this.props.essence.splits.length())
            return {};
        var flatDataset = dataset.flatten(this.flattenOptions());
        var flatData = flatDataset.data;
        return { flatData: flatData };
    };
    Table.prototype.getScalesForColumns = function (essence, flatData) {
        var concreteSeries = essence.getConcreteSeries().toArray();
        var splitLength = essence.splits.length();
        return concreteSeries.map(function (series) {
            var measureValues = flatData
                .filter(function (d) { return d["__nest"] === splitLength; })
                .map(function (d) { return series.selectValue(d); });
            return d3.scale.linear()
                .domain(d3.extent([0].concat(measureValues)))
                .range([0, 100]);
        });
    };
    Table.prototype.shouldCollapseRows = function () {
        var visualizationSettings = this.props.essence.visualizationSettings;
        var collapseRows = visualizationSettings.collapseRows;
        return collapseRows;
    };
    Table.prototype.highlightedRowIndex = function (flatData) {
        var _this = this;
        var essence = this.props.essence;
        if (!flatData)
            return null;
        if (!this.hasHighlight())
            return null;
        var splits = essence.splits;
        var index = flatData.findIndex(function (d) { return _this.getHighlightClauses().equals(filter_for_datum_1.getFilterFromDatum(splits, d)); });
        if (index >= 0)
            return index;
        return null;
    };
    Table.prototype.renderInternals = function () {
        var _a = this.props, essence = _a.essence, stage = _a.stage;
        var _b = this.state, flatData = _b.flatData, scrollTop = _b.scrollTop, hoverRow = _b.hoverRow, segmentWidth = _b.segmentWidth;
        var collapseRows = this.shouldCollapseRows();
        var highlightedRowIndex = this.highlightedRowIndex(flatData);
        var columnWidth = this.getIdealColumnWidth();
        var columnsCount = measure_columns_count_1.measureColumnsCount(essence);
        var rowsCount = flatData ? flatData.length : 0;
        var visibleRowsRange = visible_index_range_1.visibleIndexRange(rowsCount, stage.height, scrollTop);
        var showHighlight = highlightedRowIndex !== null && flatData;
        var scrollerLayout = {
            bodyWidth: columnWidth * columnsCount + SPACE_RIGHT,
            bodyHeight: rowsCount * exports.ROW_HEIGHT,
            top: exports.HEADER_HEIGHT,
            right: 0,
            bottom: 0,
            left: this.getSegmentWidth()
        };
        return React.createElement("div", { className: "internals table-inner", ref: this.innerTableRef },
            React.createElement(resize_handle_1.ResizeHandle, { direction: resize_handle_1.Direction.LEFT, onResize: this.setSegmentWidth, min: SEGMENT_WIDTH, max: this.maxSegmentWidth(), value: segmentWidth }),
            React.createElement(scroller_1.Scroller, { ref: "scroller", layout: scrollerLayout, topGutter: React.createElement(measures_header_1.MeasuresHeader, { cellWidth: columnWidth, series: essence.getConcreteSeries().toArray(), commonSort: essence.getCommonSort(), showPrevious: essence.hasComparison() }), leftGutter: React.createElement(split_rows_1.SplitRows, { collapseRows: collapseRows, highlightedRowIndex: highlightedRowIndex, visibleRowsIndexRange: visibleRowsRange, hoverRow: hoverRow, essence: essence, data: flatData, segmentWidth: this.getSegmentWidth() }), topLeftCorner: React.createElement(splits_header_1.SplitsHeader, { essence: essence, collapseRows: collapseRows }), body: flatData &&
                    React.createElement(measure_rows_1.MeasureRows, { hoverRow: hoverRow, visibleRowsIndexRange: visibleRowsRange, essence: essence, highlightedRowIndex: highlightedRowIndex, scales: this.getScalesForColumns(essence, flatData), data: flatData, cellWidth: columnWidth, rowWidth: columnWidth * columnsCount }), overlay: showHighlight && React.createElement(highlight_1.Highlighter, { highlightedIndex: highlightedRowIndex, highlightedNesting: flatData[highlightedRowIndex].__nest, scrollTopOffset: scrollTop, collapseRows: collapseRows }), onClick: this.onClick, onMouseMove: this.setHoverRow, onMouseLeave: this.resetHover, onScroll: this.setScroll }),
            highlightedRowIndex !== null &&
                React.createElement(highlight_modal_1.HighlightModal, { title: nested_split_name_1.nestedSplitName(flatData[highlightedRowIndex], essence), left: stage.x + stage.width / 2, top: stage.y + exports.HEADER_HEIGHT + (highlightedRowIndex * exports.ROW_HEIGHT) - scrollTop - HIGHLIGHT_BUBBLE_V_OFFSET, acceptHighlight: this.acceptHighlight, dropHighlight: this.dropHighlight }));
    };
    return Table;
}(base_visualization_1.BaseVisualization));
exports.Table = Table;
//# sourceMappingURL=table.js.map