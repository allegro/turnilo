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

import { Filter } from "..";
import { LineChart } from "../../../client/visualizations/line-chart/line-chart";
import { Table } from "../../../client/visualizations/table/table";
import { FilterClauseFixtures } from "../filter-clause/filter-clause.fixtures";
import { Highlight } from "./highlight";

export class HighlightFixtures {
  static tableNoMeasure(): Highlight {
    const channelInFilterClause = FilterClauseFixtures.stringIn("channel", ["en"]);
    return new Highlight({
      owner: Table.id,
      measure: null,
      delta: Filter.fromClause(channelInFilterClause)
    });
  }

  static lineChartWithAvgAddedMeasure(): Highlight {
    const channelInFilterClause = FilterClauseFixtures.stringIn("channel", ["en"]);
    return new Highlight({
      owner: LineChart.id,
      measure: "avg_added",
      delta: Filter.fromClause(channelInFilterClause)
    });
  }

  static lineChartWithAddedMeasure(): Highlight {
    const channelInFilterClause = FilterClauseFixtures.stringIn("channel", ["en"]);
    return new Highlight({
      owner: LineChart.id,
      measure: "added",
      delta: Filter.fromClause(channelInFilterClause)
    });
  }
}
