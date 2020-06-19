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
var drag_manager_1 = require("../../utils/drag-manager/drag-manager");
var teleporter_1 = require("../../utils/teleporter/teleporter");
require("./pinboard-panel.scss");
var pinboard_tiles_1 = require("./pinboard-tiles");
var Legend = teleporter_1.createTeleporter();
exports.LegendSpot = Legend.Source;
var PinboardPanel = (function (_super) {
    __extends(PinboardPanel, _super);
    function PinboardPanel(props) {
        var _this = _super.call(this, props) || this;
        _this.dragEnter = function (e) {
            if (!_this.canDrop())
                return;
            e.preventDefault();
            _this.setState({ dragOver: true });
        };
        _this.dragOver = function (e) {
            if (!_this.canDrop())
                return;
            e.preventDefault();
        };
        _this.dragLeave = function () {
            if (!_this.canDrop())
                return;
            _this.setState({ dragOver: false });
        };
        _this.drop = function (e) {
            if (!_this.canDrop())
                return;
            e.preventDefault();
            var dimension = drag_manager_1.DragManager.draggingDimension();
            if (dimension) {
                _this.props.clicker.pin(dimension);
            }
            _this.setState({ dragOver: false });
        };
        _this.state = {
            dragOver: false
        };
        return _this;
    }
    PinboardPanel.prototype.canDrop = function () {
        var dimension = drag_manager_1.DragManager.draggingDimension();
        return dimension && this.isStringOrBoolean(dimension) && !this.alreadyPinned(dimension);
    };
    PinboardPanel.prototype.isStringOrBoolean = function (_a) {
        var kind = _a.kind;
        return kind === "string" || kind === "boolean";
    };
    PinboardPanel.prototype.alreadyPinned = function (_a) {
        var name = _a.name;
        return this.props.essence.pinnedDimensions.has(name);
    };
    PinboardPanel.prototype.render = function () {
        var _a = this.props, clicker = _a.clicker, essence = _a.essence, timekeeper = _a.timekeeper, style = _a.style;
        var dragOver = this.state.dragOver;
        return React.createElement("div", { className: "pinboard-panel", onDragEnter: this.dragEnter, style: style },
            React.createElement(Legend.Target, null),
            React.createElement(pinboard_tiles_1.PinboardTiles, { hidePlaceholder: dragOver, essence: essence, clicker: clicker, timekeeper: timekeeper }),
            dragOver && React.createElement("div", { className: "drop-indicator-tile" }),
            dragOver && React.createElement("div", { className: "drag-mask", onDragOver: this.dragOver, onDragLeave: this.dragLeave, onDragExit: this.dragLeave, onDrop: this.drop }));
    };
    return PinboardPanel;
}(React.Component));
exports.PinboardPanel = PinboardPanel;
//# sourceMappingURL=pinboard-panel.js.map