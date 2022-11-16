/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { Record } from "immutable";

export interface TimeTagValue {
  name: string;
  checkInterval: number;
  time?: Date;
  lastTimeChecked?: Date;
}

export interface TimeTagJS {
  name: string;
  checkInterval: number;
  time?: string;
  lastTimeChecked?: string;
}

const defaultTimeTag: TimeTagValue = {
  name: "",
  // NOTE: this value won't be used ever. Immutable.Record type does not understand that non-nullable fields should be not required in default value.
  checkInterval: 60000,
  time: null,
  lastTimeChecked: null
};

export class TimeTag extends Record<TimeTagValue>(defaultTimeTag)  {

  static fromJS({ name, checkInterval, time: timeJS, lastTimeChecked: lastTimeCheckedJS }: TimeTagJS): TimeTag {
    const time = timeJS ? new Date(timeJS) : undefined;
    const lastTimeChecked = lastTimeCheckedJS ? new Date(lastTimeCheckedJS) : time;
    return new TimeTag({
      name,
      checkInterval,
      time,
      lastTimeChecked
    });
  }

  constructor(parameters: TimeTagValue) {
    super(parameters);
  }

  public changeTime(time: Date, lastTimeChecked: Date): TimeTag {
    return this.set("time", time).set("lastTimeChecked", lastTimeChecked);
  }
}
