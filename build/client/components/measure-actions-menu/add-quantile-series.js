"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var quantile_series_1 = require("../../../common/models/series/quantile-series");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var svg_icon_1 = require("../svg-icon/svg-icon");
exports.AddQuantileSeriesButton = function (props) {
    var series = props.series, measure = props.measure, appendDirtySeries = props.appendDirtySeries, addSeries = props.addSeries, onClose = props.onClose;
    function onNewQuantileSeries() {
        var quantileSeries = quantile_series_1.QuantileSeries.fromQuantileMeasure(measure);
        if (series.hasSeriesWithKey(quantileSeries.key())) {
            appendDirtySeries(quantileSeries);
        }
        else {
            addSeries(quantileSeries);
        }
        onClose();
    }
    return React.createElement("div", { className: dom_1.classNames("new-quantile-expression", "action"), onClick: onNewQuantileSeries },
        React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/preview-subsplit.svg") }),
        React.createElement("div", { className: "action-label" }, constants_1.STRINGS.add));
};
//# sourceMappingURL=add-quantile-series.js.map