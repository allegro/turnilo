"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var immutable_1 = require("immutable");
var functional_1 = require("../../utils/functional/functional");
var nullable_equals_1 = require("../../utils/immutable-utils/nullable-equals");
var visualization_independent_evaluator_1 = require("../../utils/rules/visualization-independent-evaluator");
var visualization_manifests_1 = require("../../visualization-manifests");
var date_range_1 = require("../date-range/date-range");
var filter_clause_1 = require("../filter-clause/filter-clause");
var series_list_1 = require("../series-list/series-list");
var concrete_series_1 = require("../series/concrete-series");
var create_concrete_series_1 = require("../series/create-concrete-series");
var sort_on_1 = require("../sort-on/sort-on");
var sort_1 = require("../sort/sort");
var splits_1 = require("../splits/splits");
var time_shift_1 = require("../time-shift/time-shift");
var time_shift_env_1 = require("../time-shift/time-shift-env");
var visualization_manifest_1 = require("../visualization-manifest/visualization-manifest");
function constrainDimensions(dimensions, dataCube) {
    return dimensions.filter(function (dimensionName) { return Boolean(dataCube.getDimension(dimensionName)); });
}
var VisStrategy;
(function (VisStrategy) {
    VisStrategy[VisStrategy["FairGame"] = 0] = "FairGame";
    VisStrategy[VisStrategy["UnfairGame"] = 1] = "UnfairGame";
    VisStrategy[VisStrategy["KeepAlways"] = 2] = "KeepAlways";
})(VisStrategy = exports.VisStrategy || (exports.VisStrategy = {}));
var defaultEssence = {
    dataCube: null,
    visualization: null,
    visualizationSettings: null,
    timezone: new chronoshift_1.Timezone("Asia/Kolkata"),
    filter: null,
    splits: null,
    series: null,
    pinnedDimensions: immutable_1.OrderedSet([]),
    pinnedSort: null,
    timeShift: time_shift_1.TimeShift.empty(),
    visResolve: null
};
function resolveVisualization(_a) {
    var visualization = _a.visualization, dataCube = _a.dataCube, splits = _a.splits, series = _a.series;
    var visResolve;
    if (!visualization) {
        var visAndResolve = Essence.getBestVisualization(dataCube, splits, series, null);
        visualization = visAndResolve.visualization;
    }
    var ruleVariables = { dataCube: dataCube, series: series, splits: splits, isSelectedVisualization: true };
    visResolve = visualization.evaluateRules(ruleVariables);
    if (visResolve.isAutomatic()) {
        var adjustment = visResolve.adjustment;
        splits = adjustment.splits;
        visResolve = visualization.evaluateRules(__assign({}, ruleVariables, { splits: splits }));
        if (!visResolve.isReady()) {
            throw new Error(visualization.title + " must be ready after automatic adjustment");
        }
    }
    if (visResolve.isReady()) {
        visResolve = visualization_independent_evaluator_1.visualizationIndependentEvaluator({ dataCube: dataCube, series: series });
    }
    return { visualization: visualization, splits: splits, visResolve: visResolve };
}
var Essence = (function (_super) {
    __extends(Essence, _super);
    function Essence(parameters) {
        var _this = this;
        var filter = parameters.filter, dataCube = parameters.dataCube, timezone = parameters.timezone, timeShift = parameters.timeShift, series = parameters.series, pinnedDimensions = parameters.pinnedDimensions, pinnedSort = parameters.pinnedSort;
        if (!dataCube)
            throw new Error("Essence must have a dataCube");
        var _a = resolveVisualization(parameters), visResolve = _a.visResolve, visualization = _a.visualization, splits = _a.splits;
        var constrainedSeries = series && series.constrainToMeasures(dataCube.measures);
        var isPinnedSortValid = series && constrainedSeries.hasMeasureSeries(pinnedSort);
        var constrainedPinnedSort = isPinnedSortValid ? pinnedSort : Essence.defaultSortReference(constrainedSeries, dataCube);
        var constrainedFilter = filter.constrainToDimensions(dataCube.dimensions);
        var validTimezone = timezone || new chronoshift_1.Timezone("Asia/Kolkata");
        var timeFilter = Essence.timeFilter(filter, dataCube);
        var constrainedTimeShift = timeShift.constrainToFilter(timeFilter, validTimezone);
        _this = _super.call(this, __assign({}, parameters, { dataCube: dataCube,
            visualization: visualization, timezone: validTimezone, timeShift: constrainedTimeShift, splits: splits && splits.constrainToDimensionsAndSeries(dataCube.dimensions, constrainedSeries), filter: constrainedFilter, series: constrainedSeries, pinnedDimensions: constrainDimensions(pinnedDimensions, dataCube), pinnedSort: constrainedPinnedSort, visResolve: visResolve })) || this;
        return _this;
    }
    Essence.getBestVisualization = function (dataCube, splits, series, currentVisualization) {
        var visAndResolves = visualization_manifests_1.MANIFESTS.map(function (visualization) {
            var isSelectedVisualization = visualization === currentVisualization;
            var ruleVariables = { dataCube: dataCube, splits: splits, series: series, isSelectedVisualization: isSelectedVisualization };
            return {
                visualization: visualization,
                resolve: visualization.evaluateRules(ruleVariables)
            };
        });
        return visAndResolves.sort(function (vr1, vr2) { return visualization_manifest_1.Resolve.compare(vr1.resolve, vr2.resolve); })[0];
    };
    Essence.fromDataCube = function (dataCube) {
        var essence = new Essence({
            dataCube: dataCube,
            visualization: null,
            visualizationSettings: null,
            timezone: dataCube.getDefaultTimezone(),
            filter: dataCube.getDefaultFilter(),
            timeShift: time_shift_1.TimeShift.empty(),
            splits: dataCube.getDefaultSplits(),
            series: series_list_1.SeriesList.fromMeasureNames(dataCube.getDefaultSelectedMeasures().toArray()),
            pinnedDimensions: dataCube.getDefaultPinnedDimensions(),
            pinnedSort: dataCube.getDefaultSortMeasure()
        });
        return essence.updateSplitsWithFilter();
    };
    Essence.defaultSortReference = function (series, dataCube) {
        var seriesRefs = immutable_1.Set(series.series.map(function (series) { return series.key(); }));
        var defaultSort = dataCube.getDefaultSortMeasure();
        if (seriesRefs.has(defaultSort))
            return defaultSort;
        return seriesRefs.first();
    };
    Essence.defaultSort = function (series, dataCube) {
        var reference = Essence.defaultSortReference(series, dataCube);
        return new sort_1.SeriesSort({ reference: reference });
    };
    Essence.timeFilter = function (filter, dataCube) {
        var timeFilter = filter.getClauseForDimension(dataCube.getTimeDimension());
        if (!filter_clause_1.isTimeFilter(timeFilter))
            throw new Error("Unknown time filter: " + timeFilter);
        return timeFilter;
    };
    Essence.prototype.toString = function () {
        return "[Essence]";
    };
    Essence.prototype.toJS = function () {
        return {
            visualization: this.visualization,
            visualizationSettings: this.visualizationSettings,
            dataCube: this.dataCube.toJS(),
            timezone: this.timezone.toJS(),
            filter: this.filter && this.filter.toJS(),
            splits: this.splits && this.splits.toJS(),
            series: this.series.toJS(),
            timeShift: this.timeShift.toJS(),
            pinnedSort: this.pinnedSort,
            pinnedDimensions: this.pinnedDimensions.toJS(),
            visResolve: this.visResolve
        };
    };
    Essence.prototype.getTimeAttribute = function () {
        return this.dataCube.timeAttribute;
    };
    Essence.prototype.getTimeDimension = function () {
        return this.dataCube.getTimeDimension();
    };
    Essence.prototype.evaluateSelection = function (filter, timekeeper) {
        if (filter instanceof filter_clause_1.FixedTimeFilterClause)
            return filter;
        var _a = this, timezone = _a.timezone, dataCube = _a.dataCube;
        return filter.evaluate(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone);
    };
    Essence.prototype.combineWithPrevious = function (filter) {
        var timeDimension = this.getTimeDimension();
        var timeFilter = filter.getClauseForDimension(timeDimension);
        if (!timeFilter || !(timeFilter instanceof filter_clause_1.FixedTimeFilterClause)) {
            throw new Error("Can't combine current time filter with previous period without time filter");
        }
        return filter.setClause(this.combinePeriods(timeFilter));
    };
    Essence.prototype.getTimeShiftEnv = function (timekeeper) {
        var timeDimension = this.getTimeDimension();
        if (!this.hasComparison()) {
            return { type: time_shift_env_1.TimeShiftEnvType.CURRENT };
        }
        var currentFilter = filter_clause_1.toExpression(this.currentTimeFilter(timekeeper), timeDimension);
        var previousFilter = filter_clause_1.toExpression(this.previousTimeFilter(timekeeper), timeDimension);
        return {
            type: time_shift_env_1.TimeShiftEnvType.WITH_PREVIOUS,
            shift: this.timeShift.valueOf(),
            currentFilter: currentFilter,
            previousFilter: previousFilter
        };
    };
    Essence.prototype.constrainTimeShift = function () {
        var _a = this, timeShift = _a.timeShift, timezone = _a.timezone;
        return this.set("timeShift", timeShift.constrainToFilter(this.timeFilter(), timezone));
    };
    Essence.prototype.getEffectiveFilter = function (timekeeper, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.combineWithPrevious, combineWithPrevious = _c === void 0 ? false : _c, _d = _b.unfilterDimension, unfilterDimension = _d === void 0 ? null : _d;
        var _e = this, dataCube = _e.dataCube, timezone = _e.timezone;
        var filter = this.filter;
        if (unfilterDimension)
            filter = filter.removeClause(unfilterDimension.name);
        filter = filter.getSpecificFilter(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone);
        if (combineWithPrevious) {
            filter = this.combineWithPrevious(filter);
        }
        return filter;
    };
    Essence.prototype.hasComparison = function () {
        return !this.timeShift.isEmpty();
    };
    Essence.prototype.combinePeriods = function (timeFilter) {
        var _a = this, timezone = _a.timezone, timeShift = _a.timeShift;
        var duration = timeShift.valueOf();
        return timeFilter.update("values", function (values) {
            return values.flatMap(function (_a) {
                var start = _a.start, end = _a.end;
                return [
                    new date_range_1.DateRange({ start: start, end: end }),
                    new date_range_1.DateRange({ start: duration.shift(start, timezone, -1), end: duration.shift(end, timezone, -1) })
                ];
            });
        });
    };
    Essence.prototype.timeFilter = function () {
        var _a = this, filter = _a.filter, dataCube = _a.dataCube;
        return Essence.timeFilter(filter, dataCube);
    };
    Essence.prototype.fixedTimeFilter = function (timekeeper) {
        var _a = this, dataCube = _a.dataCube, timezone = _a.timezone;
        var timeFilter = this.timeFilter();
        if (timeFilter instanceof filter_clause_1.FixedTimeFilterClause)
            return timeFilter;
        return timeFilter.evaluate(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone);
    };
    Essence.prototype.currentTimeFilter = function (timekeeper) {
        return this.fixedTimeFilter(timekeeper);
    };
    Essence.prototype.shiftToPrevious = function (timeFilter) {
        var _a = this, timezone = _a.timezone, timeShift = _a.timeShift;
        var duration = timeShift.valueOf();
        return timeFilter.update("values", function (values) {
            return values.map(function (_a) {
                var start = _a.start, end = _a.end;
                return new date_range_1.DateRange({
                    start: duration.shift(start, timezone, -1),
                    end: duration.shift(end, timezone, -1)
                });
            });
        });
    };
    Essence.prototype.previousTimeFilter = function (timekeeper) {
        var timeFilter = this.fixedTimeFilter(timekeeper);
        return this.shiftToPrevious(timeFilter);
    };
    Essence.prototype.getTimeClause = function () {
        var timeDimension = this.getTimeDimension();
        return this.filter.getClauseForDimension(timeDimension);
    };
    Essence.prototype.concreteSeriesFromSeries = function (series) {
        var reference = series.reference;
        var dataCube = this.dataCube;
        var measure = dataCube.getMeasure(reference);
        return create_concrete_series_1.default(series, measure, dataCube.measures);
    };
    Essence.prototype.findConcreteSeries = function (key) {
        var series = this.series.series.find(function (series) { return series.key() === key; });
        if (!series)
            return null;
        return this.concreteSeriesFromSeries(series);
    };
    Essence.prototype.getConcreteSeries = function () {
        var _this = this;
        return this.series.series.map(function (series) { return _this.concreteSeriesFromSeries(series); });
    };
    Essence.prototype.differentDataCube = function (other) {
        return this.dataCube !== other.dataCube;
    };
    Essence.prototype.differentSplits = function (other) {
        return !this.splits.equals(other.splits);
    };
    Essence.prototype.differentTimeShift = function (other) {
        return !this.timeShift.equals(other.timeShift);
    };
    Essence.prototype.differentSeries = function (other) {
        return !this.series.equals(other.series);
    };
    Essence.prototype.differentSettings = function (other) {
        return !nullable_equals_1.default(this.visualizationSettings, other.visualizationSettings);
    };
    Essence.prototype.differentEffectiveFilter = function (other, myTimekeeper, otherTimekeeper, unfilterDimension) {
        if (unfilterDimension === void 0) { unfilterDimension = null; }
        var myEffectiveFilter = this.getEffectiveFilter(myTimekeeper, { unfilterDimension: unfilterDimension });
        var otherEffectiveFilter = other.getEffectiveFilter(otherTimekeeper, { unfilterDimension: unfilterDimension });
        return !myEffectiveFilter.equals(otherEffectiveFilter);
    };
    Essence.prototype.getCommonSort = function () {
        return this.splits.getCommonSort();
    };
    Essence.prototype.changeComparisonShift = function (timeShift) {
        return this
            .set("timeShift", timeShift)
            .constrainTimeShift()
            .updateSorts();
    };
    Essence.prototype.updateDataCube = function (newDataCube) {
        var dataCube = this.dataCube;
        if (dataCube.equals(newDataCube))
            return this;
        var seriesInNewCube = this.series.constrainToMeasures(newDataCube.measures);
        var newSeriesList = !seriesInNewCube.isEmpty()
            ? seriesInNewCube
            : series_list_1.SeriesList.fromMeasureNames(newDataCube.getDefaultSelectedMeasures().toArray());
        return this
            .set("dataCube", newDataCube)
            .update("filter", function (filter) { return filter.constrainToDimensions(newDataCube.dimensions); })
            .set("series", newSeriesList)
            .update("splits", function (splits) { return splits.constrainToDimensionsAndSeries(newDataCube.dimensions, newSeriesList); })
            .update("pinnedDimensions", function (pinned) { return constrainDimensions(pinned, newDataCube); })
            .update("pinnedSort", function (sort) { return !newDataCube.getMeasure(sort) ? newDataCube.getDefaultSortMeasure() : sort; })
            .resolveVisualizationAndUpdate();
    };
    Essence.prototype.changeFilter = function (filter) {
        var oldFilter = this.filter;
        return this
            .set("filter", filter)
            .constrainTimeShift()
            .update("splits", function (splits) {
            var differentClauses = filter.clauses.filter(function (clause) {
                var otherClause = oldFilter.clauseForReference(clause.reference);
                return !clause.equals(otherClause);
            });
            return splits.removeBucketingFrom(immutable_1.Set(differentClauses.map(function (clause) { return clause.reference; })));
        })
            .updateSplitsWithFilter();
    };
    Essence.prototype.changeTimezone = function (newTimezone) {
        var timezone = this.timezone;
        if (timezone === newTimezone)
            return this;
        return this.set("timezone", newTimezone);
    };
    Essence.prototype.convertToSpecificFilter = function (timekeeper) {
        var _a = this, dataCube = _a.dataCube, filter = _a.filter, timezone = _a.timezone;
        if (!filter.isRelative())
            return this;
        return this.changeFilter(filter.getSpecificFilter(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone));
    };
    Essence.prototype.defaultSplitSort = function (split) {
        var _a = this, dataCube = _a.dataCube, series = _a.series;
        var dimension = dataCube.getDimension(split.reference);
        var sortStrategy = dimension.sortStrategy, name = dimension.name, kind = dimension.kind;
        if (sortStrategy === "self" || sortStrategy === name) {
            return new sort_1.DimensionSort({ reference: name, direction: sort_1.SortDirection.ascending });
        }
        if (sortStrategy && series.hasMeasureSeries(sortStrategy)) {
            return new sort_1.SeriesSort({ reference: sortStrategy, direction: sort_1.SortDirection.descending });
        }
        if (kind === "time") {
            return new sort_1.DimensionSort({ reference: name, direction: sort_1.SortDirection.ascending });
        }
        return new sort_1.SeriesSort({ reference: this.defaultSort(), direction: sort_1.SortDirection.descending });
    };
    Essence.prototype.setSortOnSplits = function (splits) {
        var _this = this;
        return splits.update("splits", function (list) { return list.map(function (split) {
            return sort_1.isSortEmpty(split.sort) ? split.set("sort", _this.defaultSplitSort(split)) : split;
        }); });
    };
    Essence.prototype.changeSplits = function (splits, strategy) {
        var _a = this, oldSplits = _a.splits, dataCube = _a.dataCube, visualization = _a.visualization, visResolve = _a.visResolve, filter = _a.filter, series = _a.series;
        var newSplits = this.setSortOnSplits(splits).updateWithFilter(filter, dataCube.dimensions);
        function adjustStrategy(strategy) {
            if (visResolve.isManual()) {
                return VisStrategy.KeepAlways;
            }
            if (oldSplits.length() > 0 && newSplits.length() !== 0) {
                return VisStrategy.UnfairGame;
            }
            return strategy;
        }
        function adjustVisualization(essence) {
            if (adjustStrategy(strategy) !== VisStrategy.FairGame)
                return essence;
            var newVis = Essence.getBestVisualization(dataCube, newSplits, series, visualization).visualization;
            if (newVis === visualization)
                return essence;
            return essence.changeVisualization(newVis, newVis.visualizationSettings.defaults);
        }
        return functional_1.thread(this, function (essence) { return essence.set("splits", newSplits); }, adjustVisualization, function (essence) { return essence.resolveVisualizationAndUpdate(); });
    };
    Essence.prototype.changeSplit = function (splitCombine, strategy) {
        return this.changeSplits(splits_1.Splits.fromSplit(splitCombine), strategy);
    };
    Essence.prototype.addSplit = function (split, strategy) {
        return this.changeSplits(this.splits.addSplit(split), strategy);
    };
    Essence.prototype.removeSplit = function (split, strategy) {
        return this.changeSplits(this.splits.removeSplit(split), strategy);
    };
    Essence.prototype.addSeries = function (series) {
        return this.changeSeriesList(this.series.addSeries(series));
    };
    Essence.prototype.removeSeries = function (series) {
        return this.changeSeriesList(this.series.removeSeries(series));
    };
    Essence.prototype.changeSeriesList = function (series) {
        return this
            .set("series", series)
            .updateSorts()
            .resolveVisualizationAndUpdate();
    };
    Essence.prototype.defaultSort = function () {
        return Essence.defaultSortReference(this.series, this.dataCube);
    };
    Essence.prototype.updateSorts = function () {
        var _this = this;
        var seriesRefs = immutable_1.Set(this.series.series.map(function (series) { return series.reference; }));
        return this
            .update("pinnedSort", function (sort) {
            if (seriesRefs.has(sort))
                return sort;
            return _this.defaultSort();
        })
            .update("splits", function (splits) { return splits.update("splits", function (splits) { return splits.map(function (split) {
            var sort = split.sort;
            var type = sort.type, reference = sort.reference;
            switch (type) {
                case sort_1.SortType.DIMENSION:
                    return split;
                case sort_1.SortType.SERIES: {
                    var measureSort = sort;
                    if (!seriesRefs.has(reference)) {
                        var measureSortRef = _this.defaultSort();
                        if (measureSortRef) {
                            return split.changeSort(new sort_1.SeriesSort({
                                reference: measureSortRef
                            }));
                        }
                        return split.changeSort(new sort_1.DimensionSort({
                            reference: split.reference
                        }));
                    }
                    if (measureSort.period !== concrete_series_1.SeriesDerivation.CURRENT && !_this.hasComparison()) {
                        return split.update("sort", function (sort) {
                            return sort.set("period", concrete_series_1.SeriesDerivation.CURRENT);
                        });
                    }
                    return split;
                }
            }
        }); }); });
    };
    Essence.prototype.updateSplitsWithFilter = function () {
        var _a = this, filter = _a.filter, dimensions = _a.dataCube.dimensions, splits = _a.splits;
        var newSplits = splits.updateWithFilter(filter, dimensions);
        if (splits === newSplits)
            return this;
        return this.set("splits", newSplits).resolveVisualizationAndUpdate();
    };
    Essence.prototype.changeVisualization = function (visualization, settings) {
        if (settings === void 0) { settings = visualization.visualizationSettings.defaults; }
        return this
            .set("visualization", visualization)
            .set("visualizationSettings", settings)
            .resolveVisualizationAndUpdate();
    };
    Essence.prototype.resolveVisualizationAndUpdate = function () {
        var _a = this, visualization = _a.visualization, splits = _a.splits, dataCube = _a.dataCube, series = _a.series;
        var result = resolveVisualization({ splits: splits, dataCube: dataCube, visualization: visualization, series: series });
        return this
            .set("visResolve", result.visResolve)
            .set("visualization", result.visualization)
            .set("splits", result.splits);
    };
    Essence.prototype.pin = function (_a) {
        var name = _a.name;
        return this.update("pinnedDimensions", function (pinned) { return pinned.add(name); });
    };
    Essence.prototype.unpin = function (_a) {
        var name = _a.name;
        return this.update("pinnedDimensions", function (pinned) { return pinned.remove(name); });
    };
    Essence.prototype.changePinnedSortSeries = function (series) {
        return this.set("pinnedSort", series.plywoodKey());
    };
    Essence.prototype.seriesSortOns = function (withTimeShift) {
        var series = this.getConcreteSeries();
        var addPrevious = withTimeShift && this.hasComparison();
        if (!addPrevious)
            return series.map(function (series) { return new sort_on_1.SeriesSortOn(series); });
        return series.flatMap(function (series) {
            return [
                new sort_on_1.SeriesSortOn(series),
                new sort_on_1.SeriesSortOn(series, concrete_series_1.SeriesDerivation.PREVIOUS),
                new sort_on_1.SeriesSortOn(series, concrete_series_1.SeriesDerivation.DELTA)
            ];
        });
    };
    Essence.prototype.getPinnedSortSeries = function () {
        return this.findConcreteSeries(this.pinnedSort);
    };
    return Essence;
}(immutable_1.Record(defaultEssence)));
exports.Essence = Essence;
//# sourceMappingURL=essence.js.map