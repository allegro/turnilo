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

import { TimeShiftJS } from "../../models/time-shift/time-shift";
import { FilterClauseDefinition } from "./filter-definition";
import { HighlightDefinition } from "./highlight-definition";
import { LegendDefinition } from "./legend-definition";
import { MeasuresDefinition } from "./measures-definition";
import { SplitDefinition } from "./split-definition";

export interface ViewDefinition3 {
  visualization: string;
  timezone: string;
  filters: FilterClauseDefinition[];
  splits: SplitDefinition[];
  measures: MeasuresDefinition;
  pinnedDimensions?: string[];
  pinnedSort?: string;
  legend?: LegendDefinition;
  highlight?: HighlightDefinition;
  timeShift?: TimeShiftJS;
}
