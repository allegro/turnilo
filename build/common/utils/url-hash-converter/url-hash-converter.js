"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_definitions_1 = require("../../view-definitions");
var SEGMENT_SEPARATOR = "/";
var MINIMAL_HASH_SEGMENTS_COUNT = 2;
function isLegacyWithVisualizationPrefix(hashParts) {
    var visualization = hashParts[0], version = hashParts[1];
    return view_definitions_1.version2Visualizations.has(visualization) && version === view_definitions_1.LEGACY_VIEW_DEFINITION_VERSION && hashParts.length >= 3;
}
function isVersion3VisualizationPrefix(hashParts) {
    return hashParts[0] === "3";
}
function isVersion4VisualizationPrefix(hashParts) {
    return hashParts[0] === "4";
}
function getHashSegments(hash) {
    var hashParts = hash.split(SEGMENT_SEPARATOR);
    if (hashParts.length < MINIMAL_HASH_SEGMENTS_COUNT) {
        throw new Error("Expected " + MINIMAL_HASH_SEGMENTS_COUNT + " hash segments, got " + hashParts.length + ".");
    }
    if (isLegacyWithVisualizationPrefix(hashParts)) {
        return {
            version: hashParts[1],
            encodedModel: hashParts.splice(2).join(SEGMENT_SEPARATOR),
            visualization: hashParts[0]
        };
    }
    else if (isVersion3VisualizationPrefix(hashParts)) {
        return {
            version: hashParts[0],
            encodedModel: hashParts.splice(1).join(SEGMENT_SEPARATOR),
            visualization: undefined
        };
    }
    else if (isVersion4VisualizationPrefix(hashParts)) {
        return {
            version: hashParts[0],
            encodedModel: hashParts.splice(1).join(SEGMENT_SEPARATOR),
            visualization: undefined
        };
    }
    else {
        throw new Error("Unsupported url hash: " + hash + ".");
    }
}
exports.getHashSegments = getHashSegments;
exports.urlHashConverter = {
    essenceFromHash: function (hash, dataCube) {
        var _a = getHashSegments(hash), version = _a.version, encodedModel = _a.encodedModel, visualization = _a.visualization;
        var urlEncoder = view_definitions_1.definitionUrlEncoders[version];
        var definitionConverter = view_definitions_1.definitionConverters[version];
        var definition = urlEncoder.decodeUrlHash(encodedModel, visualization);
        return definitionConverter.fromViewDefinition(definition, dataCube);
    },
    toHash: function (essence, version) {
        if (version === void 0) { version = view_definitions_1.DEFAULT_VIEW_DEFINITION_VERSION; }
        var visualization = essence.visualization;
        var urlEncoder = view_definitions_1.definitionUrlEncoders[version];
        var definitionConverter = view_definitions_1.definitionConverters[version];
        if (urlEncoder == null || definitionConverter == null) {
            throw new Error("Unsupported url hash version: " + version + ".");
        }
        var definition = definitionConverter.toViewDefinition(essence);
        var encodedDefinition = urlEncoder.encodeUrlHash(definition);
        var hashParts = [version, encodedDefinition];
        if (version === view_definitions_1.LEGACY_VIEW_DEFINITION_VERSION) {
            hashParts.unshift(visualization.name);
        }
        return hashParts.join(SEGMENT_SEPARATOR);
    }
};
//# sourceMappingURL=url-hash-converter.js.map