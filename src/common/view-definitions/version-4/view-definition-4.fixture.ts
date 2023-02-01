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

import { Timezone } from "chronoshift";
import { TOTALS_MANIFEST } from "../../visualization-manifests/totals/totals";
import { flooredTimeFilterDefinition } from "./filter-definition.fixtures";
import { ViewDefinition4 } from "./view-definition-4";

export const total: ViewDefinition4 = {
  filters: [flooredTimeFilterDefinition("time", -1, "P1D")],
  splits: [],
  series: [{ reference: "count" }, { reference: "added" }],
  pinnedDimensions: ["string_a"],
  timezone: Timezone.UTC.toString(),
  visualization: TOTALS_MANIFEST.name
};
