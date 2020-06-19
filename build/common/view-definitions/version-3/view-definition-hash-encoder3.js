"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hash_conversions_1 = require("../hash-conversions");
var ViewDefinitionHashEncoder3 = (function () {
    function ViewDefinitionHashEncoder3() {
    }
    ViewDefinitionHashEncoder3.prototype.decodeUrlHash = function (urlHash, visualization) {
        return hash_conversions_1.hashToObject(urlHash);
    };
    ViewDefinitionHashEncoder3.prototype.encodeUrlHash = function (definition) {
        return hash_conversions_1.objectToHash(definition);
    };
    return ViewDefinitionHashEncoder3;
}());
exports.ViewDefinitionHashEncoder3 = ViewDefinitionHashEncoder3;
//# sourceMappingURL=view-definition-hash-encoder3.js.map