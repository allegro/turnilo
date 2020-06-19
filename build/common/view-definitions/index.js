"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_definition_converter_2_1 = require("./version-2/view-definition-converter-2");
var view_definition_hash_encoder2_1 = require("./version-2/view-definition-hash-encoder2");
var view_definition_converter_3_1 = require("./version-3/view-definition-converter-3");
var view_definition_hash_encoder3_1 = require("./version-3/view-definition-hash-encoder3");
var view_definition_converter_4_1 = require("./version-4/view-definition-converter-4");
exports.DEFAULT_VIEW_DEFINITION_VERSION = "4";
exports.LEGACY_VIEW_DEFINITION_VERSION = "2";
exports.definitionConverters = {
    2: new view_definition_converter_2_1.ViewDefinitionConverter2(),
    3: new view_definition_converter_3_1.ViewDefinitionConverter3(),
    4: new view_definition_converter_4_1.ViewDefinitionConverter4()
};
exports.definitionUrlEncoders = {
    2: new view_definition_hash_encoder2_1.ViewDefinitionHashEncoder2(),
    3: new view_definition_hash_encoder3_1.ViewDefinitionHashEncoder3(),
    4: new view_definition_hash_encoder3_1.ViewDefinitionHashEncoder3()
};
exports.defaultDefinitionConverter = exports.definitionConverters[exports.DEFAULT_VIEW_DEFINITION_VERSION];
exports.defaultDefinitionUrlEncoder = exports.definitionUrlEncoders[exports.DEFAULT_VIEW_DEFINITION_VERSION];
exports.version2Visualizations = new Set([
    "totals",
    "table",
    "line-chart",
    "bar-chart"
]);
//# sourceMappingURL=index.js.map