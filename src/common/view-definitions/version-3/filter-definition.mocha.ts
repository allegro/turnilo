/*
 * Copyright 2017-2018 Allegro.pl
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
import { DataCubeFixtures } from "../../models/data-cube/data-cube.fixtures";
import { SupportedAction } from "../../models/filter-clause/filter-clause";
import { FilterClauseFixtures } from "../../models/filter-clause/filter-clause.fixtures";
import { filterDefinitionConverter, StringFilterAction } from "./filter-definition";
import { FilterDefinitionFixtures } from "./filter-definition.fixtures";

describe("FilterDefinition v3", () => {
  const booleanFilterTests = [
    { dimension: "isRobot", exclude: false, values: [true] },
    { dimension: "isRobot", exclude: true, values: [false] },
    { dimension: "isRobot", exclude: false, values: [true, false] }
  ];

  describe("boolean filter conversion to filter clause", () => {
    booleanFilterTests.forEach(({ dimension, exclude, values }) => {
      it(`converts filter clause with values: "${values}"`, () => {
        const filterClauseDefinition = FilterDefinitionFixtures.booleanFilterDefinition(dimension, values, exclude);
        const filterClause = filterDefinitionConverter.toFilterClause(filterClauseDefinition, DataCubeFixtures.wiki());
        const expected = FilterClauseFixtures.booleanIn(dimension, values, exclude);

        expect(filterClause).to.deep.equal(expected);
      });
    });
  });

  describe("boolean filter conversion from filter clause", () => {
    booleanFilterTests.forEach(({ dimension, exclude, values }) => {
      it(`converts definition with values: "${values}"`, () => {
        const filterClause = FilterClauseFixtures.booleanIn(dimension, values, exclude);
        const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause, DataCubeFixtures.wiki());
        const expected = FilterDefinitionFixtures.booleanFilterDefinition(dimension, values, exclude);

        expect(filterClauseDefinition).to.deep.equal(expected);
      });
    });
  });

  const stringFilterTests = [
    { dimension: "channel", action: StringFilterAction.in, clauseAction: SupportedAction.overlap, exclude: false, values: ["en", "pl"] },
    { dimension: "channel", action: StringFilterAction.in, clauseAction: SupportedAction.overlap, exclude: true, values: ["en", "pl"] },
    { dimension: "channel", action: StringFilterAction.contains, clauseAction: SupportedAction.contains, exclude: false, values: ["en"] },
    { dimension: "channel", action: StringFilterAction.match, clauseAction: SupportedAction.match, exclude: false, values: ["^en$"] }
  ];

  describe("string filter conversion to filter clause", () => {
    stringFilterTests.forEach(({ dimension, action, clauseAction, exclude, values }) => {
      it(`converts definition with "${action}" action`, () => {
        const filterClauseDefinition = FilterDefinitionFixtures.stringFilterDefinition(dimension, action, values, exclude);
        const filterClause = filterDefinitionConverter.toFilterClause(filterClauseDefinition, DataCubeFixtures.wiki());
        const expected = FilterClauseFixtures.stringWithAction(dimension, clauseAction, values, exclude);

        expect(filterClause).to.deep.equal(expected);
      });
    });
  });

  describe("string filter conversion from filter clause", () => {
    stringFilterTests.forEach(({ dimension, action, clauseAction, exclude, values }) => {
      it(`converts clause with "${clauseAction}" action`, () => {
        const filterClause = FilterClauseFixtures.stringWithAction(dimension, clauseAction, values, exclude);
        const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause, DataCubeFixtures.wiki());
        const expected = FilterDefinitionFixtures.stringFilterDefinition(dimension, action, values, exclude);

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

  describe("number filter conversion to filter clause", () => {
    numberFilterTests.forEach(({ dimension, exclude, start, end, bounds }) => {
      it(`converts range: ${start} - ${end} with bounds "${bounds}"`, () => {
        const filterClauseDefinition = FilterDefinitionFixtures.numberRangeFilterDefinition(dimension, start, end, bounds, exclude);
        const filterClause = filterDefinitionConverter.toFilterClause(filterClauseDefinition, DataCubeFixtures.wiki());
        const expected = FilterClauseFixtures.numberRange(dimension, start, end, bounds, exclude);

        expect(filterClause).to.deep.equal(expected);
      });
    });
  });

  describe("number filter conversion from filter clause", () => {
    numberFilterTests.forEach(({ dimension, exclude, start, end, bounds }) => {
      it(`converts range: ${start} - ${end} with bounds "${bounds}"`, () => {
        const filterClause = FilterClauseFixtures.numberRange(dimension, start, end, bounds, exclude);
        const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause, DataCubeFixtures.wiki());
        const expected = FilterDefinitionFixtures.numberRangeFilterDefinition(dimension, start, end, bounds, exclude);

        expect(filterClauseDefinition).to.deep.equal(expected);
      });
    });
  });

  describe("time filter conversion", () => {
    it("converts time range clause", () => {
      const startDate = new Date("2018-01-01T00:00:00");
      const endDate = new Date("2018-01-02T00:00:00");
      const filterClause = FilterClauseFixtures.timeRange("time", startDate, endDate);

      const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause, DataCubeFixtures.wiki());
      const expected =
        FilterDefinitionFixtures.timeRangeFilterDefinition("time", startDate.toISOString(), endDate.toISOString());

      expect(filterClauseDefinition).to.deep.equal(expected);
    });

    describe("latest time periods", () => {
      const latestTimeTests = [
        { multiple: -1, duration: "PT1H" },
        { multiple: -6, duration: "PT1H" },
        { multiple: -1, duration: "P1D" },
        { multiple: -7, duration: "P1D" },
        { multiple: -30, duration: "P1D" }
      ];

      describe("filter conversion to filter clause", () => {
        latestTimeTests.forEach(({ multiple, duration }) => {
          it(`converts ${-multiple} of ${duration}`, () => {
            const filterClauseDefinition = FilterDefinitionFixtures.latestTimeFilterDefinition("time", multiple, duration);

            const filterClause = filterDefinitionConverter.toFilterClause(filterClauseDefinition, DataCubeFixtures.wiki());
            const expected = FilterClauseFixtures.timeDurationLatest("time", multiple, duration);

            expect(filterClause).to.deep.equal(expected);
          });
        });
      });

      describe("filter conversion from filter clause", () => {
        latestTimeTests.forEach(({ multiple, duration }) => {
          it(`converts ${-multiple} of ${duration}`, () => {
            const filterClause = FilterClauseFixtures.timeDurationLatest("time", multiple, duration);

            const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause, DataCubeFixtures.wiki());
            const expected = FilterDefinitionFixtures.latestTimeFilterDefinition("time", multiple, duration);

            expect(filterClauseDefinition).to.deep.equal(expected);
          });
        });
      });
    });

    describe("floored time periods", () => {
      const flooredTimeDurations = [
        { duration: "P1D" },
        { duration: "P1W" },
        { duration: "P1M" },
        { duration: "P3M" },
        { duration: "P1Y" }
      ];

      const flooredTimeTests = [
        { periodName: "current", step: 1 },
        { periodName: "previous", step: -1 },
        { periodName: "one before previous", step: -2 }
      ];

      describe("definition to filter clause conversion", () => {
        flooredTimeTests.forEach(({ periodName, step }) => {
          flooredTimeDurations.forEach(({ duration }) => {
            it(`converts ${periodName} period ${duration}`, () => {
              const filterClauseDefinition = FilterDefinitionFixtures.flooredTimeFilterDefinition("time", step, duration);

              const filterClause = filterDefinitionConverter.toFilterClause(filterClauseDefinition, DataCubeFixtures.wiki());
              const expected = FilterClauseFixtures.timeDurationFloored("time", step, duration);

              expect(filterClause).to.deep.equal(expected);
            });
          });
        });
      });

      describe("filter clause to definition conversion", () => {
        flooredTimeTests.forEach(({ periodName, step }) => {
          flooredTimeDurations.forEach(({ duration }) => {
            it(`converts ${periodName} period ${duration}`, () => {
              const filterClause = FilterClauseFixtures.timeDurationFloored("time", step, duration);

              const filterClauseDefinition = filterDefinitionConverter.fromFilterClause(filterClause, DataCubeFixtures.wiki());
              const expected = FilterDefinitionFixtures.flooredTimeFilterDefinition("time", step, duration);

              expect(filterClauseDefinition).to.deep.equal(expected);
            });
          });
        });
      });
    });
  });
});
