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
var immutable_class_1 = require("immutable-class");
var TimeTag = (function (_super) {
    __extends(TimeTag, _super);
    function TimeTag(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (_this.time && !_this.updated)
            _this.updated = _this.time;
        return _this;
    }
    TimeTag.isTimeTag = function (candidate) {
        return candidate instanceof TimeTag;
    };
    TimeTag.fromJS = function (parameters) {
        return new TimeTag(immutable_class_1.BaseImmutable.jsToValue(TimeTag.PROPERTIES, parameters));
    };
    TimeTag.prototype.changeTime = function (time, now) {
        var value = this.valueOf();
        value.time = time;
        value.updated = now;
        return new TimeTag(value);
    };
    TimeTag.PROPERTIES = [
        { name: "name" },
        { name: "time", type: immutable_class_1.PropertyType.DATE, defaultValue: null },
        { name: "updated", type: immutable_class_1.PropertyType.DATE, defaultValue: null },
        { name: "spacial", defaultValue: null }
    ];
    return TimeTag;
}(immutable_class_1.BaseImmutable));
exports.TimeTag = TimeTag;
immutable_class_1.BaseImmutable.finalize(TimeTag);
//# sourceMappingURL=time-tag.js.map