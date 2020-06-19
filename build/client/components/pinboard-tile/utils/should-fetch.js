"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sort_on_1 = require("../../../../common/models/sort-on/sort-on");
function shouldFetchData(_a, previousProps, _b, previousState) {
    var essence = _a.essence, timekeeper = _a.timekeeper, dimension = _a.dimension, sortOn = _a.sortOn;
    var searchText = _b.searchText;
    var previousEssence = previousProps.essence;
    var previousTimekeeper = previousProps.timekeeper;
    var previousDimension = previousProps.dimension;
    var previousSortOn = previousProps.sortOn;
    var previousSearchText = previousState.searchText;
    return essence.differentDataCube(previousEssence) ||
        essence.differentEffectiveFilter(previousEssence, timekeeper, previousTimekeeper, dimension) ||
        !dimension.equals(previousDimension) ||
        previousSearchText !== searchText ||
        !sort_on_1.SortOn.equals(sortOn, previousSortOn);
}
exports.shouldFetchData = shouldFetchData;
//# sourceMappingURL=should-fetch.js.map