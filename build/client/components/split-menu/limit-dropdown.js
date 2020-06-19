"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var limit_1 = require("../../../common/limit/limit");
var constants_1 = require("../../config/constants");
var dropdown_1 = require("../dropdown/dropdown");
function formatLimit(limit) {
    return limit === null ? "None" : String(limit);
}
function calculateLimits(includeNone) {
    if (!includeNone)
        return limit_1.AVAILABLE_LIMITS;
    return limit_1.AVAILABLE_LIMITS.concat([null]);
}
exports.LimitDropdown = function (_a) {
    var onLimitSelect = _a.onLimitSelect, limit = _a.limit, includeNone = _a.includeNone;
    return React.createElement(dropdown_1.Dropdown, { label: constants_1.STRINGS.limit, items: calculateLimits(includeNone), selectedItem: limit, renderItem: formatLimit, onSelect: onLimitSelect });
};
//# sourceMappingURL=limit-dropdown.js.map