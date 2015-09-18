'use strict';

import { Class, Instance, isInstanceOf, arraysEqual } from 'immutable-class';
import { $, Expression, TimeRange, TimeRangeJS } from 'plywood';

interface TimePresetValue {
  name: string;
  timeRange: TimeRange;
}

interface TimePresetJS {
  name: string;
  timeRange: TimeRangeJS;
}

var check: Class<TimePresetValue, TimePresetJS>;
export class TimePreset implements Instance<TimePresetValue, TimePresetJS> {
  static isTimePreset(candidate: any): boolean {
    return isInstanceOf(candidate, TimePreset);
  }

  static fromJS(parameters: TimePresetJS): TimePreset {
    return new TimePreset({
      name: parameters.name,
      timeRange: TimeRange.fromJS(parameters.timeRange)
    });
  }


  public name: string;
  public timeRange: TimeRange;

  constructor(parameters: TimePresetValue) {
    this.name = parameters.name;
    this.timeRange = parameters.timeRange;
  }

  public valueOf(): TimePresetValue {
    return {
      name: this.name,
      timeRange: this.timeRange
    };
  }

  public toJS(): TimePresetJS {
    return {
      name: this.name,
      timeRange: this.timeRange.toJS()
    };
  }

  public toJSON(): TimePresetJS {
    return this.toJS();
  }

  public toString(): string {
    return `[TimePreset: ${this.name}]`;
  }

  public equals(other: TimePreset): boolean {
    return TimePreset.isTimePreset(other) &&
      this.name === other.name &&
      this.timeRange.equals(other.timeRange);
  }

}
check = TimePreset;

