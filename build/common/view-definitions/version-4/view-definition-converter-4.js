"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var immutable_1 = require("immutable");
var essence_1 = require("../../models/essence/essence");
var filter_1 = require("../../models/filter/filter");
var splits_1 = require("../../models/splits/splits");
var time_shift_1 = require("../../models/time-shift/time-shift");
var visualization_manifests_1 = require("../../visualization-manifests");
var filter_definition_1 = require("./filter-definition");
var series_definition_1 = require("./series-definition");
var split_definition_1 = require("./split-definition");
var visualization_settings_converter_1 = require("./visualization-settings-converter");
var ViewDefinitionConverter4 = (function () {
    function ViewDefinitionConverter4() {
        this.version = 4;
    }
    ViewDefinitionConverter4.prototype.fromViewDefinition = function (definition, dataCube) {
        var timezone = chronoshift_1.Timezone.fromJS(definition.timezone);
        var visualization = visualization_manifests_1.manifestByName(definition.visualization);
        var visualizationSettings = visualization_settings_converter_1.fromViewDefinition(visualization, definition.visualizationSettings);
        var timeShift = definition.timeShift ? time_shift_1.TimeShift.fromJS(definition.timeShift) : time_shift_1.TimeShift.empty();
        var filter = filter_1.Filter.fromClauses(definition.filters.map(function (fc) { return filter_definition_1.filterDefinitionConverter.toFilterClause(fc, dataCube); }));
        var splitDefinitions = immutable_1.List(definition.splits);
        var splits = new splits_1.Splits({ splits: splitDefinitions.map(split_definition_1.splitConverter.toSplitCombine) });
        var pinnedDimensions = immutable_1.OrderedSet(definition.pinnedDimensions || []);
        var pinnedSort = definition.pinnedSort;
        var series = series_definition_1.seriesDefinitionConverter.toEssenceSeries(definition.series, dataCube.measures);
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
    ViewDefinitionConverter4.prototype.toViewDefinition = function (essence) {
        return {
            visualization: essence.visualization.name,
            visualizationSettings: visualization_settings_converter_1.toViewDefinition(essence.visualization, essence.visualizationSettings),
            timezone: essence.timezone.toJS(),
            filters: essence.filter.clauses.map(function (fc) { return filter_definition_1.filterDefinitionConverter.fromFilterClause(fc); }).toArray(),
            splits: essence.splits.splits.map(split_definition_1.splitConverter.fromSplitCombine).toArray(),
            series: series_definition_1.seriesDefinitionConverter.fromEssenceSeries(essence.series),
            pinnedDimensions: essence.pinnedDimensions.toArray(),
            pinnedSort: essence.pinnedSort,
            timeShift: essence.hasComparison() ? essence.timeShift.toJS() : undefined
        };
    };
    return ViewDefinitionConverter4;
}());
exports.ViewDefinitionConverter4 = ViewDefinitionConverter4;
//# sourceMappingURL=view-definition-converter-4.js.map