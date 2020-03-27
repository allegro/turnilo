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

import { Resolve, VisualizationManifest } from "../../models/visualization-manifest/visualization-manifest";
import { Actions } from "../../utils/rules/actions";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";
import { settings, TableSettings } from "./settings";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The Table requires at least one split"))
  .when(Predicates.supportedSplitsCount())
  .then(Actions.removeExcessiveSplits("Table"))

  .otherwise(({ splits, dataCube, isSelectedVisualization }) => {
    let autoChanged = false;
    const newSplits = splits.update("splits", splits => splits.map((split, i) => {
      const splitDimension = dataCube.getDimension(split.reference);

      // ToDo: review this
      if (!split.limit && splitDimension.kind !== "time") {
        split = split.changeLimit(i ? 5 : 50);
        autoChanged = true;
      }

      return split;
    }));

    return autoChanged ? Resolve.automatic(6, { splits: newSplits }) : Resolve.ready(isSelectedVisualization ? 10 : 6);
  })
  .build();

export const TABLE_MANIFEST = new VisualizationManifest<TableSettings>(
  "table",
  "Table",
  rulesEvaluator,
  settings
);
