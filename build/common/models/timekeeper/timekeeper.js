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
var time_tag_1 = require("../time-tag/time-tag");
var Timekeeper = (function (_super) {
    __extends(Timekeeper, _super);
    function Timekeeper(parameters) {
        return _super.call(this, parameters) || this;
    }
    Timekeeper.isTimekeeper = function (candidate) {
        return candidate instanceof Timekeeper;
    };
    Timekeeper.globalNow = function () {
        return new Date();
    };
    Timekeeper.fromJS = function (parameters) {
        return new Timekeeper(immutable_class_1.BaseImmutable.jsToValue(Timekeeper.PROPERTIES, parameters));
    };
    Timekeeper.prototype.now = function () {
        return this.nowOverride || Timekeeper.globalNow();
    };
    Timekeeper.prototype.getTime = function (name) {
        var timeTag = immutable_class_1.NamedArray.findByName(this.timeTags, name);
        if (!timeTag || timeTag.special === "realtime")
            return this.now();
        return timeTag.time || this.now();
    };
    Timekeeper.prototype.updateTime = function (name, time) {
        var value = this.valueOf();
        var tag = immutable_class_1.NamedArray.findByName(value.timeTags, name);
        if (!tag)
            return this;
        value.timeTags = immutable_class_1.NamedArray.overrideByName(value.timeTags, tag.changeTime(time, this.now()));
        return new Timekeeper(value);
    };
    Timekeeper.prototype.addTimeTagFor = function (name) {
        var value = this.valueOf();
        value.timeTags = value.timeTags.concat(new time_tag_1.TimeTag({ name: name }));
        return new Timekeeper(value);
    };
    Timekeeper.prototype.removeTimeTagFor = function (name) {
        var value = this.valueOf();
        value.timeTags = value.timeTags.filter(function (tag) { return tag.name !== name; });
        return new Timekeeper(value);
    };
    Timekeeper.PROPERTIES = [
        { name: "timeTags", type: immutable_class_1.PropertyType.ARRAY, immutableClassArray: time_tag_1.TimeTag },
        { name: "nowOverride", type: immutable_class_1.PropertyType.DATE, defaultValue: null }
    ];
    return Timekeeper;
}(immutable_class_1.BaseImmutable));
exports.Timekeeper = Timekeeper;
immutable_class_1.BaseImmutable.finalize(Timekeeper);
Timekeeper.EMPTY = new Timekeeper({ timeTags: [] });
//# sourceMappingURL=timekeeper.js.map