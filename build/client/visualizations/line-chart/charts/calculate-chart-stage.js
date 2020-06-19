"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stage_1 = require("../../../../common/models/stage/stage");
var constants_1 = require("../../../config/constants");
var X_AXIS_HEIGHT = 30;
var MIN_CHART_HEIGHT = 200;
var MAX_ASPECT_RATIO = 1;
function calculateChartStage(stage, chartsCount) {
    var width = stage.width - constants_1.VIS_H_PADDING * 2;
    var maxHeightFromRatio = width / MAX_ASPECT_RATIO;
    var heightFromStageDivision = (stage.height - X_AXIS_HEIGHT) / chartsCount;
    var boundedChartHeight = Math.floor(Math.min(maxHeightFromRatio, heightFromStageDivision));
    var height = Math.max(MIN_CHART_HEIGHT, boundedChartHeight);
    return new stage_1.Stage({
        x: constants_1.VIS_H_PADDING,
        y: 0,
        width: width,
        height: height
    });
}
exports.calculateChartStage = calculateChartStage;
//# sourceMappingURL=calculate-chart-stage.js.map