"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var sort_on_1 = require("../../../common/models/sort-on/sort-on");
var functional_1 = require("../../../common/utils/functional/functional");
var constants_1 = require("../../config/constants");
var pinboard_measure_tile_1 = require("../pinboard-measure-tile/pinboard-measure-tile");
var pinboard_tile_1 = require("../pinboard-tile/pinboard-tile");
var svg_icon_1 = require("../svg-icon/svg-icon");
function pinnedSortOn(essence) {
    var sortSeries = essence.getPinnedSortSeries();
    return sortSeries && new sort_on_1.SeriesSortOn(sortSeries);
}
function pinnedDimensions(essence) {
    var dataCube = essence.dataCube, pinnedDimensions = essence.pinnedDimensions;
    return functional_1.mapTruthy(pinnedDimensions.toArray(), function (dimensionName) { return dataCube.getDimension(dimensionName); });
}
exports.PinboardTiles = function (props) {
    var essence = props.essence, timekeeper = props.timekeeper, clicker = props.clicker, hidePlaceholder = props.hidePlaceholder;
    var tileDimensions = pinnedDimensions(essence);
    var sortOn = pinnedSortOn(essence);
    var showPlaceholder = !hidePlaceholder && !tileDimensions.length;
    return React.createElement(React.Fragment, null,
        React.createElement(pinboard_measure_tile_1.PinboardMeasureTile, { essence: essence, title: constants_1.STRINGS.pinboard, sortOn: sortOn, onSelect: function (sortOn) {
                var series = essence.series.getSeriesWithKey(sortOn.key);
                clicker.changePinnedSortSeries(series);
            } }),
        sortOn && tileDimensions.map(function (dimension) { return React.createElement(pinboard_tile_1.PinboardTile, { key: dimension.name, essence: essence, clicker: clicker, dimension: dimension, timekeeper: timekeeper, sortOn: sortOn }); }),
        showPlaceholder && React.createElement("div", { className: "placeholder" },
            React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/preview-pin.svg") }),
            React.createElement("div", { className: "placeholder-message" }, constants_1.STRINGS.pinboardPlaceholder)));
};
//# sourceMappingURL=pinboard-tiles.js.map