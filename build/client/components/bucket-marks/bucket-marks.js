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
require("./bucket-marks.scss");
var TICK_HEIGHT = 5;
var BucketMarks = (function (_super) {
    __extends(BucketMarks, _super);
    function BucketMarks() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BucketMarks.prototype.render = function () {
        var _a = this.props, stage = _a.stage, ticks = _a.ticks, scale = _a.scale;
        var stageWidth = stage.width;
        var lines = [];
        function addLine(x, key) {
            if (stageWidth < x)
                return;
            lines.push(React.createElement("line", { key: key, x1: x, y1: 0, x2: x, y2: TICK_HEIGHT }));
        }
        for (var _i = 0, ticks_1 = ticks; _i < ticks_1.length; _i++) {
            var tick = ticks_1[_i];
            var x = dom_1.roundToHalfPx(scale(tick));
            addLine(x, "_" + tick);
        }
        if (ticks.length) {
            var x = dom_1.roundToHalfPx(scale(ticks[ticks.length - 1]) + scale.rangeBand());
            addLine(x, "last");
        }
        return React.createElement("g", { className: "bucket-marks", transform: stage.getTransform() }, lines);
    };
    return BucketMarks;
}(React.Component));
exports.BucketMarks = BucketMarks;
//# sourceMappingURL=bucket-marks.js.map