"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment_timezone_1 = require("moment-timezone");
var ISO_FORMAT_DATE = "YYYY-MM-DD";
var ISO_FORMAT_TIME = "HH:mm";
var FORMAT_FULL_MONTH_WITH_YEAR = "MMMM YYYY";
function getMoment(date, timezone) {
    return moment_timezone_1.tz(date, timezone.toString());
}
exports.getMoment = getMoment;
var FULL_FORMAT = "D MMM YYYY H:mm";
var WITHOUT_YEAR_FORMAT = "D MMM H:mm";
var WITHOUT_HOUR_FORMAT = "D MMM YYYY";
var WITHOUT_YEAR_AND_HOUR_FORMAT = "D MMM";
var SHORT_WITHOUT_HOUR_FORMAT = "D MMM YY";
var SHORT_FULL_FORMAT = "D MMM YY H:mm";
var SHORT_WITHOUT_YEAR_FORMAT = "D MMM H:mm";
var SHORT_WITHOUT_YEAR_AND_HOUR_FORMAT = "D MMM";
var SHORT_WITHOUT_YEAR_AND_DATE_FORMAT = "H:mm";
var SHORT_WITHOUT_DATE_AND_HOUR_FORMAT = "YYYY";
function formatterFromDefinition(definition) {
    return function (date) { return date.format(definition); };
}
function getShortFormat(sameYear, sameDate, sameHour) {
    if (sameYear && sameDate && !sameHour)
        return SHORT_WITHOUT_YEAR_AND_DATE_FORMAT;
    if (!sameYear && sameDate && sameHour)
        return SHORT_WITHOUT_DATE_AND_HOUR_FORMAT;
    if (sameYear && !sameDate && sameHour)
        return SHORT_WITHOUT_YEAR_AND_HOUR_FORMAT;
    if (sameYear && !sameDate && !sameHour)
        return SHORT_WITHOUT_YEAR_FORMAT;
    if (!sameYear && sameHour)
        return SHORT_WITHOUT_HOUR_FORMAT;
    return SHORT_FULL_FORMAT;
}
function hasSameHour(a, b) {
    return a.getHours() === b.getHours() && a.getMinutes() === b.getMinutes();
}
function hasSameDateAndMonth(a, b) {
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth();
}
function scaleTicksFormat(scale) {
    var ticks = scale.ticks();
    if (ticks.length < 2)
        return SHORT_FULL_FORMAT;
    var first = ticks[0], rest = ticks.slice(1);
    var sameYear = rest.every(function (date) { return date.getFullYear() === first.getFullYear(); });
    var sameDayAndMonth = rest.every(function (date) { return hasSameDateAndMonth(date, first); });
    var sameHour = rest.every(function (date) { return hasSameHour(date, first); });
    return getShortFormat(sameYear, sameDayAndMonth, sameHour);
}
exports.scaleTicksFormat = scaleTicksFormat;
function scaleTicksFormatter(scale) {
    return formatterFromDefinition(scaleTicksFormat(scale));
}
exports.scaleTicksFormatter = scaleTicksFormatter;
function getLongFormat(omitYear, omitHour) {
    if (omitHour && omitYear)
        return WITHOUT_YEAR_AND_HOUR_FORMAT;
    if (omitYear)
        return WITHOUT_YEAR_FORMAT;
    if (omitHour)
        return WITHOUT_HOUR_FORMAT;
    return FULL_FORMAT;
}
function isCurrentYear(moment, timezone) {
    var nowWallTime = getMoment(new Date(), timezone);
    return nowWallTime.year() === moment.year();
}
function isStartOfTheDay(date) {
    return date.milliseconds() === 0
        && date.seconds() === 0
        && date.minutes() === 0
        && date.hours() === 0;
}
function isOneWholeDay(a, b) {
    return isStartOfTheDay(a) && isStartOfTheDay(b) && b.diff(a, "days") === 1;
}
function formatOneWholeDay(day, timezone) {
    var omitYear = isCurrentYear(day, timezone);
    return day.format(getLongFormat(omitYear, true));
}
function formatDaysRange(start, end, timezone) {
    var dayBeforeEnd = end.subtract(1, "day");
    var omitYear = isCurrentYear(start, timezone) && isCurrentYear(dayBeforeEnd, timezone);
    var format = getLongFormat(omitYear, true);
    return [start.format(format), dayBeforeEnd.format(format)];
}
function formatHoursRange(start, end, timezone) {
    var omitYear = isCurrentYear(start, timezone) && isCurrentYear(end, timezone);
    var format = getLongFormat(omitYear, false);
    return [start.format(format), end.format(format)];
}
function formatDatesInTimeRange(_a, timezone) {
    var start = _a.start, end = _a.end;
    var startMoment = getMoment(start, timezone);
    var endMoment = getMoment(end, timezone);
    if (isOneWholeDay(startMoment, endMoment)) {
        return [formatOneWholeDay(startMoment, timezone)];
    }
    var hasDayBoundaries = isStartOfTheDay(startMoment) && isStartOfTheDay(endMoment);
    if (hasDayBoundaries) {
        return formatDaysRange(startMoment, endMoment, timezone);
    }
    return formatHoursRange(startMoment, endMoment, timezone);
}
exports.formatDatesInTimeRange = formatDatesInTimeRange;
function formatStartOfTimeRange(range, timezone) {
    return formatDatesInTimeRange(range, timezone)[0];
}
exports.formatStartOfTimeRange = formatStartOfTimeRange;
function formatTimeRange(range, timezone) {
    return formatDatesInTimeRange(range, timezone).join(" - ");
}
exports.formatTimeRange = formatTimeRange;
function datesEqual(d1, d2) {
    if (!Boolean(d1) === Boolean(d2))
        return false;
    if (d1 === d2)
        return true;
    return d1.valueOf() === d2.valueOf();
}
exports.datesEqual = datesEqual;
function getDayInMonth(date, timezone) {
    return getMoment(date, timezone).date();
}
exports.getDayInMonth = getDayInMonth;
function formatYearMonth(date, timezone) {
    return getMoment(date, timezone).format(FORMAT_FULL_MONTH_WITH_YEAR);
}
exports.formatYearMonth = formatYearMonth;
function formatTimeElapsed(date, timezone) {
    return getMoment(date, timezone).fromNow(true);
}
exports.formatTimeElapsed = formatTimeElapsed;
function formatDateTime(date, timezone) {
    return getMoment(date, timezone).format(FULL_FORMAT);
}
exports.formatDateTime = formatDateTime;
function formatISODate(date, timezone) {
    return getMoment(date, timezone).format(ISO_FORMAT_DATE);
}
exports.formatISODate = formatISODate;
function formatISOTime(date, timezone) {
    return getMoment(date, timezone).format(ISO_FORMAT_TIME);
}
exports.formatISOTime = formatISOTime;
var ISO_DATE_DISALLOWED = /[^\d-]/g;
function normalizeISODate(date) {
    return date.replace(ISO_DATE_DISALLOWED, "");
}
exports.normalizeISODate = normalizeISODate;
var ISO_DATE_TEST = /^\d\d\d\d-\d\d-\d\d$/;
function validateISODate(date) {
    return ISO_DATE_TEST.test(date);
}
exports.validateISODate = validateISODate;
var ISO_TIME_DISALLOWED = /[^\d:]/g;
function normalizeISOTime(time) {
    return time.replace(ISO_TIME_DISALLOWED, "");
}
exports.normalizeISOTime = normalizeISOTime;
var ISO_TIME_TEST = /^\d\d:\d\d$/;
function validateISOTime(time) {
    return ISO_TIME_TEST.test(time);
}
exports.validateISOTime = validateISOTime;
function combineDateAndTimeIntoMoment(date, time, timezone) {
    return moment_timezone_1.tz(date + "T" + time, timezone.toString());
}
exports.combineDateAndTimeIntoMoment = combineDateAndTimeIntoMoment;
//# sourceMappingURL=time.js.map