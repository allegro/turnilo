/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BaseImmutable, Property, isInstanceOf } from 'immutable-class';
import { findByName, overrideByName } from 'plywood';
import { TimeTag, TimeTagJS } from '../time-tag/time-tag';

// I am: export * from './timekeeper/timekeeper';

export interface TimekeeperValue {
  timeTags: TimeTag[];
  nowOverride?: Date;
}

export interface TimekeeperJS {
  timeTags: TimeTagJS[];
  nowOverride?: Date | string;
}

export class Timekeeper extends BaseImmutable<TimekeeperValue, TimekeeperJS> {
  static EMPTY: Timekeeper;

  static isTimekeeper(candidate: any): candidate is Timekeeper {
    return isInstanceOf(candidate, Timekeeper);
  }

  static globalNow(): Date {
    return new Date();
  }

  static fromJS(parameters: TimekeeperJS): Timekeeper {
    return new Timekeeper(BaseImmutable.jsToValue(Timekeeper.PROPERTIES, parameters));
  }

  static PROPERTIES: Property[] = [
    { name: 'timeTags', immutableClassArray: TimeTag },
    { name: 'nowOverride', isDate: true, defaultValue: null }
  ];

  public timeTags: TimeTag[];
  public nowOverride: Date;

  constructor(parameters: TimekeeperValue) {
    super(parameters);
  }

  now(): Date {
    return this.nowOverride || Timekeeper.globalNow();
  }

  getTime(name: string): Date {
    var timeTag = findByName(this.timeTags, name);
    if (!timeTag || timeTag.special === 'realtime') return this.now();
    return timeTag.time || this.now();
  }

  updateTime(name: string, time: Date): Timekeeper {
    var value = this.valueOf();
    var tag = findByName(value.timeTags, name);
    if (!tag) return this;
    value.timeTags = overrideByName(value.timeTags, tag.changeTime(time, this.now()));
    return new Timekeeper(value);
  }

  addTimeTagFor(name: string): Timekeeper {
    var value = this.valueOf();
    value.timeTags = value.timeTags.concat(new TimeTag({ name }));
    return new Timekeeper(value);
  }

  removeTimeTagFor(name: string): Timekeeper {
    var value = this.valueOf();
    value.timeTags = value.timeTags.filter((tag) => tag.name !== name);
    return new Timekeeper(value);
  }

}
BaseImmutable.finalize(Timekeeper);
Timekeeper.EMPTY = new Timekeeper({ timeTags: [] });
