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

import { Map } from "immutable";
import { immutableLookupsEqual, Instance } from "immutable-class";
import { mapValues } from "../../utils/object/object";
import { datesEqual } from "../../utils/time/time";
import { TimeTag, TimeTagJS } from "../time-tag/time-tag";

export interface TimekeeperValue {
  timeTags: Map<string, TimeTag>;
  nowOverride?: Date;
}

export interface TimekeeperJS {
  timeTags: Record<string, TimeTagJS>;
  nowOverride?: Date | string;
}

export class Timekeeper implements Instance<TimekeeperValue, TimekeeperJS> {
  static EMPTY: Timekeeper;

  static isTimekeeper(candidate: any): candidate is Timekeeper {
    return candidate instanceof Timekeeper;
  }

  static globalNow(): Date {
    return new Date();
  }

  static fromJS({ timeTags, nowOverride = null }: TimekeeperJS): Timekeeper {
    const tags = mapValues(timeTags, (tag: TimeTagJS) => TimeTag.fromJS(tag));
    return new Timekeeper({
      timeTags: Map(tags),
      nowOverride: nowOverride && new Date(nowOverride)
    });
  }

  public timeTags: Map<string, TimeTag>;
  public nowOverride: Date = null;

  constructor({ timeTags, nowOverride = null }: TimekeeperValue) {
    this.timeTags = timeTags;
    this.nowOverride = nowOverride;
  }

  now(): Date {
    return this.nowOverride || Timekeeper.globalNow();
  }

  getTime(name: string): Date {
    const timeTag = this.timeTags.get(name);
    if (!timeTag || !timeTag.time) return this.now();
    return timeTag.time;
  }

  private changeTimeTags(timeTags: Map<string, TimeTag>): Timekeeper {
    return new Timekeeper({
      ...this.valueOf(),
      timeTags
    });
  }

  updateTime(name: string, time: Date): Timekeeper {
    const tag = this.timeTags.get(name);
    if (!tag) return this;
    const timeTags = this.timeTags.set(name, tag.changeTime(time, this.now()));
    return this.changeTimeTags(timeTags);
  }

  addTimeTagFor(name: string, checkInterval: number): Timekeeper {
    const timeTags = this.timeTags.set(name, new TimeTag({ name, checkInterval }));
    return this.changeTimeTags(timeTags);
  }

  removeTimeTagFor(name: string): Timekeeper {
    const timeTags = this.timeTags.remove(name);
    return this.changeTimeTags(timeTags);
  }

  equals(other: Instance<TimekeeperValue, TimekeeperJS> | undefined): boolean {
    return Timekeeper.isTimekeeper(other)
      && datesEqual(this.nowOverride, other.nowOverride)
      && immutableLookupsEqual(this.timeTags.toObject(), other.timeTags.toObject());
  }

  toJS(): TimekeeperJS {
    const tags = this.timeTags.toObject();
    return {
      nowOverride: this.nowOverride,
      timeTags: mapValues(tags, tag => tag.toJS())
    };
  }

  toJSON(): TimekeeperJS {
    return this.toJS();
  }

  toString(): string {
    return `[Timekeeper: ${this.timeTags.keySeq().join(", ")}]`;
  }

  valueOf(): TimekeeperValue {
    return {
      timeTags: this.timeTags,
      nowOverride: this.nowOverride
    };
  }

}

Timekeeper.EMPTY = new Timekeeper({ timeTags: Map() });
