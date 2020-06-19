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
var plywood_1 = require("plywood");
var defaultDateRange = { start: null, end: null };
var plywoodRange = function (_a) {
    var start = _a.start, end = _a.end;
    return plywood_1.Range.fromJS({ start: start, end: end, bounds: "()" });
};
var DateRange = (function (_super) {
    __extends(DateRange, _super);
    function DateRange() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateRange.prototype.intersects = function (other) {
        return other instanceof DateRange && plywoodRange(this).intersects(plywoodRange(other));
    };
    DateRange.prototype.shift = function (duration, timezone) {
        return this
            .set("start", duration.shift(this.start, timezone, -1))
            .set("end", duration.shift(this.end, timezone, -1));
    };
    return DateRange;
}(immutable_1.Record(defaultDateRange)));
exports.DateRange = DateRange;
//# sourceMappingURL=date-range.js.map