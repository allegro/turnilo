"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var functional_1 = require("../../../../common/utils/functional/functional");
function areDetached(a, b) {
    return a && b && a.end.valueOf() !== b.start.valueOf();
}
function nextMidpoint(range) {
    var rangeWidth = range.end.valueOf() - range.start.valueOf();
    return range.midpoint().valueOf() + rangeWidth;
}
function previousMidpoint(range) {
    var rangeWidth = range.end.valueOf() - range.start.valueOf();
    return range.midpoint().valueOf() - rangeWidth;
}
function shouldInsertPreviousPoint(dataset, currentIndex, getX) {
    var previous = dataset[currentIndex - 1];
    if (!previous)
        return false;
    var current = dataset[currentIndex];
    return areDetached(getX(previous), getX(current));
}
function shouldInsertNextPoint(dataset, currentIndex, getX) {
    var next = dataset[currentIndex + 1];
    if (!next)
        return false;
    var current = dataset[currentIndex];
    return areDetached(getX(current), getX(next));
}
function prepareDataPoints(dataset, getX, getY) {
    return functional_1.flatMap(dataset, function (datum, index) {
        var range = getX(datum);
        var x = range.midpoint().valueOf();
        var maybeY = getY(datum);
        var y = isNaN(maybeY) ? 0 : maybeY;
        return functional_1.concatTruthy(shouldInsertPreviousPoint(dataset, index, getX) && [previousMidpoint(range), 0], [x, y], shouldInsertNextPoint(dataset, index, getX) && [nextMidpoint(range), 0]);
    });
}
exports.prepareDataPoints = prepareDataPoints;
//# sourceMappingURL=prepare-data-points.js.map