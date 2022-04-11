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

import { findDimensionByName } from "../../models/dimension/dimensions";
import { Resolve, VisualizationManifest } from "../../models/visualization-manifest/visualization-manifest";
import { emptySettingsConfig } from "../../models/visualization-settings/empty-settings-config";
import { thread } from "../../utils/functional/functional";
import { Actions } from "../../utils/rules/actions";
import { Predicates } from "../../utils/rules/predicates";
import { adjustFiniteLimit, adjustSort } from "../../utils/rules/split-adjustments";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";

export const GRID_LIMITS = [50, 100, 200, 500, 1000, 10000];

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The Grid requires at least one split"))

  .when(Predicates.noSelectedMeasures())
  .then(Actions.manualMeasuresSelection())

  .otherwise(({ isSelectedVisualization, series, dataCube, splits }) => {
    const firstSplit = splits.getSplit(0);

    const splitReferences = splits.splits.toArray().map(split => split.reference);
    const dimension = findDimensionByName(dataCube.dimensions, firstSplit.reference);
    const fixedFirstSplit = thread(
      firstSplit,
      adjustFiniteLimit(GRID_LIMITS),
      adjustSort(dimension, series, splitReferences)
    );
    const newSplits = splits.replace(firstSplit, fixedFirstSplit);

    if (splits.equals(newSplits)) {
      return Resolve.ready(isSelectedVisualization ? 10 : 6);
    }
    return Resolve.automatic(6, { splits: newSplits });
  })
  .build();

export const GRID_MANIFEST = new VisualizationManifest(
  "grid",
  "Grid",
  rulesEvaluator,
  emptySettingsConfig
);
