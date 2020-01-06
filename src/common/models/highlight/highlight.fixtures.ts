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

import { stringIn } from "../filter-clause/filter-clause.fixtures";
import { Filter } from "../filter/filter";
import { Highlight } from "./highlight";

export function tableNoMeasure(): Highlight {
  const channelInFilterClause = stringIn("channel", ["en"]);
  return new Highlight({
    measure: null,
    delta: Filter.fromClause(channelInFilterClause)
  });
}

export function lineChartWithAvgAddedMeasure(): Highlight {
  const channelInFilterClause = stringIn("channel", ["en"]);
  return new Highlight({
    measure: "avg_added",
    delta: Filter.fromClause(channelInFilterClause)
  });
}

export function lineChartWithAddedMeasure(): Highlight {
  const channelInFilterClause = stringIn("channel", ["en"]);
  return new Highlight({
    measure: "added",
    delta: Filter.fromClause(channelInFilterClause)
  });
}
