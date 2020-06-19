"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var scale_1 = require("@vx/scale");
var d3_1 = require("d3");
var nested_dataset_1 = require("./nested-dataset");
var white = "#fff";
var orange = "#ff5a00";
function seriesSelector(series) {
    return function (d) { return series.selectValue(d); };
}
function scales(dataset, tileSize, series) {
    var bucketSizeMax = d3_1.max(dataset, function (d) { return nested_dataset_1.nestedDataset(d).length; }) || 0;
    var dataLength = dataset.length;
    var width = bucketSizeMax * tileSize;
    var height = dataLength * tileSize;
    var x = scale_1.scaleLinear({
        domain: [0, bucketSizeMax],
        range: [0, width]
    });
    var y = scale_1.scaleLinear({
        domain: [dataLength, 0],
        range: [height, 0]
    });
    var select = seriesSelector(series);
    var colorMin = d3_1.min(dataset, function (d) { return d3_1.min(nested_dataset_1.nestedDataset(d), select); });
    var colorMax = d3_1.max(dataset, function (d) { return d3_1.max(nested_dataset_1.nestedDataset(d), select); });
    var color = scale_1.scaleLinear({
        range: [white, orange],
        domain: [Math.min(colorMin, 0), colorMax]
    });
    return { x: x, y: y, color: color };
}
exports.default = scales;
//# sourceMappingURL=scales.js.map