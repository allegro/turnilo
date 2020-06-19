"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
require("./heatmap-legend.scss");
var leftMargin = 5;
var topMargin = 10;
var bottomMargin = 5;
var tickLength = 15;
var tickLabelTopOffset = 4;
var tickLabelLeftOffset = 17;
var stripeWidth = 10;
exports.HeatmapLegend = function (_a) {
    var width = _a.width, height = _a.height, series = _a.series, scale = _a.scale;
    var _b = scale.domain(), min = _b[0], max = _b[1];
    if (isNaN(min) || isNaN(max))
        return null;
    var stripeLength = height - topMargin - bottomMargin;
    var _c = scale.range(), startColor = _c[0], endColor = _c[1];
    var format = series.formatter();
    return React.createElement("svg", { className: "heatmap-legend", width: width + "px", height: height + "px" },
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "heatmap-stripe", gradientTransform: "rotate(90)" },
                React.createElement("stop", { offset: "0%", stopColor: startColor }),
                React.createElement("stop", { offset: "10%", stopColor: startColor }),
                React.createElement("stop", { offset: "90%", stopColor: endColor }),
                React.createElement("stop", { offset: "100%", stopColor: endColor }))),
        React.createElement("g", { transform: "translate(" + leftMargin + ", " + topMargin + ")" },
            React.createElement("rect", { className: "heatmap-legend-stripe", x: 0, y: 0, width: stripeWidth, height: stripeLength, fill: "url(#heatmap-stripe)" }),
            React.createElement("line", { className: "heatmap-legend-stripe-axis", x1: 0.5, x2: 0.5, y1: 0, y2: stripeLength }),
            React.createElement("g", { className: "heatmap-lower-bound" },
                React.createElement("line", { className: "heatmap-lower-bound-tick", x1: 0, x2: tickLength, y1: 0.5, y2: 0.5 }),
                React.createElement("text", { className: "heatmap-lower-bound-value", x: tickLabelLeftOffset, y: tickLabelTopOffset }, format(min))),
            React.createElement("g", { className: "heatmap-upper-bound" },
                React.createElement("line", { className: "heatmap-upper-bound-tick", x1: 0, x2: tickLength, y1: stripeLength + 0.5, y2: stripeLength + 0.5 }),
                React.createElement("text", { className: "heatmap-upper-bound-value", x: tickLabelLeftOffset, y: stripeLength + tickLabelTopOffset }, format(max)))));
};
//# sourceMappingURL=heatmap-legend.js.map