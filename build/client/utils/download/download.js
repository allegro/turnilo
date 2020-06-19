"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var filesaver = require("file-saver");
var moment_timezone_1 = require("moment-timezone");
var filter_clause_1 = require("../../../common/models/filter-clause/filter-clause");
var functional_1 = require("../../../common/utils/functional/functional");
var general_1 = require("../../../common/utils/general/general");
function getMIMEType(fileType) {
    switch (fileType) {
        case "csv":
            return "text/csv";
        case "tsv":
            return "text/tsv";
        default:
            return "application/json";
    }
}
exports.getMIMEType = getMIMEType;
function download(_a, fileFormat, fileName) {
    var dataset = _a.dataset, options = _a.options;
    var type = getMIMEType(fileFormat) + ";charset=utf-8";
    var blob = new Blob([datasetToFileString(dataset, fileFormat, options)], { type: type });
    if (!fileName)
        fileName = new Date() + "-data";
    fileName += "." + fileFormat;
    filesaver.saveAs(blob, fileName, true);
}
exports.download = download;
function datasetToFileString(dataset, fileFormat, options) {
    if (fileFormat === "csv") {
        return dataset.toCSV(options);
    }
    else if (fileFormat === "tsv") {
        return dataset.toTSV(options);
    }
    else {
        var datasetJS = dataset.toJS();
        return JSON.stringify(datasetJS.data, null, 2);
    }
}
exports.datasetToFileString = datasetToFileString;
function dateToFileString(date) {
    return moment_timezone_1.tz(date, chronoshift_1.Timezone.UTC.toString()).format("YYYY-MM-DD_HH_mm_ss");
}
function dateFromFilter(filter) {
    var timeFilter = filter.clauses.find(function (clause) { return clause instanceof filter_clause_1.FixedTimeFilterClause; });
    if (!timeFilter)
        return "";
    var _a = timeFilter.values.first(), start = _a.start, end = _a.end;
    return dateToFileString(start) + "_" + dateToFileString(end);
}
exports.dateFromFilter = dateFromFilter;
function makeFileName() {
    var nameComponents = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        nameComponents[_i] = arguments[_i];
    }
    return nameComponents
        .filter(functional_1.complement(general_1.isBlank))
        .map(function (name) { return name.toLowerCase(); })
        .join("_")
        .substr(0, 200);
}
exports.makeFileName = makeFileName;
//# sourceMappingURL=download.js.map