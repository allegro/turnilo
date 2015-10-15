'use strict';

import * as d3 from 'd3';
import { Timezone, WallTime } from 'chronoshift';
import { TimeRange } from 'plywood';

const formatWithYear = d3.time.format('%b %-d, %Y');
const formatWithoutYear = d3.time.format('%b %-d');

const formatTimeOfDayWithoutMinutes = d3.time.format('%-I%p');
const formatTimeOfDayWithMinutes = d3.time.format('%-I:%M%p');

function formatTimeOfDay(d: Date): string {
  return d.getMinutes() ? formatTimeOfDayWithMinutes(d) : formatTimeOfDayWithoutMinutes(d);
}

export function formatTimeRange(timeRange: TimeRange, timezone: Timezone, suppressYear: boolean): string {
  var { start, end } = timeRange;
  var startWallTime = WallTime.UTCToWallTime(start, timezone.toString());
  var endWallTime = WallTime.UTCToWallTime(end, timezone.toString());
  var endShiftWallTime = WallTime.UTCToWallTime(new Date(end.valueOf() - 1), timezone.toString());

  var formatted: string;
  if (startWallTime.getFullYear() !== endShiftWallTime.getFullYear()) {
    formatted = [formatWithYear(startWallTime), formatWithYear(endShiftWallTime)].join(' - ');
  } else {
    var fmt = suppressYear ? formatWithoutYear : formatWithYear;
    if (startWallTime.getMonth() !== endShiftWallTime.getMonth() || startWallTime.getDate() !== endShiftWallTime.getDate()) {
      formatted = [formatWithoutYear(startWallTime), fmt(endShiftWallTime)].join(' - ');
    } else {
      formatted = fmt(startWallTime);
    }
  }

  if (startWallTime.getHours() || endWallTime.getHours()) {
    var startTimeStr = formatTimeOfDay(startWallTime);
    var endTimeStr = formatTimeOfDay(endWallTime);

    if (startTimeStr.substr(-2) === endTimeStr.substr(-2)) {
      startTimeStr = startTimeStr.substr(0, startTimeStr.length - 2);
    }

    formatted += ', ' + [startTimeStr, endTimeStr].join('-').toLowerCase();
  }

  return formatted;
}
