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

import { FilterClause, StringFilterAction, TimeFilterPeriod } from "../../../models/filter-clause/filter-clause";
import { boolean, numberRange, stringWithAction, timePeriod, timeRange } from "../../../models/filter-clause/filter-clause.fixtures";
import { Filter } from "../../../models/filter/filter";
import { defaultTimeClause, mockEssence } from "../../test/essence.fixture";
import { mockViewDefinition } from "../../test/view-definition.fixture";
import { FilterClauseDefinition, filterDefinitionConverter } from "../filter-definition";
import {
  booleanFilterDefinition,
  currentTimeFilterDefinition,
  latestTimeFilterDefinition,
  numberRangeFilterDefinition,
  previousTimeFilterDefinition,
  stringFilterDefinition,
  timeRangeFilterDefinition
} from "../filter-definition.fixtures";
import { assertConversionToEssence } from "./utils";

const mockViewDefinitionWithFilters = (...filters: FilterClauseDefinition[]) =>
  mockViewDefinition({ filters });

const mockEssenceWithFilters = (...clauses: FilterClause[]) =>
  mockEssence({ filter: Filter.fromClauses(clauses) });

const defaultTimeClauseDefinition = filterDefinitionConverter.fromFilterClause(defaultTimeClause);

const mockViewDefinitionWithFiltersAndTime = (...filters: FilterClauseDefinition[]) =>
  mockViewDefinition({ filters: [defaultTimeClauseDefinition, ...filters] });

const mockEssenceWithFiltersAndTime = (...clauses: FilterClause[]) =>
  mockEssence({ filter: Filter.fromClauses([defaultTimeClause, ...clauses]) });

describe("Filter", () => {
  describe("Clause conversion", () => {
    describe("Boolean Clause", () => {
      describe("Include mode", () => {
        it("single value", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(booleanFilterDefinition("string_a", [true])),
            mockEssenceWithFiltersAndTime(boolean("string_a", [true])));
        });

        it("multiple values", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(booleanFilterDefinition("string_a", [true, false])),
            mockEssenceWithFiltersAndTime(boolean("string_a", [true, false])));
        });

        it("heterogeneous values", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(booleanFilterDefinition("string_a", [true, "Unknown"])),
            mockEssenceWithFiltersAndTime(boolean("string_a", [true, "Unknown"])));
        });
      });

      describe("Exclude mode", () => {
        it("single value", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(booleanFilterDefinition("string_a", [true], true)),
            mockEssenceWithFiltersAndTime(boolean("string_a", [true], true)));
        });

        it("multiple values", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(booleanFilterDefinition("string_a", [true, false], true)),
            mockEssenceWithFiltersAndTime(boolean("string_a", [true, false], true)));
        });

        it("heterogeneous values", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(booleanFilterDefinition("string_a", [true, "Unknown"], true)),
            mockEssenceWithFiltersAndTime(boolean("string_a", [true, "Unknown"], true)));
        });
      });
    });

    describe("String Clause", () => {
      describe("IN action", () => {
        it("single value", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(stringFilterDefinition("string_a", StringFilterAction.IN, ["bazz"])),
            mockEssenceWithFiltersAndTime(stringWithAction("string_a", StringFilterAction.IN, ["bazz"]))
          );
        });

        it("multiple values", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(stringFilterDefinition("string_a", StringFilterAction.IN, ["bazz", "qvux"])),
            mockEssenceWithFiltersAndTime(stringWithAction("string_a", StringFilterAction.IN, ["bazz", "qvux"]))
          );
        });

        it("single value excluded", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(stringFilterDefinition("string_a", StringFilterAction.IN, ["bazz"], true)),
            mockEssenceWithFiltersAndTime(stringWithAction("string_a", StringFilterAction.IN, ["bazz"], true))
          );
        });

        it("multiple values excluded", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(stringFilterDefinition("string_a", StringFilterAction.IN, ["bazz", "qvux"], true)),
            mockEssenceWithFiltersAndTime(stringWithAction("string_a", StringFilterAction.IN, ["bazz", "qvux"], true))
          );
        });
      });

      describe("CONTAINS action", () => {
        it("single value", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(stringFilterDefinition("string_a", StringFilterAction.CONTAINS, ["bazz"])),
            mockEssenceWithFiltersAndTime(stringWithAction("string_a", StringFilterAction.CONTAINS, ["bazz"]))
          );
        });
      });

      describe("MATCH action", () => {
        it("single value", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(stringFilterDefinition("string_a", StringFilterAction.MATCH, ["^foo$"])),
            mockEssenceWithFiltersAndTime(stringWithAction("string_a", StringFilterAction.MATCH, ["^foo$"]))
          );
        });
      });
    });

    describe("Number Clause", () => {
      describe("Include mode", () => {
        it("open bounds", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(numberRangeFilterDefinition("numeric", 1, 100, "()")),
            mockEssenceWithFiltersAndTime(numberRange("numeric", 1, 100, "()")));
        });
        it("closed bounds", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(numberRangeFilterDefinition("numeric", 1, 100, "[]")),
            mockEssenceWithFiltersAndTime(numberRange("numeric", 1, 100, "[]")));
        });

        it("mixed bounds", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(numberRangeFilterDefinition("numeric", 1, 100, "[)")),
            mockEssenceWithFiltersAndTime(numberRange("numeric", 1, 100, "[)")));
        });

        it("empty start", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(numberRangeFilterDefinition("numeric", null, 100, "[)")),
            mockEssenceWithFiltersAndTime(numberRange("numeric", null, 100, "[)")));
        });

        it("empty end", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(numberRangeFilterDefinition("numeric", 1, null, "[)")),
            mockEssenceWithFiltersAndTime(numberRange("numeric", 1, null, "[)")));
        });
      });

      describe("Exclude mode", () => {
        it("open bounds", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(numberRangeFilterDefinition("numeric", 1, 100, "()", true)),
            mockEssenceWithFiltersAndTime(numberRange("numeric", 1, 100, "()", true)));
        });
        it("closed bounds", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(numberRangeFilterDefinition("numeric", 1, 100, "[]", true)),
            mockEssenceWithFiltersAndTime(numberRange("numeric", 1, 100, "[]", true)));
        });

        it("mixed bounds", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(numberRangeFilterDefinition("numeric", 1, 100, "[)", true)),
            mockEssenceWithFiltersAndTime(numberRange("numeric", 1, 100, "[)", true)));
        });

        it("empty start", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(numberRangeFilterDefinition("numeric", null, 100, "[)", true)),
            mockEssenceWithFiltersAndTime(numberRange("numeric", null, 100, "[)", true)));
        });

        it("empty end", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFiltersAndTime(numberRangeFilterDefinition("numeric", 1, null, "[)", true)),
            mockEssenceWithFiltersAndTime(numberRange("numeric", 1, null, "[)", true)));
        });
      });
    });

    describe("Time Clause", () => {
      it("fixed range", () => {
        const start = new Date("2018-01-01T00:00:00");
        const end = new Date("2018-01-02T00:00:00");
        assertConversionToEssence(
          mockViewDefinitionWithFilters(timeRangeFilterDefinition("time", start.toISOString(), end.toISOString())),
          mockEssenceWithFilters(timeRange("time", start, end)));
      });

      describe("Latest period", () => {
        it("latest hour", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -1, "PT1H")),
            mockEssenceWithFilters(timePeriod("time", "PT1H", TimeFilterPeriod.LATEST)));
        });

        it("latest two hours", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -2, "PT1H")),
            mockEssenceWithFilters(timePeriod("time", "PT2H", TimeFilterPeriod.LATEST)));
        });

        it("latest fifteen minutes", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -15, "PT1M")),
            mockEssenceWithFilters(timePeriod("time", "PT15M", TimeFilterPeriod.LATEST)));
        });

        it("latest day", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -1, "P1D")),
            mockEssenceWithFilters(timePeriod("time", "P1D", TimeFilterPeriod.LATEST)));
        });

        it("latest two days", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -2, "P1D")),
            mockEssenceWithFilters(timePeriod("time", "P2D", TimeFilterPeriod.LATEST)));
        });

        it("latest week", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -1, "P1W")),
            mockEssenceWithFilters(timePeriod("time", "P1W", TimeFilterPeriod.LATEST)));
        });

        it("latest month", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -1, "P1M")),
            mockEssenceWithFilters(timePeriod("time", "P1M", TimeFilterPeriod.LATEST)));
        });

        it("latest quarter", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -3, "P1M")),
            mockEssenceWithFilters(timePeriod("time", "P3M", TimeFilterPeriod.LATEST)));
        });

        it("latest year", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -1, "P1Y")),
            mockEssenceWithFilters(timePeriod("time", "P1Y", TimeFilterPeriod.LATEST)));
        });

        it("latest three years", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -3, "P1Y")),
            mockEssenceWithFilters(timePeriod("time", "P3Y", TimeFilterPeriod.LATEST)));
        });

        it("handles multiplied duration", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(latestTimeFilterDefinition("time", -1, "P3Y")),
            mockEssenceWithFilters(timePeriod("time", "P3Y", TimeFilterPeriod.LATEST)));
        });
      });

      describe("Current period", () => {
        it("current hour", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(currentTimeFilterDefinition("time", "PT1H")),
            mockEssenceWithFilters(timePeriod("time", "PT1H", TimeFilterPeriod.CURRENT)));
        });

        it("current two hours", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(currentTimeFilterDefinition("time", "PT2H")),
            mockEssenceWithFilters(timePeriod("time", "PT2H", TimeFilterPeriod.CURRENT)));
        });

        it("current fifteen minutes", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(currentTimeFilterDefinition("time", "PT15M")),
            mockEssenceWithFilters(timePeriod("time", "PT15M", TimeFilterPeriod.CURRENT)));
        });

        it("current day", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(currentTimeFilterDefinition("time", "P1D")),
            mockEssenceWithFilters(timePeriod("time", "P1D", TimeFilterPeriod.CURRENT)));
        });

        it("current two days", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(currentTimeFilterDefinition("time", "P2D")),
            mockEssenceWithFilters(timePeriod("time", "P2D", TimeFilterPeriod.CURRENT)));
        });

        it("current week", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(currentTimeFilterDefinition("time", "P1W")),
            mockEssenceWithFilters(timePeriod("time", "P1W", TimeFilterPeriod.CURRENT)));
        });

        it("current month", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(currentTimeFilterDefinition("time", "P1M")),
            mockEssenceWithFilters(timePeriod("time", "P1M", TimeFilterPeriod.CURRENT)));
        });

        it("current quarter", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(currentTimeFilterDefinition("time", "P3M")),
            mockEssenceWithFilters(timePeriod("time", "P3M", TimeFilterPeriod.CURRENT)));
        });

        it("current year", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(currentTimeFilterDefinition("time", "P1Y")),
            mockEssenceWithFilters(timePeriod("time", "P1Y", TimeFilterPeriod.CURRENT)));
        });

        it("current three years", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(currentTimeFilterDefinition("time", "P3Y")),
            mockEssenceWithFilters(timePeriod("time", "P3Y", TimeFilterPeriod.CURRENT)));
        });
      });

      describe("Previous period", () => {
        it("previous hour", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(previousTimeFilterDefinition("time", "PT1H")),
            mockEssenceWithFilters(timePeriod("time", "PT1H", TimeFilterPeriod.PREVIOUS)));
        });

        it("previous two hours", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(previousTimeFilterDefinition("time", "PT2H")),
            mockEssenceWithFilters(timePeriod("time", "PT2H", TimeFilterPeriod.PREVIOUS)));
        });

        it("previous fifteen minutes", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(previousTimeFilterDefinition("time", "PT15M")),
            mockEssenceWithFilters(timePeriod("time", "PT15M", TimeFilterPeriod.PREVIOUS)));
        });

        it("previous day", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(previousTimeFilterDefinition("time", "P1D")),
            mockEssenceWithFilters(timePeriod("time", "P1D", TimeFilterPeriod.PREVIOUS)));
        });

        it("previous two days", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(previousTimeFilterDefinition("time", "P2D")),
            mockEssenceWithFilters(timePeriod("time", "P2D", TimeFilterPeriod.PREVIOUS)));
        });

        it("previous week", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(previousTimeFilterDefinition("time", "P1W")),
            mockEssenceWithFilters(timePeriod("time", "P1W", TimeFilterPeriod.PREVIOUS)));
        });

        it("previous month", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(previousTimeFilterDefinition("time", "P1M")),
            mockEssenceWithFilters(timePeriod("time", "P1M", TimeFilterPeriod.PREVIOUS)));
        });

        it("previous quarter", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(previousTimeFilterDefinition("time", "P3M")),
            mockEssenceWithFilters(timePeriod("time", "P3M", TimeFilterPeriod.PREVIOUS)));
        });

        it("previous year", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(previousTimeFilterDefinition("time", "P1Y")),
            mockEssenceWithFilters(timePeriod("time", "P1Y", TimeFilterPeriod.PREVIOUS)));
        });

        it("previous three years", () => {
          assertConversionToEssence(
            mockViewDefinitionWithFilters(previousTimeFilterDefinition("time", "P3Y")),
            mockEssenceWithFilters(timePeriod("time", "P3Y", TimeFilterPeriod.PREVIOUS)));
        });
      });
    });
  });
});
