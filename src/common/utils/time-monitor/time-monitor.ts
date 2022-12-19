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
import { DataCube } from "../../models/data-cube/data-cube";
import { QueryableDataCube } from "../../models/data-cube/queryable-data-cube";
import { TimeTag } from "../../models/time-tag/time-tag";
import { Timekeeper } from "../../models/timekeeper/timekeeper";
import { Nullary } from "../functional/functional";
import { maxTimeQueryForCube } from "../query/max-time-query";

export class TimeMonitor {
  public timekeeper: Timekeeper;
  private checks: Map<string, Nullary<Promise<Date>>>;
  private logger: Logger;
  private doingChecks = false;

  constructor(logger: Logger) {
    this.logger = logger.setLoggerId("TimeMonitor");
    this.checks = new Map();
    this.timekeeper = Timekeeper.EMPTY;
    setInterval(this.doChecks, 1000);
  }

  removeCheck({ name }: DataCube): this {
    this.checks.delete(name);
    this.timekeeper = this.timekeeper.removeTimeTagFor(name);
    return this;
  }

  // NOTE: We should pass whole Cluster here, but we still don't have Cluster class for "native" cluster type.
  addCheck(cube: QueryableDataCube, sourceTimeBoundaryRefreshInterval: number): this {
    const { name } = cube;
    this.checks.set(name, () => maxTimeQueryForCube(cube));
    this.timekeeper = this.timekeeper.addTimeTagFor(name, sourceTimeBoundaryRefreshInterval);
    return this;
  }

  private doCheck = ({ name, time: previousTime }: TimeTag): Promise<void> => {
    const { logger, checks } = this;
    const check = checks.get(name);
    if (!check) return Promise.resolve(null);
    return check().then(updatedTime => {
      logger.log(`Got the latest time for '${name}' (${updatedTime.toISOString()})`);
      this.timekeeper = this.timekeeper.updateTime(name, updatedTime);
    }).catch(e => {
        logger.error(`Failed getting time for '${name}', using previous time. Error: ${e.message}`);
        this.timekeeper = this.timekeeper.updateTime(name, previousTime);
      }
    );
  }

  private isStale = ({ time, lastTimeChecked, checkInterval }: TimeTag): boolean => {
    const { timekeeper } = this;
    const now = timekeeper.now().valueOf();
    return !time || now - lastTimeChecked.valueOf() > checkInterval;
  }

  private doChecks = (): void => {
    const { doingChecks, timekeeper } = this;
    if (doingChecks) return;
    const timeTags = timekeeper.timeTags;

    this.doingChecks = true;
    const checkTasks = timeTags.filter(this.isStale).map(this.doCheck).values();
    Promise.all(checkTasks).then(() => {
      this.doingChecks = false;
    });
  }
}
