import { Timezone, Duration, WallTime, month, day, hour, minute } from 'chronoshift';
import { TimeRange } from 'plywood';

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
  } else if (len > 8 * day.canonicalLength) {
    return Duration.fromJS('P1W');
  } else if (len > 8 * hour.canonicalLength) {
    return Duration.fromJS('PT6H');
  } else if (len > 3 * hour.canonicalLength) {
    return Duration.fromJS('PT1H');
  } else if (len > hour.canonicalLength) {
    return Duration.fromJS('PT5M');
  } else {
    return Duration.fromJS('PT1M');
  }
}

export function getTimeTicks(timeRange: TimeRange, timezone: Timezone): Date[] {
  const { start, end } = timeRange;
  const tickDuration = getTickDuration(timeRange);

  var ticks: Date[] = [];
  var iter = tickDuration.floor(start, timezone);
  while (iter <= end) {
    ticks.push(iter);
    iter = tickDuration.shift(iter, timezone, 1);
  }
  return ticks;
}
