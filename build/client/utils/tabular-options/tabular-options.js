"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var concrete_series_1 = require("../../../common/models/series/concrete-series");
function findSeriesAndDerivation(name, concreteSeriesList) {
    var _loop_1 = function (derivation) {
        var series = concreteSeriesList.find(function (s) { return s.plywoodKey(derivation) === name; });
        if (series) {
            return { value: { series: series, derivation: derivation } };
        }
    };
    for (var _i = 0, _a = [concrete_series_1.SeriesDerivation.CURRENT, concrete_series_1.SeriesDerivation.PREVIOUS, concrete_series_1.SeriesDerivation.DELTA]; _i < _a.length; _i++) {
        var derivation = _a[_i];
        var state_1 = _loop_1(derivation);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return null;
}
function tabularOptions(essence) {
    return {
        formatter: {
            TIME_RANGE: function (range) { return range.start.toISOString(); }
        },
        attributeFilter: function (_a) {
            var name = _a.name;
            return findSeriesAndDerivation(name, essence.getConcreteSeries()) !== null
                || essence.dataCube.getDimension(name) !== undefined;
        },
        attributeTitle: function (_a) {
            var name = _a.name;
            var seriesWithDerivation = findSeriesAndDerivation(name, essence.getConcreteSeries());
            if (seriesWithDerivation) {
                var series = seriesWithDerivation.series, derivation = seriesWithDerivation.derivation;
                return series.title(derivation);
            }
            var dimension = essence.dataCube.getDimension(name);
            if (dimension) {
                return dimension.title;
            }
            return name;
        },
        timezone: essence.timezone
    };
}
exports.default = tabularOptions;
//# sourceMappingURL=tabular-options.js.map