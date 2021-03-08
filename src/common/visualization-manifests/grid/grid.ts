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

import { SeriesSort } from "../../models/sort/sort";
import { Resolve, VisualizationManifest } from "../../models/visualization-manifest/visualization-manifest";
import { emptySettingsConfig } from "../../models/visualization-settings/empty-settings-config";
import { isFiniteNumber } from "../../utils/general/general";
import { Actions } from "../../utils/rules/actions";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The Grid requires at least one split"))

  .otherwise(({ isSelectedVisualization, splits, series }) => {
    const firstSeries = series.series.first();
    const { limit: firstLimit, sort: firstSort } = splits.getSplit(0);
    const safeFirstLimit = isFiniteNumber(firstLimit) ? firstLimit : 50;
    const sort = firstSort instanceof SeriesSort
      ? firstSort
      : new SeriesSort({ reference: firstSeries.reference });
    const newSplits = splits.update("splits", splits =>
      splits.map(split =>
        split.changeLimit(safeFirstLimit).changeSort(sort)));

    if (splits.equals(newSplits)) {
      return Resolve.ready(isSelectedVisualization ? 10 : 4);
    }
    return Resolve.automatic(6, { splits: newSplits });
  })
  .build();

export const GRID_MANIFEST = new VisualizationManifest(
  "grid",
  "[BETA] Grid",
  rulesEvaluator,
  emptySettingsConfig
);
