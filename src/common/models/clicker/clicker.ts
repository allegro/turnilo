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

import { Expression } from "plywood";
import { Colors } from "../colors/colors";
import { Dimension } from "../dimension/dimension";
import { VisStrategy } from "../essence/essence";
import { Filter } from "../filter/filter";
import { Manifest } from "../manifest/manifest";
import { Measure } from "../measure/measure";
import { SplitCombine } from "../split-combine/split-combine";
import { Splits } from "../splits/splits";
import { TimeShift } from "../time-shift/time-shift";

export interface Clicker {
  changeTimeSelection?(selection: Expression): void;

  changeFilter?(filter: Filter, colors?: Colors): void;

  changeComparisonShift?(timeShift: TimeShift): void;

  changeSplits?(splits: Splits, strategy: VisStrategy, colors?: Colors): void;

  changeSplit?(split: SplitCombine, strategy: VisStrategy): void;

  addSplit?(split: SplitCombine, strategy: VisStrategy): void;

  removeSplit?(split: SplitCombine, strategy: VisStrategy): void;

  changeColors?(colors: Colors): void;

  changeVisualization?(visualization: Manifest): void;

  pin?(dimension: Dimension): void;

  unpin?(dimension: Dimension): void;

  changePinnedSortMeasure?(measure: Measure): void;

  toggleMultiMeasureMode?(): void;

  toggleEffectiveMeasure?(measure: Measure): void;

  changeHighlight?(owner: string, measure: string, delta: Filter): void;

  acceptHighlight?(): void;

  dropHighlight?(): void;
}
