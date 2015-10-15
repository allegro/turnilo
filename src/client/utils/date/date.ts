'use strict';

import * as d3 from 'd3';
import { Timezone, WallTime } from 'chronoshift';
import { TimeRange } from 'plywood';

const JOIN = ' - ';

var formatWithYear = d3.time.format('%b %-d, %Y');
var formatWithoutYear = d3.time.format('%b %-d');
var formatTimeOfDayWithoutMinutes = d3.time.format('%-I%p');
var formatTimeOfDayWithMinutes = d3.time.format('%-I:%M%p');

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
    formatted = [formatWithYear(startWallTime), formatWithYear(endShiftWallTime)].join(JOIN);
  } else {
    var fmt = suppressYear ? formatWithoutYear : formatWithYear;
    if (startWallTime.getMonth() !== endShiftWallTime.getMonth() || startWallTime.getDate() !== endShiftWallTime.getDate()) {
      formatted = [formatWithoutYear(startWallTime), fmt(endShiftWallTime)].join(JOIN);
    } else {
      formatted = fmt(startWallTime);
    }
  }

  if (startWallTime.getHours() || endWallTime.getHours()) {
    var timeString: string;
    if (startWallTime.getHours() !== endShiftWallTime.getHours()) {
      timeString = [formatTimeOfDay(startWallTime), formatTimeOfDay(endShiftWallTime)].join(JOIN);
    } else {
      timeString = formatTimeOfDay(startWallTime);
    }
    formatted += ' ' + timeString.toLowerCase();
  }

  return formatted;
}
