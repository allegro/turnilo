"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function equalParams(params, otherParams) {
    var essence = params.essence, searchText = params.searchText, sortOn = params.sortOn, dimension = params.dimension, timekeeper = params.timekeeper;
    var otherEssence = otherParams.essence, otherSearchText = otherParams.searchText, otherSortOn = otherParams.sortOn, otherDimension = otherParams.dimension, otherTimekeeper = otherParams.timekeeper;
    return essence.equals(otherEssence) &&
        searchText === otherSearchText &&
        timekeeper === otherTimekeeper &&
        dimension === otherDimension &&
        sortOn.equals(otherSortOn);
}
exports.equalParams = equalParams;
//# sourceMappingURL=query-params.js.map