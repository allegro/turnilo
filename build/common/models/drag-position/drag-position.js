"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var general_1 = require("../../utils/general/general");
var check;
var DragPosition = (function () {
    function DragPosition(parameters) {
        this.insert = general_1.hasOwnProperty(parameters, "insert") ? parameters.insert : null;
        this.replace = general_1.hasOwnProperty(parameters, "replace") ? parameters.replace : null;
        if (this.insert == null && this.replace == null)
            throw new Error("invalid drag position");
    }
    DragPosition.isDragPosition = function (candidate) {
        return candidate instanceof DragPosition;
    };
    DragPosition.calculateFromOffset = function (offset, numItems, itemWidth, itemGap) {
        if (!numItems) {
            return new DragPosition({
                replace: 0
            });
        }
        if (offset < 0) {
            return new DragPosition({
                insert: 0
            });
        }
        var sectionWidth = itemWidth + itemGap;
        var sectionNumber = Math.floor(offset / sectionWidth);
        if (numItems <= sectionNumber) {
            return new DragPosition({
                replace: numItems
            });
        }
        var offsetWithinSection = offset - sectionWidth * sectionNumber;
        if (offsetWithinSection < itemWidth) {
            return new DragPosition({
                replace: sectionNumber
            });
        }
        else {
            return new DragPosition({
                insert: sectionNumber + 1
            });
        }
    };
    DragPosition.fromJS = function (parameters) {
        return new DragPosition(parameters);
    };
    DragPosition.prototype.valueOf = function () {
        return {
            insert: this.insert,
            replace: this.replace
        };
    };
    DragPosition.prototype.toJS = function () {
        var js = {};
        if (this.insert != null)
            js.insert = this.insert;
        if (this.replace != null)
            js.replace = this.replace;
        return js;
    };
    DragPosition.prototype.toJSON = function () {
        return this.toJS();
    };
    DragPosition.prototype.toString = function () {
        if (this.insert != null) {
            return "[insert " + this.insert + "]";
        }
        else {
            return "[replace " + this.replace + "]";
        }
    };
    DragPosition.prototype.equals = function (other) {
        return DragPosition.isDragPosition(other) &&
            this.insert === other.insert &&
            this.replace === other.replace;
    };
    DragPosition.prototype.isInsert = function () {
        return this.insert !== null;
    };
    DragPosition.prototype.isReplace = function () {
        return this.replace !== null;
    };
    return DragPosition;
}());
exports.DragPosition = DragPosition;
check = DragPosition;
//# sourceMappingURL=drag-position.js.map