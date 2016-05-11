import { TimeBucketAction, NumberBucketAction, ActionJS, Action } from 'plywood';
import { hasOwnProperty } from '../../../common/utils/general/general';

export type Granularity = TimeBucketAction | NumberBucketAction;
export type GranularityJS = string | number | ActionJS

export function granularityFromJS(input: GranularityJS): Granularity {
  if (typeof input === 'number') return NumberBucketAction.fromJS({ size: input });
  if (typeof input === 'string') return TimeBucketAction.fromJS({ duration: input });

  if (typeof input === "object") {
    if (!hasOwnProperty(input, 'action')) {
      throw new Error(`could not recognize object as action`);
    }
    return (Action.fromJS(input as GranularityJS) as Granularity);
  }
  throw new Error(`input should be of type number, string, or action`);
}

export function granularityToString(input: Granularity): string {
  if (input instanceof TimeBucketAction) {
    return input.duration.toString();
  } else if (input instanceof NumberBucketAction) {
    return input.size.toString();
  }

  throw new Error(`unrecognized granularity: must be of type TimeBucketAction or NumberBucketAction`);
}

export function granularityEquals(g1: Granularity, g2: Granularity) {
  if (!Boolean(g1) === Boolean(g2)) return false;
  if (g1 === g2 ) return true;
  return (g1 as Action).equals(g2 as Action);
}

export function granularityToJS(input: Granularity): GranularityJS {
  var js = input.toJS();

  if (js.action === 'timeBucket') {
    if (Object.keys(js).length === 2) return js.duration;
  }

  if (js.action === 'numberBucket') {
    if (Object.keys(js).length === 2) return js.size;
  }

  return js;
}
