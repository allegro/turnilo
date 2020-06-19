"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dimensionForSplit(essence, split) {
    return essence.dataCube.getDimension(split.reference);
}
function getContinuousSplit(_a) {
    var splits = _a.splits.splits;
    return splits.last();
}
exports.getContinuousSplit = getContinuousSplit;
function getContinuousDimension(essence) {
    var split = getContinuousSplit(essence);
    return dimensionForSplit(essence, split);
}
exports.getContinuousDimension = getContinuousDimension;
function getContinuousReference(essence) {
    return getContinuousSplit(essence).reference;
}
exports.getContinuousReference = getContinuousReference;
function getNominalSplit(_a) {
    var splits = _a.splits.splits;
    return splits.count() === 1 ? null : splits.first();
}
exports.getNominalSplit = getNominalSplit;
function hasNominalSplit(essence) {
    return getNominalSplit(essence) !== null;
}
exports.hasNominalSplit = hasNominalSplit;
function getNominalDimension(essence) {
    var split = getNominalSplit(essence);
    return split && dimensionForSplit(essence, split);
}
exports.getNominalDimension = getNominalDimension;
//# sourceMappingURL=splits.js.map