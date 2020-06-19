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
var drag_position_1 = require("../../../common/models/drag-position/drag-position");
var measure_series_1 = require("../../../common/models/series/measure-series");
var quantile_series_1 = require("../../../common/models/series/quantile-series");
var series_1 = require("../../../common/models/series/series");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var drag_manager_1 = require("../../utils/drag-manager/drag-manager");
var pill_tile_1 = require("../../utils/pill-tile/pill-tile");
var cube_context_1 = require("../../views/cube-view/cube-context");
var drag_indicator_1 = require("../drag-indicator/drag-indicator");
var add_series_1 = require("./add-series");
var series_tiles_1 = require("./series-tiles");
require("./series-tiles-row.scss");
var SeriesTilesRow = (function (_super) {
    __extends(SeriesTilesRow, _super);
    function SeriesTilesRow() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        _this.items = React.createRef();
        _this.removePlaceholderSeries = function () { return _this.setState({ placeholderSeries: null }); };
        _this.openSeriesMenu = function (series) { return _this.setState({ openedSeries: series }); };
        _this.closeSeriesMenu = function () { return _this.setState({ openedSeries: null }); };
        _this.openOverflowMenu = function () { return _this.setState({ overflowOpen: true }); };
        _this.closeOverflowMenu = function () { return _this.setState({ overflowOpen: false }); };
        _this.updateSeries = function (oldSeries, series) {
            var _a = _this.context, essence = _a.essence, clicker = _a.clicker;
            clicker.changeSeriesList(essence.series.replaceSeries(oldSeries, series));
        };
        _this.savePlaceholderSeries = function (series) {
            var clicker = _this.context.clicker;
            clicker.addSeries(series);
            _this.removePlaceholderSeries();
        };
        _this.removeSeries = function (series) {
            var clicker = _this.context.clicker;
            clicker.removeSeries(series);
            _this.closeOverflowMenu();
        };
        _this.dragStart = function (label, series, e) {
            var dataTransfer = e.dataTransfer;
            dataTransfer.effectAllowed = "all";
            dom_1.setDragData(dataTransfer, "text/plain", label);
            drag_manager_1.DragManager.setDragSeries(series);
            dom_1.setDragGhost(dataTransfer, label);
            _this.closeOverflowMenu();
        };
        _this.dragEnter = function (e) {
            if (!_this.canDrop())
                return;
            e.preventDefault();
            _this.setState({
                dragPosition: _this.calculateDragPosition(e)
            });
        };
        _this.dragOver = function (e) {
            if (!_this.canDrop())
                return;
            e.preventDefault();
            var dragPosition = _this.calculateDragPosition(e);
            if (dragPosition.equals(_this.state.dragPosition))
                return;
            _this.setState({ dragPosition: dragPosition });
        };
        _this.dragLeave = function () {
            if (!_this.canDrop())
                return;
            _this.setState({
                dragPosition: null
            });
        };
        _this.drop = function (e) {
            if (!_this.canDrop())
                return;
            e.preventDefault();
            _this.setState({ dragPosition: null });
            if (drag_manager_1.DragManager.isDraggingSeries()) {
                _this.rearrangeSeries(drag_manager_1.DragManager.draggingSeries(), _this.calculateDragPosition(e));
            }
            else {
                _this.dropNewSeries(series_1.fromMeasure(drag_manager_1.DragManager.draggingMeasure()), _this.calculateDragPosition(e));
            }
        };
        _this.appendMeasureSeries = function (measure) {
            var series = series_1.fromMeasure(measure);
            var isMeasureSeries = series instanceof measure_series_1.MeasureSeries;
            var isUniqueQuantile = !_this.context.essence.series.hasSeries(series);
            if (isMeasureSeries || isUniqueQuantile) {
                _this.context.clicker.addSeries(series);
                return;
            }
            _this.appendPlaceholder(series);
        };
        return _this;
    }
    SeriesTilesRow.prototype.maxItems = function () {
        var series = this.context.essence.series;
        var menuStage = this.props.menuStage;
        return menuStage && pill_tile_1.getMaxItems(menuStage.width, series.count());
    };
    SeriesTilesRow.prototype.appendDirtySeries = function (series) {
        this.appendPlaceholder(series);
    };
    SeriesTilesRow.prototype.appendPlaceholder = function (series) {
        this.setState({
            placeholderSeries: {
                series: series,
                index: this.context.essence.series.count()
            }
        });
    };
    SeriesTilesRow.prototype.canDrop = function () {
        var seriesList = this.context.essence.series;
        var measure = drag_manager_1.DragManager.draggingMeasure();
        if (measure)
            return !seriesList.hasMeasure(measure);
        return drag_manager_1.DragManager.isDraggingSeries();
    };
    SeriesTilesRow.prototype.calculateDragPosition = function (e) {
        var essence = this.context.essence;
        var numItems = essence.series.count();
        var rect = this.items.current.getBoundingClientRect();
        var x = dom_1.getXFromEvent(e);
        var offset = x - rect.left;
        var position = drag_position_1.DragPosition.calculateFromOffset(offset, numItems, constants_1.CORE_ITEM_WIDTH, constants_1.CORE_ITEM_GAP);
        if (position.replace === this.maxItems()) {
            return new drag_position_1.DragPosition({ insert: position.replace });
        }
        return position;
    };
    SeriesTilesRow.prototype.dropNewSeries = function (newSeries, dragPosition) {
        var _a = this.context, clicker = _a.clicker, series = _a.essence.series;
        var isDuplicateQuantile = newSeries instanceof quantile_series_1.QuantileSeries && series.hasSeries(newSeries);
        if (isDuplicateQuantile) {
            if (dragPosition.isReplace()) {
                clicker.removeSeries(series.series.get(dragPosition.replace));
                this.setState({ placeholderSeries: { series: newSeries, index: dragPosition.replace } });
            }
            else {
                this.setState({ placeholderSeries: { series: newSeries, index: dragPosition.insert } });
            }
        }
        else {
            this.rearrangeSeries(newSeries, dragPosition);
        }
    };
    SeriesTilesRow.prototype.rearrangeSeries = function (series, dragPosition) {
        var _a = this.context, clicker = _a.clicker, essence = _a.essence;
        if (dragPosition.isReplace()) {
            clicker.changeSeriesList(essence.series.replaceByIndex(dragPosition.replace, series));
        }
        else {
            clicker.changeSeriesList(essence.series.insertByIndex(dragPosition.insert, series));
        }
    };
    SeriesTilesRow.prototype.render = function () {
        var _a = this.state, dragPosition = _a.dragPosition, openedSeries = _a.openedSeries, overflowOpen = _a.overflowOpen, placeholderSeries = _a.placeholderSeries;
        var essence = this.context.essence;
        var menuStage = this.props.menuStage;
        return React.createElement("div", { className: "series-tile", onDragEnter: this.dragEnter },
            React.createElement("div", { className: "title" }, constants_1.STRINGS.series),
            React.createElement("div", { className: "items", ref: this.items },
                React.createElement(series_tiles_1.SeriesTiles, { menuStage: menuStage, placeholderSeries: placeholderSeries, maxItems: this.maxItems(), essence: essence, removeSeries: this.removeSeries, updateSeries: this.updateSeries, openSeriesMenu: this.openSeriesMenu, closeSeriesMenu: this.closeSeriesMenu, dragStart: this.dragStart, removePlaceholderSeries: this.removePlaceholderSeries, savePlaceholderSeries: this.savePlaceholderSeries, overflowOpen: overflowOpen, closeOverflowMenu: this.closeOverflowMenu, openOverflowMenu: this.openOverflowMenu, openedSeriesMenu: openedSeries })),
            React.createElement(add_series_1.AddSeries, { menuStage: menuStage, essence: essence, appendMeasureSeries: this.appendMeasureSeries }),
            React.createElement(drag_indicator_1.DragIndicator, { dragOver: this.dragOver, dragLeave: this.dragLeave, drop: this.drop, dragPosition: dragPosition }));
    };
    SeriesTilesRow.contextType = cube_context_1.CubeContext;
    return SeriesTilesRow;
}(React.Component));
exports.SeriesTilesRow = SeriesTilesRow;
//# sourceMappingURL=series-tiles-row.js.map