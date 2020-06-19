"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var functional_1 = require("../../../common/utils/functional/functional");
var time_1 = require("../../../common/utils/time/time");
function calendarDays(startDay, timezone, locale) {
    var monthWeeks = monthToWeeks(startDay, timezone, locale);
    var firstWeek = monthWeeks[0];
    var lastWeek = monthWeeks[monthWeeks.length - 1];
    var middleWeeks = monthWeeks.slice(1, -1);
    return [
        padFirstWeek(firstWeek, timezone)
    ].concat(middleWeeks, [
        padLastWeek(lastWeek, timezone)
    ]);
}
exports.calendarDays = calendarDays;
function padLastWeek(lastWeek, timezone) {
    var lastDate = lastWeek[lastWeek.length - 1];
    var padCount = 7 - lastWeek.length;
    return lastWeek.concat(nextNDates(lastDate, padCount, timezone));
}
function padFirstWeek(firstWeek, timezone) {
    var firstDate = firstWeek[0];
    var padCount = 7 - firstWeek.length;
    return previousNDates(firstDate, padCount, timezone).concat(firstWeek);
}
function monthToWeeks(startDay, timezone, locale) {
    var weeks = [];
    var firstDayOfMonth = time_1.getMoment(startDay, timezone);
    var firstDayOfNextMonth = firstDayOfMonth.clone().add(1, "month");
    var week = [];
    var currentPointer = firstDayOfMonth.clone().startOf("day");
    while (currentPointer.isBefore(firstDayOfNextMonth)) {
        if ((currentPointer.day() === locale.weekStart || 0) && week.length > 0) {
            weeks.push(week);
            week = [];
        }
        week.push(currentPointer.toDate());
        currentPointer = currentPointer.add(1, "day");
    }
    if (week.length > 0)
        weeks.push(week);
    return weeks;
}
exports.monthToWeeks = monthToWeeks;
function previousNDates(start, n, timezone) {
    return functional_1.range(0, n)
        .map(function (i) { return chronoshift_1.day.shift(start, timezone, -n + i); });
}
exports.previousNDates = previousNDates;
function nextNDates(start, n, timezone) {
    return functional_1.range(0, n)
        .map(function (i) { return chronoshift_1.day.shift(start, timezone, i + 1); });
}
exports.nextNDates = nextNDates;
//# sourceMappingURL=calendar.js.map