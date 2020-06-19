"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var series_menu_1 = require("../series-menu/series-menu");
var with_ref_1 = require("../with-ref/with-ref");
var series_tiles_1 = require("./series-tiles");
exports.PlaceholderSeriesTile = function (props) {
    var series = props.series, measures = props.measures, seriesList = props.seriesList, containerStage = props.containerStage, saveSeries = props.saveSeries, closeItem = props.closeItem, style = props.style, measure = props.measure;
    return React.createElement(with_ref_1.WithRef, null, function (_a) {
        var openOn = _a.ref, setRef = _a.setRef;
        return React.createElement("div", { className: dom_1.classNames(series_tiles_1.SERIES_CLASS_NAME, "measure"), ref: setRef, style: style },
            React.createElement("div", { className: "reading" }, measure.title),
            openOn && React.createElement(series_menu_1.SeriesMenu, { key: "placeholder-series", measures: measures, seriesList: seriesList, openOn: openOn, containerStage: containerStage, onClose: closeItem, initialSeries: series, measure: measure, saveSeries: saveSeries }));
    });
};
//# sourceMappingURL=placeholder-series.js.map