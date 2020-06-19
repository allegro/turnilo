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
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var React = require("react");
var formatter_1 = require("../../../common/utils/formatter/formatter");
var scroller_1 = require("../../components/scroller/scroller");
var dom_1 = require("../../utils/dom/dom");
require("./heat-map.scss");
var heatmap_corner_1 = require("./heatmap-corner");
var heatmap_highlight_indicator_1 = require("./heatmap-highlight-indicator");
var heatmap_highlight_modal_1 = require("./heatmap-highlight-modal");
var heatmap_hover_indicator_1 = require("./heatmap-hover-indicator");
var heatmap_hover_tooltip_1 = require("./heatmap-hover-tooltip");
var heatmap_labels_1 = require("./heatmap-labels");
var heatmap_rectangles_1 = require("./heatmap-rectangles");
var create_highlight_clauses_1 = require("./utils/create-highlight-clauses");
var get_highlight_position_1 = require("./utils/get-highlight-position");
var get_hover_position_1 = require("./utils/get-hover-position");
var modal_title_1 = require("./utils/modal-title");
var nested_dataset_1 = require("./utils/nested-dataset");
var scroller_layout_1 = require("./utils/scroller-layout");
exports.TILE_SIZE = 25;
exports.TILE_GAP = 2;
exports.MIN_LEFT_LABELS_WIDTH = 100;
exports.MAX_LEFT_LABELS_WIDTH = 200;
exports.MIN_TOP_LABELS_HEIGHT = 100;
exports.MAX_TOP_LABELS_HEIGHT = 150;
function formatSegments(dataset, fieldName, timezone) {
    return dataset.map(function (datum) { return formatter_1.formatSegment(datum[fieldName], timezone); });
}
var LabelledHeatmap = (function (_super) {
    __extends(LabelledHeatmap, _super);
    function LabelledHeatmap() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            hoverPosition: null,
            leftLabelsWidth: 0,
            topLabelsHeight: 0,
            scrollLeft: 0,
            scrollTop: 0
        };
        _this.saveHover = function (x, y, part) {
            var _a = _this.props, xScale = _a.xScale, yScale = _a.yScale;
            var hoverPosition = get_hover_position_1.default(xScale, yScale, x, y, part, _this.layout());
            _this.setState({ hoverPosition: hoverPosition });
        };
        _this.resetHover = function () { return _this.setState({ hoverPosition: null }); };
        _this.saveScroll = function (scrollTop, scrollLeft) { return _this.setState({ scrollLeft: scrollLeft, scrollTop: scrollTop }); };
        _this.saveLeftLabelWidth = function (maxLabelWidth) { return _this.setState({ leftLabelsWidth: dom_1.clamp(maxLabelWidth, exports.MIN_LEFT_LABELS_WIDTH, exports.MAX_LEFT_LABELS_WIDTH) }); };
        _this.saveTopLabelHeight = function (maxLabelHeight) { return _this.setState({ topLabelsHeight: dom_1.clamp(maxLabelHeight, exports.MIN_TOP_LABELS_HEIGHT, exports.MAX_TOP_LABELS_HEIGHT) }); };
        _this.handleHighlight = function (x, y, part) {
            if (!create_highlight_clauses_1.isClickablePart(part))
                return;
            var _a = _this.props, saveHighlight = _a.saveHighlight, essence = _a.essence, dataset = _a.dataset;
            var layout = _this.layout();
            var clauses = create_highlight_clauses_1.default({ x: x - layout.left, y: y - layout.top, part: part }, essence, dataset);
            if (clauses.length > 0) {
                saveHighlight(immutable_1.List(clauses));
            }
        };
        return _this;
    }
    LabelledHeatmap.prototype.layout = function () {
        var _a = this.state, topLabelsHeight = _a.topLabelsHeight, leftLabelsWidth = _a.leftLabelsWidth;
        var dataset = this.props.dataset;
        return scroller_layout_1.default(dataset, topLabelsHeight, leftLabelsWidth);
    };
    LabelledHeatmap.prototype.render = function () {
        var _a = this.props, stage = _a.stage, colorScale = _a.colorScale, xScale = _a.xScale, yScale = _a.yScale, dataset = _a.dataset, essence = _a.essence, highlight = _a.highlight, acceptHighlight = _a.acceptHighlight, dropHighlight = _a.dropHighlight;
        var _b = this.state, scrollLeft = _b.scrollLeft, scrollTop = _b.scrollTop, hoverPosition = _b.hoverPosition, topLabelsHeight = _b.topLabelsHeight;
        var series = essence.getConcreteSeries().first();
        var splits = essence.splits.splits, timezone = essence.timezone;
        var firstSplit = splits.get(0);
        var secondSplit = splits.get(1);
        var leftLabels = formatSegments(dataset, firstSplit.reference, timezone);
        var topLabels = formatSegments(nested_dataset_1.nestedDataset(dataset[0]), secondSplit.reference, timezone);
        var highlightPosition = get_highlight_position_1.default(highlight, essence, dataset);
        var layout = this.layout();
        return React.createElement(React.Fragment, null,
            React.createElement(scroller_1.Scroller, { onClick: this.handleHighlight, onMouseMove: this.saveHover, onMouseLeave: this.resetHover, onScroll: this.saveScroll, layout: layout, topLeftCorner: React.createElement(heatmap_corner_1.HeatmapCorner, { colorScale: colorScale, width: layout.left, height: layout.top, essence: essence }), topGutter: React.createElement(heatmap_labels_1.HeatmapLabels, { orientation: "top", labels: topLabels, hoveredLabel: hoverPosition ? hoverPosition.column : -1, highlightedLabel: highlightPosition ? highlightPosition.column : -1, onMaxLabelSize: this.saveTopLabelHeight, labelSize: topLabelsHeight }), leftGutter: React.createElement(heatmap_labels_1.HeatmapLabels, { orientation: "left", labels: leftLabels, hoveredLabel: hoverPosition ? hoverPosition.row : -1, highlightedLabel: highlightPosition ? highlightPosition.row : -1, onMaxLabelSize: this.saveLeftLabelWidth }), body: React.createElement(React.Fragment, null,
                    React.createElement(heatmap_rectangles_1.HeatMapRectangles, { key: "heatmap", dataset: dataset, series: series, xScale: xScale, yScale: yScale, colorScale: colorScale, tileSize: exports.TILE_SIZE, gap: exports.TILE_GAP, leftLabelName: firstSplit.reference, topLabelName: secondSplit.reference }),
                    highlightPosition && React.createElement(heatmap_highlight_indicator_1.HeatmapHighlightIndicator, { position: highlightPosition, height: layout.bodyHeight, width: layout.bodyWidth, tileSize: exports.TILE_SIZE, tileGap: exports.TILE_GAP }),
                    hoverPosition && React.createElement(heatmap_hover_indicator_1.HeatmapHoverIndicator, { tileSize: exports.TILE_SIZE, tileGap: exports.TILE_GAP, hoverPosition: hoverPosition })) }),
            highlightPosition && React.createElement(heatmap_highlight_modal_1.HeatmapHighlightModal, { title: modal_title_1.modalTitle(highlightPosition, dataset, essence), position: highlightPosition, stage: stage, layout: layout, scroll: { left: scrollLeft, top: scrollTop }, dropHighlight: dropHighlight, acceptHighlight: acceptHighlight }),
            hoverPosition && React.createElement(heatmap_hover_tooltip_1.HeatmapHoverTooltip, { scroll: { left: scrollLeft, top: scrollTop }, dataset: dataset, position: hoverPosition, essence: essence }));
    };
    return LabelledHeatmap;
}(React.PureComponent));
exports.LabelledHeatmap = LabelledHeatmap;
//# sourceMappingURL=labeled-heatmap.js.map