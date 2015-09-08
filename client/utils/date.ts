'use strict';

import * as d3 from 'd3';
import { Timezone, WallTime } from 'chronoshift';

var formatWithYear = d3.time.format('%b %-d, %Y');
var formatWithoutYear = d3.time.format('%b %-d');

export function formatStartEnd(start: Date, end: Date, timezone: Timezone): string[] {
  var startWallTime = WallTime.UTCToWallTime(start, timezone.toString());
  var endWallTime = WallTime.UTCToWallTime(new Date(end.valueOf() - 1), timezone.toString());

  if (startWallTime.getFullYear() === endWallTime.getFullYear()) {
    if (startWallTime.getMonth() === endWallTime.getMonth() && startWallTime.getDate() === endWallTime.getDate()) {
      return [formatWithYear(startWallTime)];
    } else {
      return [formatWithoutYear(startWallTime), formatWithYear(endWallTime)];
    }
  } else {
    return [formatWithYear(startWallTime), formatWithYear(endWallTime)];
  }
}
