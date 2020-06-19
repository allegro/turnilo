"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var series_list_1 = require("../../models/series-list/series-list");
exports.seriesDefinitionConverter = {
    toEssenceSeries: function (_a, measures) {
        var isMulti = _a.isMulti, multi = _a.multi, single = _a.single;
        var names = isMulti ? multi : [single];
        return series_list_1.SeriesList.fromMeasures(measures.getMeasuresByNames(names));
    }
};
//# sourceMappingURL=measures-definition.js.map