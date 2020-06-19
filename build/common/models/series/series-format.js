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
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var numbro = require("numbro");
var general_1 = require("../../utils/general/general");
var SeriesFormatType;
(function (SeriesFormatType) {
    SeriesFormatType["DEFAULT"] = "default";
    SeriesFormatType["EXACT"] = "exact";
    SeriesFormatType["PERCENT"] = "percent";
    SeriesFormatType["CUSTOM"] = "custom";
})(SeriesFormatType = exports.SeriesFormatType || (exports.SeriesFormatType = {}));
var defaultFormat = { type: SeriesFormatType.DEFAULT, value: "" };
var SeriesFormat = (function (_super) {
    __extends(SeriesFormat, _super);
    function SeriesFormat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SeriesFormat.fromJS = function (params) {
        return new SeriesFormat(params);
    };
    return SeriesFormat;
}(immutable_1.Record(defaultFormat)));
exports.SeriesFormat = SeriesFormat;
exports.DEFAULT_FORMAT = new SeriesFormat(defaultFormat);
exports.EXACT_FORMAT = new SeriesFormat({ type: SeriesFormatType.EXACT });
exports.PERCENT_FORMAT = new SeriesFormat({ type: SeriesFormatType.PERCENT });
exports.customFormat = function (value) { return new SeriesFormat({ type: SeriesFormatType.CUSTOM, value: value }); };
function formatFnFactory(format) {
    return function (n) {
        if (!general_1.isNumber(n) || !general_1.isFiniteNumber(n))
            return "-";
        return numbro(n).format(format);
    };
}
exports.formatFnFactory = formatFnFactory;
exports.exactFormat = "0,0";
var exactFormatter = formatFnFactory(exports.exactFormat);
exports.percentFormat = "0[.]00%";
var percentFormatter = formatFnFactory(exports.percentFormat);
exports.measureDefaultFormat = "0,0.0 a";
exports.defaultFormatter = formatFnFactory(exports.measureDefaultFormat);
function seriesFormatter(format, measure) {
    switch (format.type) {
        case SeriesFormatType.DEFAULT:
            return measure.formatFn;
        case SeriesFormatType.EXACT:
            return exactFormatter;
        case SeriesFormatType.PERCENT:
            return percentFormatter;
        case SeriesFormatType.CUSTOM:
            return formatFnFactory(format.value);
    }
}
exports.seriesFormatter = seriesFormatter;
//# sourceMappingURL=series-format.js.map