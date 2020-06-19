"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-promise");
var path = require("path");
var plywood_1 = require("plywood");
var functional_1 = require("../../../common/utils/functional/functional");
var parser_1 = require("../../../common/utils/parser/parser");
function getFileData(filePath) {
    return fs.readFile(filePath, "utf-8")
        .then(function (fileData) {
        try {
            return parser_1.parseData(fileData, path.extname(filePath));
        }
        catch (e) {
            throw new Error("could not parse '" + filePath + "': " + e.message);
        }
    })
        .then(function (fileJSON) {
        fileJSON.forEach(function (d) {
            d["time"] = new Date(d["time"]);
        });
        return fileJSON;
    });
}
exports.getFileData = getFileData;
var FileManager = (function () {
    function FileManager(options) {
        this.logger = options.logger;
        this.verbose = Boolean(options.verbose);
        this.anchorPath = options.anchorPath;
        this.uri = options.uri;
        this.subsetExpression = options.subsetExpression;
        this.verbose = Boolean(options.verbose);
        this.onDatasetChange = options.onDatasetChange || functional_1.noop;
    }
    FileManager.prototype.init = function () {
        var _this = this;
        var _a = this, logger = _a.logger, anchorPath = _a.anchorPath, uri = _a.uri;
        var filePath = path.resolve(anchorPath, uri);
        logger.log("Loading file " + filePath);
        return getFileData(filePath)
            .then(function (rawData) {
            logger.log("Loaded file " + filePath + " (rows = " + rawData.length + ")");
            var dataset = plywood_1.Dataset.fromJS(rawData).hide();
            if (_this.subsetExpression) {
                dataset = dataset.filter(_this.subsetExpression);
            }
            _this.dataset = dataset;
            _this.onDatasetChange(dataset);
        }, function (e) {
            logger.error("Failed to load file " + filePath + " because: " + e.message);
        });
    };
    FileManager.prototype.destroy = function () {
    };
    return FileManager;
}());
exports.FileManager = FileManager;
//# sourceMappingURL=file-manager.js.map