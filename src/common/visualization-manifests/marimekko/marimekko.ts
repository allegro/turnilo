/*
 * Copyright 2017-2022 Allegro.pl
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

import { Resolve, VisualizationManifest } from "../../models/visualization-manifest/visualization-manifest";
import { emptySettingsConfig } from "../../models/visualization-settings/empty-settings-config";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";
import {
  suggestAddingMeasure,
  suggestAddingSplits,
  suggestRemovingMeasures,
  suggestRemovingSplits
} from "../heat-map/heat-map";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.numberOfSplitsIsNot(2))
  .then(variables => Resolve.manual(
    3,
    "Marimekko needs exactly 2 splits",
    variables.splits.length() > 2 ? suggestRemovingSplits(variables) : suggestAddingSplits(variables)
  ))
  .when(Predicates.numberOfSeriesIsNot(1))
  .then(variables => Resolve.manual(
    3,
    "Marimekko needs exactly 1 measure",
    variables.series.series.size === 0 ? suggestAddingMeasure(variables) : suggestRemovingMeasures(variables)
  ))
  .otherwise(({ isSelectedVisualization }) => Resolve.ready(isSelectedVisualization ? 10 : 3))
  .build();

export const MARIMEKKO_MANIFEST = new VisualizationManifest(
  "marimekko",
  "Marimekko",
  rulesEvaluator,
  emptySettingsConfig
);
