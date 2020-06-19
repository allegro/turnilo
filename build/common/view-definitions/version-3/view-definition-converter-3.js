"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var immutable_1 = require("immutable");
var essence_1 = require("../../models/essence/essence");
var filter_1 = require("../../models/filter/filter");
var splits_1 = require("../../models/splits/splits");
var time_shift_1 = require("../../models/time-shift/time-shift");
var visualization_manifests_1 = require("../../visualization-manifests");
var filter_definition_1 = require("../version-4/filter-definition");
var split_definition_1 = require("../version-4/split-definition");
var measures_definition_1 = require("./measures-definition");
var ViewDefinitionConverter3 = (function () {
    function ViewDefinitionConverter3() {
        this.version = 3;
    }
    ViewDefinitionConverter3.prototype.fromViewDefinition = function (definition, dataCube) {
        var timezone = chronoshift_1.Timezone.fromJS(definition.timezone);
        var visualization = visualization_manifests_1.manifestByName(definition.visualization);
        var visualizationSettings = visualization.visualizationSettings.defaults;
        var timeShift = definition.timeShift ? time_shift_1.TimeShift.fromJS(definition.timeShift) : time_shift_1.TimeShift.empty();
        var filter = filter_1.Filter.fromClauses(definition.filters.map(function (fc) { return filter_definition_1.filterDefinitionConverter.toFilterClause(fc, dataCube); }));
        var splitDefinitions = immutable_1.List(definition.splits);
        var splits = new splits_1.Splits({ splits: splitDefinitions.map(split_definition_1.splitConverter.toSplitCombine) });
        var pinnedDimensions = immutable_1.OrderedSet(definition.pinnedDimensions || []);
        var pinnedSort = definition.pinnedSort;
        var series = measures_definition_1.seriesDefinitionConverter.toEssenceSeries(definition.measures, dataCube.measures);
        return new essence_1.Essence({
            dataCube: dataCube,
            visualization: visualization,
            visualizationSettings: visualizationSettings,
            timezone: timezone,
            filter: filter,
            timeShift: timeShift,
            splits: splits,
            pinnedDimensions: pinnedDimensions,
            series: series,
            pinnedSort: pinnedSort
        });
    };
    ViewDefinitionConverter3.prototype.toViewDefinition = function (essence) {
        throw new Error("toViewDefinition is not supported in Version 3");
    };
    return ViewDefinitionConverter3;
}());
exports.ViewDefinitionConverter3 = ViewDefinitionConverter3;
//# sourceMappingURL=view-definition-converter-3.js.map