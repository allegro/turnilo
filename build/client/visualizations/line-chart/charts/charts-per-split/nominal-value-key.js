"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var formatter_1 = require("../../../../../common/utils/formatter/formatter");
var splits_1 = require("../../utils/splits");
function nominalValueKey(datum, essence) {
    if (!splits_1.hasNominalSplit(essence))
        return "no-nominal-split";
    var nominalDimension = splits_1.getNominalDimension(essence);
    var splitValue = datum[nominalDimension.name];
    return formatter_1.formatSegment(splitValue, essence.timezone);
}
exports.nominalValueKey = nominalValueKey;
//# sourceMappingURL=nominal-value-key.js.map