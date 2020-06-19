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
var functional_1 = require("../../../common/utils/functional/functional");
var dom_1 = require("../../utils/dom/dom");
require("./heatmap-labels.scss");
var heatmapLabelClassName = "heatmap-label";
var HeatmapLabels = (function (_super) {
    __extends(HeatmapLabels, _super);
    function HeatmapLabels() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.container = React.createRef();
        return _this;
    }
    HeatmapLabels.prototype.componentDidMount = function () {
        if (this.container.current === null) {
            return;
        }
        var _a = this.props.onMaxLabelSize, onMaxLabelSize = _a === void 0 ? functional_1.noop : _a;
        var maxWidth = Array.from(this.container.current.querySelectorAll("." + heatmapLabelClassName))
            .reduce(function (maxWidth, element) { return Math.max(element.offsetWidth, maxWidth); }, 0);
        onMaxLabelSize(maxWidth + 10);
    };
    HeatmapLabels.prototype.render = function () {
        var _a = this.props, labels = _a.labels, orientation = _a.orientation, hoveredLabel = _a.hoveredLabel, highlightedLabel = _a.highlightedLabel, labelSize = _a.labelSize;
        return (React.createElement("div", { ref: this.container, className: orientation + "-labels" }, labels.map(function (label, index) {
            var highlight = highlightedLabel === index;
            var hover = !highlight && hoveredLabel === index;
            return React.createElement("span", { key: label, className: dom_1.classNames("heatmap-label-wrapper", { "heatmap-label-hovered": hover, "heatmap-label-highlight": highlight }) },
                React.createElement("span", { className: heatmapLabelClassName, style: labelSize ? { width: labelSize } : undefined },
                    React.createElement("span", { className: "heatmap-label-overflow-container" }, label)));
        })));
    };
    return HeatmapLabels;
}(React.Component));
exports.HeatmapLabels = HeatmapLabels;
//# sourceMappingURL=heatmap-labels.js.map