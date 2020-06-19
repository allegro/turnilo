"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var array_1 = require("../../../common/utils/array/array");
var dom_1 = require("../../utils/dom/dom");
var pill_tile_1 = require("../../utils/pill-tile/pill-tile");
var tile_overflow_container_1 = require("../tile-overflow-container/tile-overflow-container");
var placeholder_series_1 = require("./placeholder-series");
var series_tile_1 = require("./series-tile");
exports.SERIES_CLASS_NAME = "series";
exports.SeriesTiles = function (props) {
    var openedSeriesMenu = props.openedSeriesMenu, menuStage = props.menuStage, removeSeries = props.removeSeries, dragStart = props.dragStart, closeSeriesMenu = props.closeSeriesMenu, updateSeries = props.updateSeries, removePlaceholderSeries = props.removePlaceholderSeries, savePlaceholderSeries = props.savePlaceholderSeries, openOverflowMenu = props.openOverflowMenu, closeOverflowMenu = props.closeOverflowMenu, essence = props.essence, openSeriesMenu = props.openSeriesMenu, overflowOpen = props.overflowOpen, placeholderSeries = props.placeholderSeries, maxItems = props.maxItems;
    var series = essence.getConcreteSeries().toArray();
    var seriesTiles = series.map(function (item) { return React.createElement(series_tile_1.SeriesTile, { seriesList: essence.series, measures: essence.dataCube.measures, key: item.definition.key(), item: item, open: item.definition.equals(openedSeriesMenu), closeSeriesMenu: closeSeriesMenu, removeSeries: removeSeries, dragStart: dragStart, containerStage: menuStage, openSeriesMenu: openSeriesMenu, updateSeries: updateSeries }); });
    function insertPlaceholder(tiles) {
        if (!placeholderSeries)
            return tiles;
        var series = placeholderSeries.series, index = placeholderSeries.index;
        var measure = essence.dataCube.getMeasure(series.reference);
        var placeholderTile = React.createElement(placeholder_series_1.PlaceholderSeriesTile, { key: "placeholder-series-tile", measure: measure, seriesList: essence.series, measures: essence.dataCube.measures, series: series, containerStage: menuStage, saveSeries: savePlaceholderSeries, closeItem: removePlaceholderSeries });
        return array_1.insert(tiles, index, placeholderTile);
    }
    var tilesWithPlaceholder = insertPlaceholder(seriesTiles);
    var visibleItems = tilesWithPlaceholder
        .slice(0, maxItems)
        .map(function (element, idx) { return React.cloneElement(element, { style: dom_1.transformStyle(idx * pill_tile_1.SECTION_WIDTH, 0) }); });
    var overflowItems = tilesWithPlaceholder.slice(maxItems);
    if (overflowItems.length <= 0)
        return React.createElement(React.Fragment, null, visibleItems);
    var anyOverflowItemOpen = series.slice(maxItems).some(function (_a) {
        var definition = _a.definition;
        return definition.equals(openedSeriesMenu);
    });
    var isDummySeriesInOverflow = overflowItems.some(function (element) { return element.type === placeholder_series_1.PlaceholderSeriesTile; });
    var overflowOpened = overflowOpen || anyOverflowItemOpen || isDummySeriesInOverflow;
    var seriesItemOverflow = React.createElement(tile_overflow_container_1.TileOverflowContainer, { key: "overflow-menu", items: overflowItems, open: overflowOpened, openOverflowMenu: openOverflowMenu, x: visibleItems.length * pill_tile_1.SECTION_WIDTH, closeOverflowMenu: closeOverflowMenu, className: "measure" });
    return React.createElement(React.Fragment, null, visibleItems.concat([seriesItemOverflow]));
};
//# sourceMappingURL=series-tiles.js.map