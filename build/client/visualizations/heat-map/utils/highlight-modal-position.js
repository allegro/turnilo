"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var labeled_heatmap_1 = require("../labeled-heatmap");
function calculateLeft(props) {
    var column = props.position.column, layout = props.layout, stage = props.stage, scroll = props.scroll;
    if (column !== null) {
        return column * labeled_heatmap_1.TILE_SIZE + labeled_heatmap_1.TILE_GAP + layout.left + 20 + stage.x - scroll.left;
    }
    return stage.x + Math.min(stage.width / 2, layout.left + (layout.bodyWidth / 2));
}
exports.calculateLeft = calculateLeft;
function calculateTop(props) {
    var row = props.position.row, layout = props.layout, stage = props.stage, scroll = props.scroll;
    if (row !== null) {
        return row * labeled_heatmap_1.TILE_SIZE + layout.top + stage.y - 5 - scroll.top;
    }
    return stage.y + Math.min(stage.height / 2, layout.top + (layout.bodyHeight / 2));
}
exports.calculateTop = calculateTop;
//# sourceMappingURL=highlight-modal-position.js.map