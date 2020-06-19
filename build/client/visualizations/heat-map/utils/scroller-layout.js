"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = require("../../../utils/dom/dom");
var labeled_heatmap_1 = require("../labeled-heatmap");
var nested_dataset_1 = require("./nested-dataset");
function scrollerLayout(dataset, topLabelsHeight, leftLabelsWidth) {
    var top = dom_1.clamp(topLabelsHeight, labeled_heatmap_1.MIN_TOP_LABELS_HEIGHT, labeled_heatmap_1.MAX_TOP_LABELS_HEIGHT);
    var left = dom_1.clamp(leftLabelsWidth, labeled_heatmap_1.MIN_LEFT_LABELS_WIDTH, labeled_heatmap_1.MAX_LEFT_LABELS_WIDTH);
    var height = dataset.length * labeled_heatmap_1.TILE_SIZE;
    var width = nested_dataset_1.nestedDataset(dataset[0]).length * labeled_heatmap_1.TILE_SIZE;
    return {
        bodyHeight: height,
        bodyWidth: width,
        top: top,
        left: left,
        right: 0,
        bottom: 0
    };
}
exports.default = scrollerLayout;
//# sourceMappingURL=scroller-layout.js.map