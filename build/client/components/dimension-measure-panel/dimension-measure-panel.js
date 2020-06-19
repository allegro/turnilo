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
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var dimension_list_tile_1 = require("../dimension-list-tile/dimension-list-tile");
var measures_tile_1 = require("../measures-tile/measures-tile");
var resize_handle_1 = require("../resize-handle/resize-handle");
require("./dimension-measure-panel.scss");
exports.MIN_PANEL_SIZE = 100;
var RESIZE_HANDLE_SIZE = 12;
function dividerConstraints(height) {
    var minDividerPosition = Math.min(exports.MIN_PANEL_SIZE, height);
    var maxDividerPosition = Math.max(height - exports.MIN_PANEL_SIZE, 0);
    return { minDividerPosition: minDividerPosition, maxDividerPosition: maxDividerPosition };
}
function initialPosition(height, dataCube) {
    var dimensionsCount = dataCube.dimensions.size();
    var measuresCount = dataCube.measures.size();
    var ratio = dimensionsCount / (measuresCount + dimensionsCount);
    var _a = dividerConstraints(height), minDividerPosition = _a.minDividerPosition, maxDividerPosition = _a.maxDividerPosition;
    return dom_1.clamp(height * ratio, minDividerPosition, maxDividerPosition);
}
exports.initialPosition = initialPosition;
var DimensionMeasurePanel = (function (_super) {
    __extends(DimensionMeasurePanel, _super);
    function DimensionMeasurePanel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            containerHeight: 2 * exports.MIN_PANEL_SIZE,
            dividerPosition: exports.MIN_PANEL_SIZE
        };
        _this.containerRef = null;
        _this.getInitialState = function (container) {
            if (!container)
                return;
            _this.containerRef = container;
            var containerHeight = _this.containerRef.getBoundingClientRect().height;
            var dividerPosition = initialPosition(containerHeight, _this.props.essence.dataCube);
            _this.setState({ dividerPosition: dividerPosition, containerHeight: containerHeight });
        };
        _this.saveDividerPosition = function (dividerPosition) { return _this.setState({ dividerPosition: dividerPosition }); };
        _this.saveContainerRect = function () { return _this.setState({ containerHeight: _this.containerRef.getBoundingClientRect().height }); };
        return _this;
    }
    DimensionMeasurePanel.prototype.componentDidMount = function () {
        window.addEventListener("resize", this.saveContainerRect);
    };
    DimensionMeasurePanel.prototype.componentWillUnmount = function () {
        window.removeEventListener("resize", this.saveContainerRect);
    };
    DimensionMeasurePanel.prototype.render = function () {
        var _a = this.props, clicker = _a.clicker, essence = _a.essence, menuStage = _a.menuStage, triggerFilterMenu = _a.triggerFilterMenu, appendDirtySeries = _a.appendDirtySeries, style = _a.style;
        var _b = this.state, dividerPosition = _b.dividerPosition, containerHeight = _b.containerHeight;
        var _c = dividerConstraints(containerHeight), maxDividerPosition = _c.maxDividerPosition, minDividerPosition = _c.minDividerPosition;
        var dimensionListStyle = {
            height: dividerPosition
        };
        var measureListStyle = {
            height: containerHeight - dividerPosition - RESIZE_HANDLE_SIZE
        };
        var showResizeHandle = this.containerRef !== null;
        return React.createElement("div", { className: "dimension-measure-panel", style: style },
            React.createElement("div", { ref: this.getInitialState, className: "dimension-measure-panel--container" },
                React.createElement(dimension_list_tile_1.DimensionListTile, { clicker: clicker, essence: essence, menuStage: menuStage, triggerFilterMenu: triggerFilterMenu, style: dimensionListStyle }),
                showResizeHandle &&
                    React.createElement(resize_handle_1.ResizeHandle, { onResize: this.saveDividerPosition, direction: resize_handle_1.Direction.TOP, min: minDividerPosition, max: maxDividerPosition, value: dividerPosition },
                        React.createElement(resize_handle_1.DragHandle, null)),
                React.createElement(measures_tile_1.MeasuresTile, { menuStage: menuStage, style: measureListStyle, clicker: clicker, essence: essence, appendDirtySeries: appendDirtySeries })));
    };
    return DimensionMeasurePanel;
}(React.Component));
exports.DimensionMeasurePanel = DimensionMeasurePanel;
//# sourceMappingURL=dimension-measure-panel.js.map