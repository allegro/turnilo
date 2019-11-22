/*
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

import { expect } from "chai";
import { Duration } from "chronoshift";
import { DataCubeFixtures } from "../../../models/data-cube/data-cube.fixtures";
import { StringFilterAction, TimeFilterPeriod } from "../../../models/filter-clause/filter-clause";
import { boolean, numberRange, stringWithAction, timePeriod, timeRange } from "../../../models/filter-clause/filter-clause.fixtures";
import { filterDefinitionConverter } from "../filter-definition";
import {
  booleanFilterDefinition,
  flooredTimeFilterDefinition,
  latestTimeFilterDefinition,
  numberRangeFilterDefinition,
  stringFilterDefinition,
  timeRangeFilterDefinition
} from "../filter-definition.fixtures";

describe("FilterDefinition v3", () => {
  const booleanFilterTests = [
    { dimension: "isRobot", exclude: false, values: [true] },
    { dimension: "isRobot", exclude: true, values: [false] },
    { dimension: "isRobot", exclude: false, values: [true, false] }
  ];

  describe.skip("boolean filter conversion to filter clause", () => {
    booleanFilterTests.forEach(({ dimension, exclude, values }) => {
      it(`converts filter clause with values: "${values}"`, () => {
        const filterClauseDefinition = booleanFilterDefinition(dimension, values, exclude);
        const filterClause = filterDefinitionConverter.toFilterClause(filterClauseDefinition, DataCubeFixtures.wiki());
        const expected = boolean(dimension, values, exclude);

        expect(filterClause).to.deep.equal(expected);
      });
    });
  });

  describe("boolean filter conversion from filter clause", () => {
    booleanFilterTests.forEach(({ dimension, exclude, values }) => {
      it(`converts definition with values: "${values}"`, () => {
        const filterClause = boolean(dimension, values, exclude);
        const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause);
        const expected = booleanFilterDefinition(dimension, values, exclude);

        expect(filterClauseDefinition).to.deep.equal(expected);
      });
    });
  });

  const stringFilterTests = [
    { dimension: "channel", action: StringFilterAction.IN, exclude: false, values: ["en", "pl"] },
    { dimension: "channel", action: StringFilterAction.IN, exclude: true, values: ["en", "pl"] },
    { dimension: "channel", action: StringFilterAction.CONTAINS, exclude: false, values: ["en"] },
    { dimension: "channel", action: StringFilterAction.MATCH, exclude: false, values: ["^en$"] }
  ];

  describe.skip("string filter conversion to filter clause", () => {
    stringFilterTests.forEach(({ dimension, action, exclude, values }) => {
      it(`converts definition with "${action}" action`, () => {
        const filterClauseDefinition = stringFilterDefinition(dimension, action, values, exclude);
        const filterClause = filterDefinitionConverter.toFilterClause(filterClauseDefinition, DataCubeFixtures.wiki());
        const expected = stringWithAction(dimension, action, values, exclude);

        expect(filterClause).to.deep.equal(expected);
      });
    });
  });

  describe("string filter conversion from filter clause", () => {
    stringFilterTests.forEach(({ dimension, action, exclude, values }) => {
      it(`converts clause with "${action}" action`, () => {
        const filterClause = stringWithAction(dimension, action, values, exclude);
        const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause);
        const expected = stringFilterDefinition(dimension, action, values, exclude);

        expect(filterClauseDefinition).to.deep.equal(expected);
      });
    });
  });

  const numberFilterTests: Array<{ dimension: string, exclude: boolean, start?: number, end?: number, bounds?: string }> = [
    { dimension: "commentLength", exclude: false, start: 1, end: null, bounds: "[)" },
    { dimension: "commentLength", exclude: true, start: null, end: 100, bounds: "()" },
    { dimension: "commentLength", exclude: false, start: 1, end: 2, bounds: "[)" },
    { dimension: "commentLength", exclude: false, start: 1, end: 1, bounds: "[]" }
  ];

  describe.skip("number filter conversion to filter clause", () => {
    numberFilterTests.forEach(({ dimension, exclude, start, end, bounds }) => {
      it(`converts range: ${start} - ${end} with bounds "${bounds}"`, () => {
        const filterClauseDefinition = numberRangeFilterDefinition(dimension, start, end, bounds, exclude);
        const filterClause = filterDefinitionConverter.toFilterClause(filterClauseDefinition, DataCubeFixtures.wiki());
        const expected = numberRange(dimension, start, end, bounds, exclude);

        expect(filterClause).to.deep.equal(expected);
      });
    });
  });

  describe("number filter conversion from filter clause", () => {
    numberFilterTests.forEach(({ dimension, exclude, start, end, bounds }) => {
      it(`converts range: ${start} - ${end} with bounds "${bounds}"`, () => {
        const filterClause = numberRange(dimension, start, end, bounds, exclude);
        const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause);
        const expected = numberRangeFilterDefinition(dimension, start, end, bounds, exclude);

        expect(filterClauseDefinition).to.deep.equal(expected);
      });
    });
  });

  describe("time filter conversion", () => {
    it.skip("converts time range clause", () => {
      const startDate = new Date("2018-01-01T00:00:00");
      const endDate = new Date("2018-01-02T00:00:00");
      const filterClause = timeRange("time", startDate, endDate);

      const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause);
      const expected =
        timeRangeFilterDefinition("time", startDate.toISOString(), endDate.toISOString());

      expect(filterClauseDefinition).to.deep.equal(expected);
    });

    describe("latest time periods", () => {
      const latestTimeTests = [
        {  multiple: -1, duration: "PT1H" },
        {  multiple: -6, duration: "PT1H" },
        {  multiple: -1, duration: "P1D" },
        {  multiple: -7, duration: "P1D" },
        {  multiple: -30, duration: "P1D" }
      ];

      describe.skip("filter conversion to filter clause", () => {
        latestTimeTests.forEach(({ duration, multiple }) => {
          const multipliedDuration = Duration.fromJS(duration).multiply(Math.abs(multiple)).toJS();
          it(`converts ${-multiple} of ${duration}`, () => {
            const filterClauseDefinition = latestTimeFilterDefinition("time", multiple, duration);

            const filterClause = filterDefinitionConverter.toFilterClause(filterClauseDefinition, DataCubeFixtures.wiki());
            const expected = timePeriod("time", multipliedDuration, TimeFilterPeriod.LATEST);

            expect(filterClause).to.deep.equal(expected);
          });
        });
      });

      describe("filter conversion from filter clause", () => {
        latestTimeTests.forEach(({ multiple, duration }) => {
          const multipliedDuration = Duration.fromJS(duration).multiply(Math.abs(multiple)).toJS();
          it(`converts ${-multiple} of ${duration}`, () => {
            const filterClause = timePeriod("time", multipliedDuration, TimeFilterPeriod.LATEST);

            const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause);
            const expected = latestTimeFilterDefinition("time", -1, multipliedDuration);

            expect(filterClauseDefinition).to.deep.equal(expected);
          });
        });
      });
    });

    describe("floored time periods", () => {
      const flooredTimeDurations = [
        { duration: "P1D" },
        { duration: "P3D" },
        { duration: "P1W" },
        { duration: "P1M" },
        { duration: "P3M" },
        { duration: "P1Y" }
      ];

      const flooredTimeTests = [
        { periodName: "current", step: 1, period: TimeFilterPeriod.CURRENT },
        { periodName: "previous", step: -1, period: TimeFilterPeriod.PREVIOUS }
      ];

      describe.skip("definition to filter clause conversion", () => {
        flooredTimeTests.forEach(({ periodName, step, period }) => {
          flooredTimeDurations.forEach(({ duration }) => {
            it(`converts ${periodName} period ${duration}`, () => {
              const filterClauseDefinition = flooredTimeFilterDefinition("time", step, duration);

              const filterClause = filterDefinitionConverter.toFilterClause(filterClauseDefinition, DataCubeFixtures.wiki());
              const expected = timePeriod("time", duration, period);

              expect(filterClause).to.deep.equal(expected);
            });
          });
        });
      });

      describe("filter clause to definition conversion", () => {
        flooredTimeTests.forEach(({ periodName, step, period }) => {
          flooredTimeDurations.forEach(({ duration }) => {
            it(`converts ${periodName} period ${duration}`, () => {
              const filterClause = timePeriod("time", duration, period);

              const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause);
              const expected = flooredTimeFilterDefinition("time", step, duration);

              expect(filterClauseDefinition).to.deep.equal(expected);
            });
          });
        });
      });
    });
  });
});
