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
var totals_1 = require("../../../common/visualization-manifests/totals/totals");
var base_visualization_1 = require("../base-visualization/base-visualization");
var total_1 = require("./total");
require("./totals.scss");
var Totals = (function (_super) {
    __extends(Totals, _super);
    function Totals() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = totals_1.TOTALS_MANIFEST.name;
        return _this;
    }
    Totals.prototype.renderTotals = function (dataset) {
        var essence = this.props.essence;
        var series = essence.getConcreteSeries().toArray();
        var datum = dataset.data[0];
        return series.map(function (series) {
            return React.createElement(total_1.Total, { key: series.reactKey(), series: series, datum: datum, showPrevious: essence.hasComparison() });
        });
    };
    Totals.prototype.renderInternals = function (dataset) {
        return React.createElement("div", { className: "internals" },
            React.createElement("div", { className: "total-container" }, this.renderTotals(dataset)));
    };
    return Totals;
}(base_visualization_1.BaseVisualization));
exports.Totals = Totals;
//# sourceMappingURL=totals.js.map