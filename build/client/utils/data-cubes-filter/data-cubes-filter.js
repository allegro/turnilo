"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var functional_1 = require("../../../common/utils/functional/functional");
var general_1 = require("../../../common/utils/general/general");
var ESCAPE_REG_EXP = /[.*+?^${}()|[\]\\]/g;
function escapeRegExp(input) {
    return input.replace(ESCAPE_REG_EXP, "\\$&");
}
function contentRank(description, query) {
    var regExp = new RegExp(escapeRegExp(query), "gi");
    var descriptionMatches = description.match(regExp) || [];
    return descriptionMatches.length;
}
function titleRank(title, query) {
    var lowerCaseQuery = query.toLowerCase();
    var lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes(lowerCaseQuery)) {
        return (Number.MAX_SAFE_INTEGER / 4) - lowerCaseTitle.indexOf(lowerCaseQuery);
    }
    return 0;
}
function filterDataCubes(dataCubes, query, searchInContent) {
    if (searchInContent === void 0) { searchInContent = true; }
    if (query.trim().length === 0) {
        return dataCubes;
    }
    return dataCubes
        .map(function (dataCube) {
        var title = dataCube.title, description = dataCube.description;
        var rank = titleRank(title, query) + (searchInContent ? contentRank(description, query) : 0);
        return rank > 0 ? { dataCube: dataCube, rank: rank } : null;
    })
        .filter(functional_1.complement(general_1.isNil))
        .sort(function (_a, _b) {
        var a = _a.rank;
        var b = _b.rank;
        return b - a;
    })
        .map(function (_a) {
        var dataCube = _a.dataCube;
        return dataCube;
    });
}
exports.default = filterDataCubes;
//# sourceMappingURL=data-cubes-filter.js.map