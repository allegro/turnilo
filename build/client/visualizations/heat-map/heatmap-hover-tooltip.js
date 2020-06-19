"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tooltip_1 = require("@vx/tooltip");
var React = require("react");
var concrete_series_1 = require("../../../common/models/series/concrete-series");
var measure_bubble_content_1 = require("../../components/measure-bubble-content/measure-bubble-content");
var segment_bubble_1 = require("../../components/segment-bubble/segment-bubble");
var datum_by_position_1 = require("./utils/datum-by-position");
var modal_title_1 = require("./utils/modal-title");
var Content = function (props) {
    var showComparison = props.showComparison, series = props.series, datum = props.datum;
    if (!showComparison) {
        return React.createElement(React.Fragment, null, series.formatValue(datum));
    }
    return React.createElement(measure_bubble_content_1.MeasureBubbleContent, { lowerIsBetter: series.measure.lowerIsBetter, formatter: series.formatter(), current: series.selectValue(datum), previous: series.selectValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS) });
};
exports.HeatmapHoverTooltip = function (props) {
    var dataset = props.dataset, essence = props.essence, scroll = props.scroll, _a = props.position, column = _a.column, row = _a.row, top = _a.top, left = _a.left;
    var _b = datum_by_position_1.default(dataset, { row: row, column: column }), datum = _b[1];
    if (!datum)
        return null;
    var series = essence.getConcreteSeries().first();
    return React.createElement(tooltip_1.TooltipWithBounds, { key: row + "-" + column, top: top - scroll.top, left: left - scroll.left },
        React.createElement(segment_bubble_1.SegmentBubbleContent, { title: modal_title_1.modalTitle({ row: row, column: column }, dataset, essence), content: React.createElement(Content, { datum: datum, showComparison: essence.hasComparison(), series: series }) }));
};
//# sourceMappingURL=heatmap-hover-tooltip.js.map