"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var granularity_1 = require("../../../common/models/granularity/granularity");
var constants_1 = require("../../config/constants");
var string_input_with_presets_1 = require("../input-with-presets/string-input-with-presets");
exports.GranularityPicker = function (_a) {
    var dimension = _a.dimension, granularity = _a.granularity, granularityChange = _a.granularityChange;
    if (!dimension.isContinuous())
        return null;
    var granularities = dimension.granularities || granularity_1.getGranularities(dimension.kind, dimension.bucketedBy);
    var presets = granularities.map(function (g) {
        return {
            name: granularity_1.formatGranularity(g),
            identity: granularity_1.granularityToString(g)
        };
    });
    var placeholder = dimension.kind === "time" ? constants_1.STRINGS.floorableDurationsExamples : "Bucket size";
    return React.createElement(string_input_with_presets_1.StringInputWithPresets, { title: constants_1.STRINGS.granularity, selected: granularity, errorMessage: granularity_1.validateGranularity(dimension.kind, granularity), onChange: granularityChange, placeholder: placeholder, presets: presets });
};
//# sourceMappingURL=granularity-picker.js.map