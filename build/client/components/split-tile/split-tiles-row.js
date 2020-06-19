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
var essence_1 = require("../../../common/models/essence/essence");
var split_1 = require("../../../common/models/split/split");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var drag_manager_1 = require("../../utils/drag-manager/drag-manager");
var pill_tile_1 = require("../../utils/pill-tile/pill-tile");
var drag_indicator_1 = require("../drag-indicator/drag-indicator");
var add_split_1 = require("./add-split");
require("./split-tile.scss");
var split_tiles_1 = require("./split-tiles");
var SplitTilesRow = (function (_super) {
    __extends(SplitTilesRow, _super);
    function SplitTilesRow() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.items = React.createRef();
        _this.state = {};
        _this.openMenu = function (split) { return _this.setState({ openedSplit: split }); };
        _this.closeMenu = function () { return _this.setState({ openedSplit: null }); };
        _this.openOverflowMenu = function () { return _this.setState({ overflowOpen: true }); };
        _this.closeOverflowMenu = function () { return _this.setState({ overflowOpen: false }); };
        _this.updateSplit = function (oldSplit, split) {
            var _a = _this.props, essence = _a.essence, clicker = _a.clicker;
            clicker.changeSplits(essence.splits.replace(oldSplit, split), essence_1.VisStrategy.UnfairGame);
        };
        _this.removeSplit = function (split) {
            var clicker = _this.props.clicker;
            clicker.removeSplit(split, essence_1.VisStrategy.FairGame);
            _this.closeOverflowMenu();
        };
        _this.dragStart = function (label, split, e) {
            var dataTransfer = e.dataTransfer;
            dataTransfer.effectAllowed = "all";
            dom_1.setDragData(dataTransfer, "text/plain", label);
            drag_manager_1.DragManager.setDragSplit(split);
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
            var split = _this.draggingSplit();
            if (!split)
                return;
            var dragPosition = _this.calculateDragPosition(e);
            if (dragPosition.isReplace()) {
                if (dragPosition.replace === _this.maxItems()) {
                    _this.insertSplit(split, dragPosition.replace);
                }
                else {
                    _this.replaceSplit(split, dragPosition.replace);
                }
            }
            else {
                _this.insertSplit(split, dragPosition.insert);
            }
        };
        _this.appendSplit = function (dimension) {
            _this.props.clicker.addSplit(split_1.Split.fromDimension(dimension), essence_1.VisStrategy.FairGame);
        };
        _this.insertSplit = function (split, index) {
            var _a = _this.props, clicker = _a.clicker, splits = _a.essence.splits;
            clicker.changeSplits(splits.insertByIndex(index, split), essence_1.VisStrategy.FairGame);
        };
        _this.replaceSplit = function (split, index) {
            var _a = _this.props, clicker = _a.clicker, splits = _a.essence.splits;
            clicker.changeSplits(splits.replaceByIndex(index, split), essence_1.VisStrategy.FairGame);
        };
        return _this;
    }
    SplitTilesRow.prototype.maxItems = function () {
        var _a = this.props, menuStage = _a.menuStage, splits = _a.essence.splits.splits;
        return menuStage && pill_tile_1.getMaxItems(menuStage.width, splits.count());
    };
    SplitTilesRow.prototype.canDrop = function () {
        var _a = this.props.essence, splits = _a.splits, dataCube = _a.dataCube;
        var dimension = drag_manager_1.DragManager.draggingDimension();
        if (dimension)
            return !splits.hasSplitOn(dimension);
        if (drag_manager_1.DragManager.isDraggingFilter()) {
            var dimension_1 = dataCube.getDimension(drag_manager_1.DragManager.draggingFilter().reference);
            return dimension_1 && !splits.hasSplitOn(dimension_1);
        }
        return drag_manager_1.DragManager.isDraggingSplit();
    };
    SplitTilesRow.prototype.calculateDragPosition = function (e) {
        var essence = this.props.essence;
        var numItems = essence.splits.length();
        var rect = this.items.current.getBoundingClientRect();
        var x = dom_1.getXFromEvent(e);
        var offset = x - rect.left;
        var position = drag_position_1.DragPosition.calculateFromOffset(offset, numItems, constants_1.CORE_ITEM_WIDTH, constants_1.CORE_ITEM_GAP);
        if (position.replace === this.maxItems()) {
            return new drag_position_1.DragPosition({ insert: position.replace });
        }
        return position;
    };
    SplitTilesRow.prototype.draggingSplit = function () {
        var dataCube = this.props.essence.dataCube;
        if (drag_manager_1.DragManager.isDraggingSplit())
            return drag_manager_1.DragManager.draggingSplit();
        if (drag_manager_1.DragManager.isDraggingFilter()) {
            var dimension = dataCube.getDimension(drag_manager_1.DragManager.draggingFilter().reference);
            return split_1.Split.fromDimension(dimension);
        }
        return split_1.Split.fromDimension(drag_manager_1.DragManager.draggingDimension());
    };
    SplitTilesRow.prototype.render = function () {
        var _a = this.props, essence = _a.essence, menuStage = _a.menuStage;
        var _b = this.state, dragPosition = _b.dragPosition, overflowOpen = _b.overflowOpen, openedSplit = _b.openedSplit;
        return React.createElement("div", { className: "split-tile", onDragEnter: this.dragEnter },
            React.createElement("div", { className: "title" }, constants_1.STRINGS.split),
            React.createElement("div", { className: "items", ref: this.items },
                React.createElement(split_tiles_1.SplitTiles, { essence: essence, openedSplit: openedSplit, removeSplit: this.removeSplit, updateSplit: this.updateSplit, openMenu: this.openMenu, closeMenu: this.closeMenu, dragStart: this.dragStart, menuStage: menuStage, maxItems: this.maxItems(), overflowOpen: overflowOpen, closeOverflowMenu: this.closeOverflowMenu, openOverflowMenu: this.openOverflowMenu })),
            React.createElement(drag_indicator_1.DragIndicator, { dragOver: this.dragOver, dragLeave: this.dragLeave, drop: this.drop, dragPosition: dragPosition }),
            React.createElement(add_split_1.AddSplit, { appendSplit: this.appendSplit, menuStage: menuStage, essence: essence }));
    };
    return SplitTilesRow;
}(React.Component));
exports.SplitTilesRow = SplitTilesRow;
//# sourceMappingURL=split-tiles-row.js.map