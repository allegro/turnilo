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
var util_1 = require("util");
var dom_1 = require("../../utils/dom/dom");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./resize-handle.scss");
var Direction;
(function (Direction) {
    Direction["LEFT"] = "left";
    Direction["RIGHT"] = "right";
    Direction["TOP"] = "top";
    Direction["BOTTOM"] = "bottom";
})(Direction = exports.Direction || (exports.Direction = {}));
exports.DragHandle = function () { return React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/drag-handle.svg") }); };
var ResizeHandle = (function (_super) {
    __extends(ResizeHandle, _super);
    function ResizeHandle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        _this.onMouseDown = function (event) {
            if (event.button !== 0)
                return;
            window.addEventListener("mouseup", _this.onGlobalMouseUp);
            window.addEventListener("mousemove", _this.onGlobalMouseMove);
            var value = _this.props.value;
            var eventX = _this.getValue(event);
            _this.setState({
                dragging: true,
                anchor: eventX - value
            });
            event.preventDefault();
        };
        _this.onGlobalMouseUp = function () {
            _this.setState({
                dragging: false
            });
            window.removeEventListener("mouseup", _this.onGlobalMouseUp);
            window.removeEventListener("mousemove", _this.onGlobalMouseMove);
            if (util_1.isFunction(_this.props.onResizeEnd)) {
                _this.props.onResizeEnd();
            }
        };
        _this.onGlobalMouseMove = function (event) {
            var anchor = _this.state.anchor;
            var currentValue = _this.constrainValue(_this.getCoordinate(event) - anchor);
            if (!!_this.props.onResize)
                _this.props.onResize(currentValue);
        };
        return _this;
    }
    ResizeHandle.prototype.getValue = function (event) {
        return this.constrainValue(this.getCoordinate(event));
    };
    ResizeHandle.prototype.getCoordinate = function (event) {
        switch (this.props.direction) {
            case Direction.LEFT:
                return dom_1.getXFromEvent(event);
            case Direction.RIGHT:
                return window.innerWidth - dom_1.getXFromEvent(event);
            case Direction.TOP:
                return dom_1.getYFromEvent(event);
            case Direction.BOTTOM:
                return window.innerHeight - dom_1.getYFromEvent(event);
        }
    };
    ResizeHandle.prototype.constrainValue = function (value) {
        return dom_1.clamp(value, this.props.min, this.props.max);
    };
    ResizeHandle.prototype.render = function () {
        var _a;
        var _b = this.props, direction = _b.direction, children = _b.children, value = _b.value;
        var style = (_a = {},
            _a[direction] = value,
            _a);
        return React.createElement("div", { className: dom_1.classNames("resize-handle", direction), style: style, onMouseDown: this.onMouseDown }, children);
    };
    return ResizeHandle;
}(React.Component));
exports.ResizeHandle = ResizeHandle;
//# sourceMappingURL=resize-handle.js.map