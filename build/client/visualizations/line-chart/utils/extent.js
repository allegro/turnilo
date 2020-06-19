"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
var concrete_series_1 = require("../../../../common/models/series/concrete-series");
var functional_1 = require("../../../../common/utils/functional/functional");
var general_1 = require("../../../../common/utils/general/general");
var dataset_1 = require("./dataset");
var splits_1 = require("./splits");
function seriesSelectors(series, hasComparison) {
    var get = function (d) { return general_1.readNumber(series.selectValue(d)); };
    if (!hasComparison)
        return [get];
    return [
        get,
        function (d) { return general_1.readNumber(series.selectValue(d, concrete_series_1.SeriesDerivation.PREVIOUS)); }
    ];
}
function datumsExtent(datums, getters) {
    return getters.reduce(function (acc, getter) {
        var extent = d3.extent(datums, getter);
        return d3.extent(extent.concat(acc));
    }, [0, 0]);
}
function extentAcrossSeries(dataset, essence) {
    var hasComparison = essence.hasComparison();
    var series = essence.getConcreteSeries().toArray();
    var getters = functional_1.flatMap(series, function (s) { return seriesSelectors(s, hasComparison); });
    return datumsExtent(dataset.data, getters);
}
exports.extentAcrossSeries = extentAcrossSeries;
function extentAcrossSplits(dataset, essence, series) {
    var getters = seriesSelectors(series, essence.hasComparison());
    if (splits_1.hasNominalSplit(essence)) {
        return dataset.data.reduce(function (acc, datum) {
            var splitDataset = dataset_1.selectSplitDataset(datum);
            if (!splitDataset)
                return acc;
            var extent = datumsExtent(splitDataset.data, getters);
            return d3.extent(acc.concat(extent));
        }, [0, 0]);
    }
    return datumsExtent(dataset.data, getters);
}
exports.extentAcrossSplits = extentAcrossSplits;
//# sourceMappingURL=extent.js.map