/*
 * Copyright 2017-2022 Allegro.pl
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

import { expect } from "chai";
import Sinon, { spy } from "sinon";
import { Logger } from "../../../common/logger/logger";
import { VisStrategy } from "../../../common/models/essence/essence";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { measureSeries } from "../../../common/models/series/series.fixtures";
import { timeSplitCombine } from "../../../common/models/split/split.fixtures";
import { TimeShift } from "../../../common/models/time-shift/time-shift";
import { TimekeeperFixtures } from "../../../common/models/timekeeper/timekeeper.fixtures";
import { logQueryInfo } from "./log-query";

describe("log-query-info", () => {
  const logger: Logger & { log: Sinon.SinonSpy } = {} as any;

  beforeEach(() => {
    logger.log = spy();
  });

  const baseEssence = EssenceFixtures.wikiTotals().addSeries(measureSeries("added"));
  const timekeeper = TimekeeperFixtures.wiki();
  const executionTime = 42;

  const expectedMessage = "Visualization query wiki_2016-04-29-12-40_2016-04-30-12-40";
  const expectedBasicVariables: Record<string, unknown> = {
    executionTime: 42,
    startTime: "2016-04-29T12:40:00.000Z",
    startTimeMsAgo: 86391350,
    interval: 86400000,
    dataCube: "wiki",
    visualization: "totals",
    filters: ["commentLength"],
    splits: [],
    measures: ["added"]
  };

  it("Should log all basic variables", () => {
    logQueryInfo(baseEssence, timekeeper, logger, executionTime, {});
    expect(logger.log.calledWith(
      expectedMessage,
      expectedBasicVariables
    )).to.be.true;
  });

  it("Should log additional time shift variables", () => {
    const essence = baseEssence.set("timeShift", TimeShift.fromJS("P1D"));
    logQueryInfo(essence, timekeeper, logger, executionTime, {});
    expect(logger.log.calledWith(
      expectedMessage,
      {
        ...expectedBasicVariables,
        timeShift: "P1D",
        shiftedStartTime: "2016-04-28T12:40:00.000Z",
        shiftedStartTimeMsAgo: 172791350
      }
    )).to.be.true;
  });

  it("Should log additional time split variables", () => {
    const essence = baseEssence.addSplit(timeSplitCombine("time", "P2D"), VisStrategy.FairGame);
    logQueryInfo(essence, timekeeper, logger, executionTime, {});
    expect(logger.log.calledWith(
      expectedMessage,
      {
        ...expectedBasicVariables,
        visualization: "line-chart",
        splits: ["time"],
        granularity: "P2D"
      }
    )).to.be.true;
  });

  it("Should log additional logger context", () => {
    logQueryInfo(baseEssence, timekeeper, logger, executionTime, { contextName: "context-value" });
    expect(logger.log.calledWith(
      expectedMessage,
      {
        ...expectedBasicVariables,
        contextName: "context-value"
      }
    )).to.be.true;
  });

});
