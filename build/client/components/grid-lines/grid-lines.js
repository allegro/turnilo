"use strict";
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
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
require("./grid-lines.scss");
function lineCoordinates(orientation, value, stage) {
    switch (orientation) {
        case "horizontal":
            return { x1: 0, x2: stage.width, y1: value, y2: value };
        case "vertical":
            return { x1: value, x2: value, y1: 0, y2: stage.height };
    }
}
exports.GridLines = function (props) {
    var orientation = props.orientation, stage = props.stage, ticks = props.ticks, scale = props.scale;
    return React.createElement("g", { className: dom_1.classNames("grid-lines", orientation), transform: stage.getTransform() }, ticks.map(function (tick) {
        var value = dom_1.roundToHalfPx(scale(tick));
        var coordinates = lineCoordinates(orientation, value, stage);
        return React.createElement("line", __assign({ key: String(tick) }, coordinates));
    }));
};
//# sourceMappingURL=grid-lines.js.map