"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../../../utils/dom/dom");
var y_scale_1 = require("../y-scale");
exports.BottomBorder = function (_a) {
    var stage = _a.stage;
    return React.createElement("line", { className: "vis-bottom", transform: stage.getTransform(), x1: 0, x2: stage.width + y_scale_1.TICK_WIDTH, y1: dom_1.roundToHalfPx(stage.height), y2: dom_1.roundToHalfPx(stage.height) });
};
//# sourceMappingURL=bottom-border.js.map