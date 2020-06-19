"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var series_menu_1 = require("../series-menu/series-menu");
var svg_icon_1 = require("../svg-icon/svg-icon");
var with_ref_1 = require("../with-ref/with-ref");
var series_tiles_1 = require("./series-tiles");
exports.SeriesTile = function (props) {
    var seriesList = props.seriesList, measures = props.measures, open = props.open, item = props.item, style = props.style, updateSeries = props.updateSeries, removeSeries = props.removeSeries, openSeriesMenu = props.openSeriesMenu, closeSeriesMenu = props.closeSeriesMenu, dragStart = props.dragStart, containerStage = props.containerStage;
    var definition = item.definition, measure = item.measure;
    var title = item.title();
    var saveSeries = function (newSeries) { return updateSeries(definition, newSeries); };
    var remove = function (e) {
        e.stopPropagation();
        removeSeries(definition);
    };
    return React.createElement(with_ref_1.WithRef, null, function (_a) {
        var openOn = _a.ref, setRef = _a.setRef;
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: dom_1.classNames(series_tiles_1.SERIES_CLASS_NAME, "measure"), draggable: true, ref: setRef, onClick: function () { return openSeriesMenu(definition); }, onDragStart: function (e) { return dragStart(measure.title, definition, e); }, style: style },
                React.createElement("div", { className: "reading" }, title),
                React.createElement("div", { className: "remove", onClick: remove },
                    React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/x.svg") }))),
            open && openOn && React.createElement(series_menu_1.SeriesMenu, { key: definition.key(), openOn: openOn, seriesList: seriesList, measures: measures, containerStage: containerStage, onClose: closeSeriesMenu, initialSeries: definition, measure: measure, saveSeries: saveSeries }));
    });
};
//# sourceMappingURL=series-tile.js.map