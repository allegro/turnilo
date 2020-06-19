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
var memoize_one_1 = require("memoize-one");
var React = require("react");
var heat_map_1 = require("../../../common/visualization-manifests/heat-map/heat-map");
var constants_1 = require("../../config/constants");
var dataset_1 = require("../../utils/dataset/dataset");
var base_visualization_1 = require("../base-visualization/base-visualization");
require("./heat-map.scss");
var labeled_heatmap_1 = require("./labeled-heatmap");
var scales_1 = require("./utils/scales");
var HeatMap = (function (_super) {
    __extends(HeatMap, _super);
    function HeatMap() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = heat_map_1.HEAT_MAP_MANIFEST.name;
        _this.getScales = memoize_one_1.default(scales_1.default);
        return _this;
    }
    HeatMap.prototype.series = function () {
        return this.props.essence.getConcreteSeries().first();
    };
    HeatMap.prototype.renderInternals = function () {
        var _a = this.props, essence = _a.essence, stage = _a.stage;
        var dataset = this.state.preparedDataset;
        var _b = this.getScales(dataset.data, labeled_heatmap_1.TILE_SIZE, this.series()), x = _b.x, y = _b.y, color = _b.color;
        return React.createElement("div", { className: "internals heatmap-container", style: { maxHeight: stage.height } },
            React.createElement(labeled_heatmap_1.LabelledHeatmap, { stage: stage, dataset: dataset.data, xScale: x, yScale: y, colorScale: color, saveHighlight: this.highlight, highlight: this.getHighlight(), acceptHighlight: this.acceptHighlight, dropHighlight: this.dropHighlight, essence: essence }));
    };
    HeatMap.prototype.deriveDatasetState = function (dataset) {
        var essence = this.props.essence;
        var timezone = essence.timezone;
        var secondSplit = essence.splits.splits.get(1);
        var preparedDataset = dataset_1.fillDatasetWithMissingValues(dataset.data[0][constants_1.SPLIT], this.series().plywoodKey(), secondSplit, timezone);
        return { preparedDataset: preparedDataset };
    };
    return HeatMap;
}(base_visualization_1.BaseVisualization));
exports.HeatMap = HeatMap;
//# sourceMappingURL=heat-map.js.map