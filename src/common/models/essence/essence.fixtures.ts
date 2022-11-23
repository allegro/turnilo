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

import { Duration, Timezone } from "chronoshift";
import { List, OrderedSet } from "immutable";
import { HEAT_MAP_MANIFEST } from "../../visualization-manifests/heat-map/heat-map";
import { LINE_CHART_MANIFEST } from "../../visualization-manifests/line-chart/line-chart";
import { TABLE_MANIFEST } from "../../visualization-manifests/table/table";
import { TOTALS_MANIFEST } from "../../visualization-manifests/totals/totals";
import { clientAppSettings } from "../app-settings/app-settings.fixtures";
import { customClientCube, twitterClientDataCube, wikiClientDataCube } from "../data-cube/data-cube.fixtures";
import {
  NumberFilterClause,
  NumberRange,
  RelativeTimeFilterClause,
  TimeFilterPeriod
} from "../filter-clause/filter-clause";
import {
  boolean,
  numberRange,
  stringContains,
  stringIn,
  stringMatch,
  timePeriod,
  timeRange
} from "../filter-clause/filter-clause.fixtures";
import { Filter } from "../filter/filter";
import { EMPTY_SERIES, SeriesList } from "../series-list/series-list";
import { measureSeries } from "../series/series.fixtures";
import { SortDirection } from "../sort/sort";
import { booleanSplitCombine, numberSplitCombine, stringSplitCombine, timeSplitCombine } from "../split/split.fixtures";
import { EMPTY_SPLITS, Splits } from "../splits/splits";
import { TimeShift } from "../time-shift/time-shift";
import { VisualizationManifest } from "../visualization-manifest/visualization-manifest";
import { Essence, EssenceValue, VisStrategy } from "./essence";

const defaultEssence: EssenceValue = {
  appSettings: clientAppSettings,
  dataCube: customClientCube("essence-fixture-data-cube", "essence-fixture-data-cube"),
  visualization: null,
  visualizationSettings: null,
  timezone: Timezone.UTC,
  pinnedDimensions: OrderedSet([]),
  filter: new Filter({
    clauses: List([
      new NumberFilterClause({ reference: "commentLength", values: List.of(new NumberRange({ start: 1, end: 100 })) }),
      new RelativeTimeFilterClause({ reference: "time", period: TimeFilterPeriod.LATEST, duration: Duration.fromJS("P1D") })
    ])
  }),
  pinnedSort: null,
  splits: EMPTY_SPLITS,
  timeShift: TimeShift.empty(),
  series: EMPTY_SERIES
};

export class EssenceFixtures {
  static noViz(): EssenceValue {
    return {
      ...defaultEssence,
      visualization: TOTALS_MANIFEST,
      series: SeriesList.fromSeries([measureSeries("count")])
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
      visualization: LINE_CHART_MANIFEST as unknown as VisualizationManifest
    };
  }

  static getWikiContext() {
    return {
      dataCube: wikiClientDataCube
    };
  }

  static getTwitterContext() {
    return {
      dataCube: twitterClientDataCube
    };
  }

  static wikiHeatmap(): Essence {
    const filterClauses = [
      timeRange("time", new Date("2015-09-12T00:00:00Z"), new Date("2015-09-13T00:00:00Z"))
    ];
    const splitCombines = [
      stringSplitCombine("channel", { sort: { reference: "added", direction: SortDirection.descending }, limit: 50 }),
      stringSplitCombine("namespace", { sort: { reference: "added", direction: SortDirection.descending }, limit: 5 })
    ];
    return new Essence({
      appSettings: clientAppSettings,
      dataCube: wikiClientDataCube,
      visualization: HEAT_MAP_MANIFEST,
      visualizationSettings: HEAT_MAP_MANIFEST.visualizationSettings.defaults,
      timezone: Timezone.fromJS("Etc/UTC"),
      timeShift: TimeShift.empty(),
      filter: Filter.fromClauses(filterClauses),
      splits: new Splits({ splits: List(splitCombines) }),
      series: SeriesList.fromSeries([measureSeries("added")]),
      pinnedDimensions: OrderedSet(["channel", "namespace", "isRobot"]),
      pinnedSort: "delta"
    });
  }

  static wikiTable(): Essence {
    const filterClauses = [
      timeRange("time", new Date("2015-09-12T00:00:00Z"), new Date("2015-09-13T00:00:00Z")),
      stringIn("channel", ["en"]),
      boolean("isRobot", [true], true),
      stringContains("page", "Jeremy", false),
      stringMatch("userChars", "^A$", false),
      numberRange("commentLength", 3, null, "[)", false)
    ];
    const splitCombines = [
      stringSplitCombine("channel", { sort: { reference: "delta", direction: SortDirection.descending }, limit: 50 }),
      booleanSplitCombine("isRobot", { sort: { reference: "delta", direction: SortDirection.descending }, limit: 5 }),
      numberSplitCombine("commentLength", 10, { sort: { reference: "delta", direction: SortDirection.descending }, limit: 5 }),
      timeSplitCombine("time", "PT1H", { sort: { reference: "delta", direction: SortDirection.descending }, limit: null })
    ];
    const series = [
      measureSeries("delta"),
      measureSeries("count"),
      measureSeries("added")
    ];
    return new Essence({
      appSettings: clientAppSettings,
      dataCube: wikiClientDataCube,
      visualization: TABLE_MANIFEST as unknown as VisualizationManifest,
      visualizationSettings: TABLE_MANIFEST.visualizationSettings.defaults,
      timezone: Timezone.fromJS("Etc/UTC"),
      timeShift: TimeShift.empty(),
      filter: Filter.fromClauses(filterClauses),
      splits: new Splits({ splits: List(splitCombines) }),
      series: SeriesList.fromSeries(series),
      pinnedDimensions: OrderedSet(["channel", "namespace", "isRobot"]),
      pinnedSort: "delta"
    });
  }

  static wikiLineChart() {
    const filterClauses = [
      timePeriod("time", "P1D", TimeFilterPeriod.LATEST),
      stringIn("channel", ["en", "no", "sv", "de", "fr", "cs"])
    ];
    const splitCombines = [
      stringSplitCombine("channel", { sort: { reference: "delta", direction: SortDirection.descending }, limit: 50 }),
      timeSplitCombine("time", "PT1H", { sort: { reference: "delta", direction: SortDirection.descending }, limit: null })
    ];
    const series = [
      measureSeries("delta"),
      measureSeries("count"),
      measureSeries("added")
    ];
    return new Essence({
      appSettings: clientAppSettings,
      dataCube: wikiClientDataCube,
      visualization: LINE_CHART_MANIFEST as unknown as VisualizationManifest,
      visualizationSettings: LINE_CHART_MANIFEST.visualizationSettings.defaults,
      timezone: Timezone.fromJS("Etc/UTC"),
      timeShift: TimeShift.empty(),
      filter: Filter.fromClauses(filterClauses),
      splits: new Splits({ splits: List(splitCombines) }),
      series: SeriesList.fromSeries(series),
      pinnedDimensions: OrderedSet(["channel", "namespace", "isRobot"]),
      pinnedSort: "delta"
    });
  }

  static wikiTotals() {
    return new Essence({ ...EssenceFixtures.totals(), ...EssenceFixtures.getWikiContext() });
  }

  static wikiLineChartNoNominalSplit() {
    const essence = EssenceFixtures.wikiLineChart();
    const split = essence.splits.getSplit(0);
    return essence.removeSplit(split, VisStrategy.FairGame);
  }

  static wikiLineChartNoSplits() {
    const essence = EssenceFixtures.wikiLineChart();
    return essence.changeSplits(Splits.fromSplits([]), VisStrategy.KeepAlways);
  }

  static twitterNoVisualisation() {
    return new Essence({ ...EssenceFixtures.noViz(), ...EssenceFixtures.getTwitterContext() });
  }
}
