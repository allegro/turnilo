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

import { ColorsJS } from "../../models/colors/colors";
// import { FilterJS } from "../../models/filter/filter";
// import { HighlightJS } from "../../models/highlight/highlight";
// import { SplitsJS } from "../../models/splits/splits";
import { MeasuresDefinitionJS } from "../version-3/measures-definition";

export interface ViewDefinition2 {
  visualization?: string;
  timezone?: string;
  filter?: any;
  splits?: any;
  measures: MeasuresDefinitionJS;
  pinnedDimensions?: string[];
  colors?: ColorsJS;
  pinnedSort?: string;
  compare?: any;
  highlight?: any;
}
