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

import { Logger } from "../../logger/logger";
import { TimeTag } from "../../models/time-tag/time-tag";
import { Timekeeper } from "../../models/timekeeper/timekeeper";

export type Check = () => Promise<Date>;

export class TimeMonitor {
  public logger: Logger;
  public regularCheckInterval: number;
  public specialCheckInterval: number;
  public timekeeper: Timekeeper;
  public checks: Map<string, Check>;
  private doingChecks = false;

  constructor(logger: Logger) {
    this.logger = logger;
    this.checks = new Map();
    this.regularCheckInterval = 60000;
    this.specialCheckInterval = 60000;
    this.timekeeper = Timekeeper.EMPTY;
    setInterval(this.doChecks, 1000);
  }

  removeCheck(name: string): this {
    this.checks.delete(name);
    this.timekeeper = this.timekeeper.removeTimeTagFor(name);
    return this;
  }

  addCheck(name: string, check: Check): this {
    this.checks.set(name, check);
    this.timekeeper = this.timekeeper.addTimeTagFor(name);
    return this;
  }

  private doCheck = ({ name }: TimeTag): Promise<void> => {
    const { logger, checks } = this;
    const check = checks.get(name);
    if (!check) return Promise.resolve(null);
    return check().then(updatedTime => {
      logger.log(`Got the latest time for '${name}' (${updatedTime.toISOString()})`);
      this.timekeeper = this.timekeeper.updateTime(name, updatedTime);
    }).catch(e => {
        logger.error(`Error getting time for '${name}': ${e.message}`);
      }
    );
  }

  private isStale = (timeTag: TimeTag): boolean => {
    const { timekeeper, regularCheckInterval } = this;
    const now = timekeeper.now().valueOf();
    return !timeTag.time || now - timeTag.updated.valueOf() > regularCheckInterval;
  }

  private doChecks = (): void => {
    const { doingChecks, timekeeper } = this;
    if (doingChecks) return;
    const timeTags = timekeeper.timeTags;

    this.doingChecks = true;
    const checkTasks = timeTags.filter(this.isStale).map(this.doCheck);
    Promise.all(checkTasks).then(() => {
      this.doingChecks = false;
    });
  }
}
