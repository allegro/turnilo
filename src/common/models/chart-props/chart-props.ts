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

import { List } from "immutable";
import { Dataset } from "plywood";
import { Highlight } from "../../../client/visualizations/highlight-controller/highlight";
import { Nullary } from "../../utils/functional/functional";
import { Clicker } from "../clicker/clicker";
import { Essence } from "../essence/essence";
import { FilterClause } from "../filter-clause/filter-clause";
import { Stage } from "../stage/stage";
import { Timekeeper } from "../timekeeper/timekeeper";

export interface ChartProps {
  data: Dataset;
  clicker: Clicker;
  essence: Essence;
  timekeeper: Timekeeper;
  stage: Stage;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  highlight: Highlight | null;
  saveHighlight: (clauses: List<FilterClause>, key?: string) => void;
}
