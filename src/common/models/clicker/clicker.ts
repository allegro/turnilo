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

import { Dimension } from "../dimension/dimension";
import { VisStrategy } from "../essence/essence";
import { Filter } from "../filter/filter";
import { SeriesList } from "../series-list/series-list";
import { Series } from "../series/series";
import { Split } from "../split/split";
import { Splits } from "../splits/splits";
import { TimeShift } from "../time-shift/time-shift";
import { VisualizationManifest } from "../visualization-manifest/visualization-manifest";
import { VisualizationSettings } from "../visualization-settings/visualization-settings";

export interface Clicker {
  changeFilter?(filter: Filter): void;

  changeComparisonShift?(timeShift: TimeShift): void;

  changeSplits?(splits: Splits, strategy: VisStrategy): void;

  changeSplit?(split: Split, strategy: VisStrategy): void;

  addSplit?(split: Split, strategy: VisStrategy): void;

  removeSplit?(split: Split, strategy: VisStrategy): void;

  changeSeriesList?(seriesList: SeriesList): void;

  addSeries?(series: Series): void;

  removeSeries?(series: Series): void;

  changeVisualization?(visualization: VisualizationManifest, settings: VisualizationSettings): void;

  pin?(dimension: Dimension): void;

  unpin?(dimension: Dimension): void;

  changePinnedSortSeries?(series: Series): void;
}
