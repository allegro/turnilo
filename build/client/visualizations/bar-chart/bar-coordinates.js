"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BarCoordinates = (function () {
    function BarCoordinates(parameters) {
        this.x = parameters.x;
        this.y = parameters.y;
        this.height = parameters.height;
        this.width = parameters.width;
        this.barOffset = parameters.barOffset;
        this.barWidth = parameters.barWidth;
        this.stepWidth = parameters.stepWidth;
        this.children = parameters.children;
        this.hitboxMin = this.x - this.barOffset;
        this.hitboxMax = this.x + this.barWidth + this.barOffset * 2;
    }
    BarCoordinates.prototype.isXWithin = function (x) {
        return x >= this.hitboxMin && x <= this.hitboxMax;
    };
    BarCoordinates.prototype.hasChildren = function () {
        return this.children.length > 0;
    };
    Object.defineProperty(BarCoordinates.prototype, "middleX", {
        get: function () {
            return this.x + this.barWidth * .5 + this.barOffset;
        },
        enumerable: true,
        configurable: true
    });
    return BarCoordinates;
}());
exports.BarCoordinates = BarCoordinates;
//# sourceMappingURL=bar-coordinates.js.map