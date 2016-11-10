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

export type Special = 'static' | 'realtime';

export interface TimeTagValue {
  name: string;
  time?: Date;
  updated?: Date;
  spacial?: Special;
}

export interface TimeTagJS {
  name: string;
  time?: Date | string;
  updated?: Date | string;
  spacial?: Special;
}

export class TimeTag extends BaseImmutable<TimeTagValue, TimeTagJS> {

  static isTimeTag(candidate: any): candidate is TimeTag {
    return isInstanceOf(candidate, TimeTag);
  }

  static PROPERTIES: Property[] = [
    { name: 'name' },
    { name: 'time', isDate: true, defaultValue: null },
    { name: 'updated', isDate: true, defaultValue: null },
    { name: 'spacial', defaultValue: null }
  ];

  static fromJS(parameters: TimeTagJS): TimeTag {
    return new TimeTag(BaseImmutable.jsToValue(TimeTag.PROPERTIES, parameters));
  }

  public name: string;
  public time: Date;
  public updated: Date;
  public special: Special;

  constructor(parameters: TimeTagValue) {
    super(parameters);
    if (this.time && !this.updated) this.updated = this.time;
  }

  public changeTime(time: Date, now: Date): TimeTag {
    var value = this.valueOf();
    value.time = time;
    value.updated = now;
    return new TimeTag(value);
  }
}
BaseImmutable.finalize(TimeTag);
