"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var measure_series_1 = require("../../../common/models/series/measure-series");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var svg_icon_1 = require("../svg-icon/svg-icon");
exports.AddMeasureSeriesButton = function (props) {
    var series = props.series, measure = props.measure, onClose = props.onClose, addSeries = props.addSeries;
    var measureDisabled = series.hasMeasure(measure);
    function onAddSeries() {
        if (!measureDisabled)
            addSeries(measure_series_1.MeasureSeries.fromMeasure(measure));
        onClose();
    }
    return React.createElement("div", { className: dom_1.classNames("add-series", "action", { disabled: measureDisabled }), onClick: onAddSeries },
        React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/preview-subsplit.svg") }),
        React.createElement("div", { className: "action-label" }, constants_1.STRINGS.add));
};
//# sourceMappingURL=add-measure-series.js.map