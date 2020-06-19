"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var pill_tile_1 = require("../../utils/pill-tile/pill-tile");
var tile_overflow_container_1 = require("../tile-overflow-container/tile-overflow-container");
var split_tile_1 = require("./split-tile");
exports.SplitTiles = function (props) {
    var overflowOpen = props.overflowOpen, closeOverflowMenu = props.closeOverflowMenu, openOverflowMenu = props.openOverflowMenu, essence = props.essence, maxItems = props.maxItems, removeSplit = props.removeSplit, updateSplit = props.updateSplit, openedSplit = props.openedSplit, openMenu = props.openMenu, closeMenu = props.closeMenu, dragStart = props.dragStart, menuStage = props.menuStage;
    var splits = essence.splits.splits.toArray();
    var splitTiles = splits.map(function (split) {
        var dimension = essence.dataCube.getDimension(split.reference);
        return React.createElement(split_tile_1.SplitTile, { key: split.toKey(), split: split, dimension: dimension, removeSplit: removeSplit, updateSplit: updateSplit, open: split.equals(openedSplit), openMenu: openMenu, closeMenu: closeMenu, dragStart: dragStart, containerStage: menuStage, essence: essence });
    });
    var visibleSplits = splitTiles
        .slice(0, maxItems)
        .map(function (el, idx) { return React.cloneElement(el, { style: dom_1.transformStyle(idx * pill_tile_1.SECTION_WIDTH, 0) }); });
    var overflowSplits = splitTiles.slice(maxItems);
    if (overflowSplits.length <= 0) {
        return React.createElement(React.Fragment, null, visibleSplits);
    }
    var anyOverflowTileOpen = splits.slice(maxItems).some(function (split) { return split.equals(openedSplit); });
    var overflowOpened = overflowOpen || anyOverflowTileOpen;
    var splitOverflow = React.createElement(tile_overflow_container_1.TileOverflowContainer, { className: "dimension", key: "overflow-menu", items: overflowSplits, open: overflowOpened, openOverflowMenu: openOverflowMenu, closeOverflowMenu: closeOverflowMenu, x: visibleSplits.length * pill_tile_1.SECTION_WIDTH });
    return React.createElement(React.Fragment, null, visibleSplits.concat([splitOverflow]));
};
//# sourceMappingURL=split-tiles.js.map