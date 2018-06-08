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

import { $, SortExpression } from "plywood";
import { Manifest, Resolve } from "../../models/manifest/manifest";
import { Actions } from "../../utils/rules/actions";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";

var rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The Table requires at least one split"))

  .otherwise(({ splits, dataCube, colors, isSelectedVisualization }) => {
    var autoChanged = false;
    splits = splits.map((split, i) => {
      var splitDimension = splits.get(0).getDimension(dataCube.dimensions);
      var sortStrategy = splitDimension.sortStrategy;

      if (!split.sortAction) {
        if (sortStrategy) {
          if (sortStrategy === "self") {
            split = split.changeSortExpression(new SortExpression({
              expression: $(splitDimension.name),
              direction: SortExpression.DESCENDING
            }));
          } else {
            split = split.changeSortExpression(new SortExpression({
              expression: $(sortStrategy),
              direction: SortExpression.DESCENDING
            }));
          }
        } else {
          split = split.changeSortExpression(dataCube.getDefaultSortExpression());
          autoChanged = true;
        }
      }

      // ToDo: review this
      if (!split.limitAction && (autoChanged || splitDimension.kind !== "time")) {
        split = split.changeLimit(i ? 5 : 50);
        autoChanged = true;
      }

      return split;
    });

    if (colors) {
      colors = null;
      autoChanged = true;
    }

    return autoChanged ? Resolve.automatic(6, { splits }) : Resolve.ready(isSelectedVisualization ? 10 : 8);
  })
  .build();

export const TABLE_MANIFEST = new Manifest(
  "table",
  "Table",
  rulesEvaluator
);
