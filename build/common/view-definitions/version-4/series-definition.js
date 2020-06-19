"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var series_list_1 = require("../../models/series-list/series-list");
exports.seriesDefinitionConverter = {
    fromEssenceSeries: function (seriesList) {
        return seriesList.series.toArray().map(function (series) { return series.toJS(); });
    },
    toEssenceSeries: function (seriesDefs, measures) {
        return series_list_1.SeriesList.fromJS(seriesDefs, measures);
    }
};
//# sourceMappingURL=series-definition.js.map