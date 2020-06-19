"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var formatter_1 = require("../../../../../common/utils/formatter/formatter");
var splits_1 = require("../../utils/splits");
require("./label.scss");
exports.Label = function (props) {
    var essence = props.essence, datum = props.datum;
    if (splits_1.hasNominalSplit(essence)) {
        var nominalDimension = splits_1.getNominalDimension(essence);
        var splitValue = datum[nominalDimension.name];
        return React.createElement("div", { className: "split-chart-label" },
            React.createElement("span", { className: "split-chart-dimension-title" }, nominalDimension.title),
            React.createElement("span", { className: "split-chart-value" },
                ": ",
                formatter_1.formatSegment(splitValue, essence.timezone)));
    }
    return null;
};
//# sourceMappingURL=label.js.map