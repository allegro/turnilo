"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var add_tile_1 = require("../add-tile/add-tile");
exports.AddSeries = function (props) {
    var appendMeasureSeries = props.appendMeasureSeries, menuStage = props.menuStage, _a = props.essence, dataCube = _a.dataCube, series = _a.series;
    var tiles = dataCube.measures
        .filterMeasures(function (measure) { return !series.hasMeasure(measure); })
        .map(function (measure) {
        return {
            key: measure.name,
            label: measure.title,
            value: measure
        };
    });
    return React.createElement(add_tile_1.AddTile, { containerStage: menuStage, onSelect: appendMeasureSeries, tiles: tiles });
};
//# sourceMappingURL=add-series.js.map