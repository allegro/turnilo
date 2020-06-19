"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var add_tile_1 = require("../add-tile/add-tile");
exports.AddSplit = function (props) {
    var appendSplit = props.appendSplit, menuStage = props.menuStage, _a = props.essence, dataCube = _a.dataCube, splits = _a.splits;
    var tiles = dataCube.dimensions
        .filterDimensions(function (d) { return splits.findSplitForDimension(d) === undefined; })
        .map(function (dimension) {
        return {
            key: dimension.name,
            label: dimension.title,
            value: dimension
        };
    });
    return React.createElement(add_tile_1.AddTile, { containerStage: menuStage, onSelect: appendSplit, tiles: tiles });
};
//# sourceMappingURL=add-split.js.map