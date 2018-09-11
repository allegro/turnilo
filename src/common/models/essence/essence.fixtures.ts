/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Timezone } from "chronoshift";
import { List, OrderedSet } from "immutable";
import { MANIFESTS } from "../../manifests";
import { LINE_CHART_MANIFEST } from "../../manifests/line-chart/line-chart";
import { TABLE_MANIFEST } from "../../manifests/table/table";
import { TOTALS_MANIFEST } from "../../manifests/totals/totals";
import { SortDirection } from "../../view-definitions/version-3/split-definition";
import { Colors } from "../colors/colors";
import { DataCubeFixtures } from "../data-cube/data-cube.fixtures";
import { FilterClauseFixtures } from "../filter-clause/filter-clause.fixtures";
import { Filter } from "../filter/filter";
import { Highlight } from "../highlight/highlight";
import { SplitFixtures } from "../split/split.fixtures";
import { Splits } from "../splits/splits";
import { TimeShift } from "../time-shift/time-shift";
import { createMeasures, Essence, EssenceContext, EssenceValue } from "./essence";

const defaultEssence: EssenceValue = {
  dataCube: DataCubeFixtures.customCube("essence-fixture-data-cube", "essence-fixture-data-cube"),
  visualizations: MANIFESTS,
  visualization: null,
  timezone: Timezone.UTC,
  pinnedDimensions: OrderedSet([]),
  filter: null,
  colors: null,
  pinnedSort: null,
  compare: null,
  highlight: null,
  splits: Splits.fromJS([]),
  timeShift: null,
  measures: createMeasures()
};

export class EssenceFixtures {
  static noViz(): EssenceValue {
    return {
      ...defaultEssence,
      visualization: TOTALS_MANIFEST,
      measures: createMeasures({ isMulti: true, multi: OrderedSet(["count"]) })
    };
  }

  static totals(): EssenceValue {
    return {
      ...defaultEssence,
      visualization: TOTALS_MANIFEST
    };
  }

  static lineChart(): EssenceValue {
    return {
      ...defaultEssence,
      visualization: LINE_CHART_MANIFEST
    };
  }

  static getWikiContext(): EssenceContext {
    return {
      dataCube: DataCubeFixtures.wiki(),
      visualizations: MANIFESTS
    };
  }

  static getTwitterContext(): EssenceContext {
    return {
      dataCube: DataCubeFixtures.twitter(),
      visualizations: MANIFESTS
    };
  }

  static wikiTable(): Essence {
    const filterClauses = [
      FilterClauseFixtures.timeRange("time", new Date("2015-09-12T00:00:00Z"), new Date("2015-09-13T00:00:00Z"), false),
      FilterClauseFixtures.stringIn("channel", ["en"]),
      FilterClauseFixtures.booleanIn("isRobot", [true], true),
      FilterClauseFixtures.stringContains("page", "Jeremy", false),
      FilterClauseFixtures.stringMatch("userChars", "^A$", false),
      FilterClauseFixtures.numberRange("commentLength", 3, null, "[)", false)
    ];
    const splitCombines = [
      SplitFixtures.stringSplitCombine("channel", "delta", SortDirection.descending, 50),
      SplitFixtures.stringSplitCombine("isRobot", "delta", SortDirection.descending, 5),
      SplitFixtures.numberSplitCombine("commentLength", 10, "delta", SortDirection.descending, 5),
      SplitFixtures.timeSplitCombine("time", "PT1H", "delta", SortDirection.descending, 5)
    ];
    return new Essence({
      dataCube: DataCubeFixtures.wiki(),
      visualizations: MANIFESTS,
      visualization: TABLE_MANIFEST,
      timezone: Timezone.fromJS("Etc/UTC"),
      timeShift: TimeShift.empty(),
      filter: Filter.fromClauses(filterClauses),
      splits: new Splits(List(splitCombines)),
      measures: createMeasures({ isMulti: true, single: "delta", multi: OrderedSet(["count", "added"]) }),
      pinnedDimensions: OrderedSet(["channel", "namespace", "isRobot"]),
      colors: null,
      pinnedSort: "delta",
      compare: null,
      highlight: null
    });
  }

  static wikiLineChart() {
    const filterClauses = [
      FilterClauseFixtures.timeDurationLatest("time", -1, "P1D"),
      FilterClauseFixtures.stringIn("channel", ["en", "no", "sv", "de", "fr", "cs"])
    ];
    const splitCombines = [
      SplitFixtures.stringSplitCombine("channel", "delta", SortDirection.descending, 50),
      SplitFixtures.timeSplitCombine("time", "PT1H", "delta", SortDirection.descending, null)
    ];
    const highlightClauses = [
      FilterClauseFixtures.timeRange("time", new Date("2015-09-12T10:00:00Z"), new Date("2015-09-12T11:00:00Z"), false)
    ];
    return new Essence({
      dataCube: DataCubeFixtures.wiki(),
      visualizations: MANIFESTS,
      visualization: LINE_CHART_MANIFEST,
      timezone: Timezone.fromJS("Etc/UTC"),
      timeShift: TimeShift.empty(),
      filter: Filter.fromClauses(filterClauses),
      splits: new Splits(List(splitCombines)),
      measures: createMeasures({ isMulti: true, single: "delta", multi: OrderedSet(["count", "added"]) }),
      pinnedDimensions: OrderedSet(["channel", "namespace", "isRobot"]),
      colors: new Colors({ dimension: "channel", values: { 0: "no", 1: "sv", 3: "fr", 4: "cs", 5: "en" } }),
      pinnedSort: "delta",
      compare: null,
      highlight: new Highlight({ owner: "line-chart", measure: "count", delta: Filter.fromClauses(highlightClauses) })
    });
  }

  static wikiTotals() {
    return new Essence({ ...EssenceFixtures.totals(), ...EssenceFixtures.getWikiContext() });
  }

  static wikiLineChartNoSplit() {
    return new Essence({ ...EssenceFixtures.lineChart(), ...EssenceFixtures.getWikiContext() });
  }

  static twitterNoVisualisation() {
    return new Essence({ ...EssenceFixtures.noViz(), ...EssenceFixtures.getTwitterContext() });
  }
}
