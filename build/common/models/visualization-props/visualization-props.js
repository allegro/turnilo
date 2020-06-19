"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DatasetLoadStatus;
(function (DatasetLoadStatus) {
    DatasetLoadStatus[DatasetLoadStatus["LOADED"] = 0] = "LOADED";
    DatasetLoadStatus[DatasetLoadStatus["LOADING"] = 1] = "LOADING";
    DatasetLoadStatus[DatasetLoadStatus["ERROR"] = 2] = "ERROR";
})(DatasetLoadStatus || (DatasetLoadStatus = {}));
exports.loading = { status: DatasetLoadStatus.LOADING };
exports.error = function (error) { return ({ error: error, status: DatasetLoadStatus.ERROR }); };
exports.loaded = function (dataset) { return ({ status: DatasetLoadStatus.LOADED, dataset: dataset }); };
exports.isLoading = function (dl) { return dl.status === DatasetLoadStatus.LOADING; };
exports.isLoaded = function (dl) { return dl.status === DatasetLoadStatus.LOADED; };
exports.isError = function (dl) { return dl.status === DatasetLoadStatus.ERROR; };
//# sourceMappingURL=visualization-props.js.map