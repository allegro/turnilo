import * as d3 from 'd3';
import { Timezone, Duration, WallTime, month, day, hour, minute } from 'chronoshift';
import { TimeRange } from 'plywood';

const FORMAT_WITH_YEAR = d3.time.format('%b %-d, %Y');
const FORMAT_WITHOUT_YEAR = d3.time.format('%b %-d');

const FORMAT_TIME_OF_DAY_WITHOUT_MINUTES = d3.time.format('%-I%p');
const FORMAT_TIME_OF_DAY_WITH_MINUTES = d3.time.format('%-I:%M%p');

const FORMAT_FULL_MONTH_WITH_YEAR = d3.time.format('%B %Y');

function formatTimeOfDay(d: Date): string {
  return d.getMinutes() ? FORMAT_TIME_OF_DAY_WITH_MINUTES(d) : FORMAT_TIME_OF_DAY_WITHOUT_MINUTES(d);
}

function isCurrentYear(year: number, timezone: Timezone): boolean {
  var nowWallTime = WallTime.UTCToWallTime(new Date(), timezone.toString());
  return nowWallTime.getFullYear() === year;
}

export interface Locale {
  shortDays: string[];
  weekStart: number;
}

export enum DisplayYear {
  ALWAYS, NEVER, IF_DIFF
}

export function getEndWallTimeInclusive(exclusiveEnd: Date, timezone: Timezone) {
  return WallTime.UTCToWallTime(exclusiveToInclusiveEnd(exclusiveEnd), timezone.toString());
}

export function exclusiveToInclusiveEnd(exclusiveEnd: Date): Date {
  return new Date(exclusiveEnd.valueOf() - 1);
}

export function formatTimeRange(timeRange: TimeRange, timezone: Timezone, displayYear: DisplayYear): string {
  var { start, end } = timeRange;
  var startWallTime = WallTime.UTCToWallTime(start, timezone.toString());
  var endWallTime = WallTime.UTCToWallTime(end, timezone.toString());
  var endWallTimeInclusive = getEndWallTimeInclusive(end, timezone);

  var showingYear = true;
  var formatted: string;
  if (startWallTime.getFullYear() !== endWallTimeInclusive.getFullYear()) {
    formatted = [FORMAT_WITH_YEAR(startWallTime), FORMAT_WITH_YEAR(endWallTimeInclusive)].join(' - ');
  } else {
    showingYear = displayYear === DisplayYear.ALWAYS || (displayYear === DisplayYear.IF_DIFF && !isCurrentYear(endWallTimeInclusive.getFullYear(), timezone));
    var fmt = showingYear ? FORMAT_WITH_YEAR : FORMAT_WITHOUT_YEAR;
    if (startWallTime.getMonth() !== endWallTimeInclusive.getMonth() || startWallTime.getDate() !== endWallTimeInclusive.getDate()) {
      formatted = [FORMAT_WITHOUT_YEAR(startWallTime), fmt(endWallTimeInclusive)].join(' - ');
    } else {
      formatted = fmt(startWallTime);
    }
  }

  if (startWallTime.getHours() || startWallTime.getMinutes() || endWallTime.getHours() || endWallTime.getMinutes()) {
    formatted += (showingYear ? ' ' : ', ');

    var startTimeStr = formatTimeOfDay(startWallTime).toLowerCase();
    var endTimeStr = formatTimeOfDay(endWallTime).toLowerCase();

    if (startTimeStr === endTimeStr) {
      formatted += startTimeStr;
    } else {
      if (startTimeStr.substr(-2) === endTimeStr.substr(-2)) {
        startTimeStr = startTimeStr.substr(0, startTimeStr.length - 2);
      }
      formatted += [startTimeStr, endTimeStr].join('-');
    }
  }

  return formatted;
}

// calendar utils

export function monthToWeeks(firstDayOfMonth: Date, timezone: Timezone, locale: Locale): Date[][] {
  const weeks: Date[][] = [];
  const firstDayNextMonth = month.shift(firstDayOfMonth, timezone, 1);

  let week: Date[] = [];
  let currentPointer = day.floor(firstDayOfMonth, timezone);
  while (currentPointer < firstDayNextMonth) {
    var wallTime = WallTime.UTCToWallTime(currentPointer, timezone.toString());
    if ((wallTime.getDay() === locale.weekStart || 0) && week.length > 0) {
      weeks.push(week);
      week = [];
    }

    week.push(currentPointer);
    currentPointer = day.shift(currentPointer, timezone, 1);
  }
  // push last week
  if (week.length > 0) weeks.push(week);
  return weeks;
}

export function prependDays(timezone: Timezone, weekPrependTo: Date[], countPrepend: number): Date[] {
  for (var i = 0; i < countPrepend; i++) {
    var firstDate = weekPrependTo[0];
    var shiftedDate = day.shift(firstDate, timezone, -1);
    weekPrependTo.unshift(shiftedDate);
  }
  return weekPrependTo;
}

export function appendDays(timezone: Timezone, weekAppendTo: Date[], countAppend: number): Date[] {
  for (var i = 0; i < countAppend; i++) {
    var lastDate = weekAppendTo[weekAppendTo.length - 1];
    var shiftedDate = day.shift(lastDate, timezone, 1);
    weekAppendTo.push(shiftedDate);
  }
  return weekAppendTo;
}

export function shiftOneDay(floored: Date, timezone: Timezone) {
  return day.shift(floored, timezone, 1);
}

export function datesEqual(d1: Date, d2: Date): boolean {
  if (!Boolean(d1) === Boolean(d2)) return false;
  if (d1 === d2 ) return true;
  return d1.valueOf() === d2.valueOf();
}

export function getWallTimeDay(date: Date, timezone: Timezone) {
  return WallTime.UTCToWallTime(date, timezone.toString()).getDate();
}

export function getWallTimeMonthWithYear(date: Date, timezone: Timezone) {
  return FORMAT_FULL_MONTH_WITH_YEAR(WallTime.UTCToWallTime(date, timezone.toString()));
}

export function wallTimeInclusiveEndEqual(d1: Date, d2: Date, timezone: Timezone): boolean {
  if (!Boolean(d1) === Boolean(d2)) return false;
  if (d1 === d2 ) return true;
  const d1InclusiveEnd = wallTimeHelper(getEndWallTimeInclusive(d1, timezone));
  const d2InclusiveEnd = wallTimeHelper(getEndWallTimeInclusive(d2, timezone));
  return datesEqual(d1InclusiveEnd, d2InclusiveEnd);
}

export function getWallTimeString(date: Date, timezone: Timezone, includeTime?: boolean, delimiter?: string): string {
  const wallTimeISOString = wallTimeHelper(WallTime.UTCToWallTime(date, timezone.toString())).toISOString();
  if (includeTime) {
    return wallTimeISOString.replace(/(\.\d\d\d)?Z?$/, '').replace('T', delimiter || ', ');
  }
  return wallTimeISOString.replace( /:\d\d(\.\d\d\d)?Z?$/, '').split('T')[0];
}

function wallTimeHelper(wallTime: any) {
  return wallTime['wallTime'];
}


export function getBestGranularity(timeRange: TimeRange): Duration {
  var len = timeRange.end.valueOf() - timeRange.start.valueOf();
  if (len > 95 * day.canonicalLength) {
    return Duration.fromJS('P1W');

  } else if (len > 8 * day.canonicalLength) {
    return Duration.fromJS('P1D');

  } else if (len > 8 * hour.canonicalLength) {
    return Duration.fromJS('PT1H');

  } else if (len > 3 * hour.canonicalLength) {
    return Duration.fromJS('PT5M');

  } else {
    return Duration.fromJS('PT1M');
  }
}

export function getTickDuration(timeRange: TimeRange): Duration {
  var len = timeRange.end.valueOf() - timeRange.start.valueOf();
  if (len > 95 * day.canonicalLength) {
    return Duration.fromJS('P1M');

  } else if (len > 20 * day.canonicalLength) {
    return Duration.fromJS('P1W');

  } else if (len > 6 * day.canonicalLength) {
    return Duration.fromJS('P1D');

  } else if (len > 2 * day.canonicalLength) {
    return Duration.fromJS('PT12H');

  } else if (len > 23 * hour.canonicalLength) {
    return Duration.fromJS('PT6H');

  } else if (len > 3 * hour.canonicalLength) {
    return Duration.fromJS('PT1H');

  } else if (len > 30 * minute.canonicalLength) {
    return Duration.fromJS('PT5M');

  } else {
    return Duration.fromJS('PT1M');
  }
}

export function getTimeTicks(timeRange: TimeRange, timezone: Timezone): Date[] {
  const { start, end } = timeRange;
  const tickDuration = getTickDuration(timeRange);
  return tickDuration.materialize(start, end, timezone);
}
