"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function splitCanonicalLength(split, dataCube) {
    var reference = split.reference, bucket = split.bucket;
    if (reference !== dataCube.timeAttribute.name)
        return null;
    return bucket.getCanonicalLength();
}
exports.default = splitCanonicalLength;
//# sourceMappingURL=split-canonical-length.js.map