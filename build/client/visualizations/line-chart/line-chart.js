"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var line_chart_1 = require("../../../common/visualization-manifests/line-chart/line-chart");
var message_card_1 = require("../../components/message-card/message-card");
var base_visualization_1 = require("../base-visualization/base-visualization");
var charts_1 = require("./charts/charts");
var interaction_controller_1 = require("./interactions/interaction-controller");
require("./line-chart.scss");
var pick_x_axis_ticks_1 = require("./utils/pick-x-axis-ticks");
var x_scale_1 = require("./utils/x-scale");
var x_axis_1 = require("./x-axis/x-axis");
var Y_AXIS_WIDTH = 60;
var X_AXIS_HEIGHT = 30;
var LineChart = (function (_super) {
    __extends(LineChart, _super);
    function LineChart() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = line_chart_1.LINE_CHART_MANIFEST.name;
        _this.chartsRef = React.createRef();
        return _this;
    }
    LineChart.prototype.renderInternals = function (dataset) {
        var _this = this;
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper, stage = _a.stage;
        var range = x_scale_1.calculateXRange(essence, timekeeper, dataset);
        if (!range) {
            return React.createElement(message_card_1.MessageCard, { title: "No data found. Try different filters." });
        }
        var scale = x_scale_1.createContinuousScale(essence, range, stage.width - Y_AXIS_WIDTH);
        var ticks = pick_x_axis_ticks_1.default(scale.domain(), essence.timezone);
        var maxHeight = stage.height - X_AXIS_HEIGHT;
        return React.createElement(interaction_controller_1.InteractionController, { dataset: dataset, xScale: scale, chartsContainerRef: this.chartsRef, essence: essence, highlight: this.getHighlight(), dropHighlight: this.dropHighlight, acceptHighlight: this.acceptHighlight, saveHighlight: this.highlight }, function (interactions) {
            return React.createElement("div", { className: "line-chart-container" },
                React.createElement("div", { className: "line-charts", ref: _this.chartsRef, style: { maxHeight: maxHeight } },
                    React.createElement(charts_1.Charts, { interactions: interactions, stage: stage.changeHeight(maxHeight), essence: essence, xScale: scale, xTicks: ticks, dataset: dataset })),
                React.createElement(x_axis_1.XAxis, { width: stage.width, ticks: ticks, scale: scale, timezone: essence.timezone }));
        });
    };
    return LineChart;
}(base_visualization_1.BaseVisualization));
exports.LineChart = LineChart;
//# sourceMappingURL=line-chart.js.map