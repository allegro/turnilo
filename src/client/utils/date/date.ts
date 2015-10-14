'use strict';

import * as d3 from 'd3';
import { Timezone, WallTime } from 'chronoshift';
import { TimeRange } from 'plywood';

const JOIN = ' - ';

var formatWithYear = d3.time.format('%b %-d, %Y');
var formatWithoutYear = d3.time.format('%b %-d');
var formatTimeOfDay = d3.time.format('%-I%p');

export function formatTimeRange(timeRange: TimeRange, timezone: Timezone): string {
  var { start, end } = timeRange;
  var startWallTime = WallTime.UTCToWallTime(start, timezone.toString());
  var endWallTime = WallTime.UTCToWallTime(end, timezone.toString());
  var endShiftWallTime = WallTime.UTCToWallTime(new Date(end.valueOf() - 1), timezone.toString());

  var formatted: string;
  if (startWallTime.getFullYear() !== endShiftWallTime.getFullYear()) {
    formatted = [formatWithYear(startWallTime), formatWithYear(endShiftWallTime)].join(JOIN);
  } else {
    if (startWallTime.getMonth() !== endShiftWallTime.getMonth() || startWallTime.getDate() !== endShiftWallTime.getDate()) {
      formatted = [formatWithoutYear(startWallTime), formatWithYear(endShiftWallTime)].join(JOIN);
    } else {
      formatted = formatWithYear(startWallTime);
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
