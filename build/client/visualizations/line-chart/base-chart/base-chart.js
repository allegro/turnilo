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
var mouse_event_offset_1 = require("../../../utils/mouse-event-offset/mouse-event-offset");
var interaction_1 = require("../interactions/interaction");
var background_1 = require("./background/background");
require("./base-chart.scss");
var foreground_1 = require("./foreground/foreground");
var hover_guide_1 = require("./foreground/hover-guide");
var y_scale_1 = require("./y-scale");
var BaseChartProps = (function () {
    function BaseChartProps() {
    }
    return BaseChartProps;
}());
var TEXT_SPACER = 36;
var offsetX = function (e) { return mouse_event_offset_1.mouseEventOffset(e)[0]; };
var BaseChart = (function (_super) {
    __extends(BaseChart, _super);
    function BaseChart() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.container = React.createRef();
        return _this;
    }
    BaseChart.prototype.render = function () {
        var _a = this.props, hoverContent = _a.hoverContent, interactions = _a.interactions, timezone = _a.timezone, yDomain = _a.yDomain, visualisationStage = _a.visualisationStage, chartStage = _a.chartStage, chartId = _a.chartId, children = _a.children, label = _a.label, formatter = _a.formatter, xScale = _a.xScale, xTicks = _a.xTicks;
        var interaction = interactions.interaction, dropHighlight = interactions.dropHighlight, acceptHighlight = interactions.acceptHighlight, mouseLeave = interactions.mouseLeave, dragStart = interactions.dragStart, handleHover = interactions.handleHover;
        var _b = xScale.range(), xRange = _b[1];
        var lineStage = chartStage.within({ top: TEXT_SPACER, right: chartStage.width - xRange, bottom: 1 });
        var axisStage = chartStage.within({ top: TEXT_SPACER, left: xRange, bottom: 1 });
        var yScale = y_scale_1.default(yDomain, lineStage.height);
        var hasInteraction = interaction && interaction.key === chartId;
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "line-base-chart", ref: this.container, style: chartStage.getWidthHeight() },
                React.createElement("svg", { className: "chart-stage", viewBox: chartStage.getViewBox() },
                    React.createElement(background_1.Background, { axisStage: axisStage, formatter: formatter, gridStage: lineStage, xScale: xScale, xTicks: xTicks, yScale: yScale }),
                    children({ yScale: yScale, lineStage: lineStage }),
                    hasInteraction && interaction_1.isHover(interaction) && React.createElement(hover_guide_1.HoverGuide, { hover: interaction, stage: lineStage, yScale: yScale, xScale: xScale })),
                React.createElement("div", { style: lineStage.getWidthHeight(), className: "event-region", onMouseDown: function (e) { return dragStart(chartId, offsetX(e)); }, onMouseMove: function (e) { return handleHover(chartId, offsetX(e)); }, onMouseLeave: mouseLeave }),
                label,
                hasInteraction && React.createElement(foreground_1.Foreground, { container: this.container, stage: lineStage, visualisationStage: visualisationStage, interaction: interaction, hoverContent: hoverContent, dropHighlight: dropHighlight, acceptHighlight: acceptHighlight, xScale: xScale, timezone: timezone })));
    };
    return BaseChart;
}(React.Component));
exports.BaseChart = BaseChart;
//# sourceMappingURL=base-chart.js.map