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
require("./range-handle.scss");
var RangeHandle = (function (_super) {
    __extends(RangeHandle, _super);
    function RangeHandle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            anchor: null
        };
        _this.onGlobalMouseMove = function (event) {
            var _a = _this.props, onChange = _a.onChange, leftBound = _a.leftBound, rightBound = _a.rightBound;
            var anchor = _this.state.anchor;
            var newX = dom_1.getXFromEvent(event) - anchor;
            onChange(dom_1.clamp(newX, leftBound, rightBound));
        };
        _this.onMouseDown = function (event) {
            var _a = _this.props, offset = _a.offset, positionLeft = _a.positionLeft;
            var x = dom_1.getXFromEvent(event);
            var anchor = x - offset - positionLeft;
            _this.setState({
                anchor: anchor
            });
            event.preventDefault();
            window.addEventListener("mouseup", _this.onGlobalMouseUp);
            window.addEventListener("mousemove", _this.onGlobalMouseMove);
        };
        _this.onGlobalMouseUp = function () {
            window.removeEventListener("mouseup", _this.onGlobalMouseUp);
            window.removeEventListener("mousemove", _this.onGlobalMouseMove);
        };
        return _this;
    }
    RangeHandle.prototype.render = function () {
        var _a = this.props, positionLeft = _a.positionLeft, isAny = _a.isAny, isBeyondMin = _a.isBeyondMin, isBeyondMax = _a.isBeyondMax;
        var style = { left: positionLeft };
        return React.createElement("div", { className: dom_1.classNames("range-handle", { "empty": isAny, "beyond min": isBeyondMin, "beyond max": isBeyondMax }), style: style, onMouseDown: this.onMouseDown });
    };
    return RangeHandle;
}(React.Component));
exports.RangeHandle = RangeHandle;
//# sourceMappingURL=range-handle.js.map