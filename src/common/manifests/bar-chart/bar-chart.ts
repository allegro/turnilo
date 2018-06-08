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
import { Dimension, SplitCombine, Splits } from "../../models";
import { Manifest, Resolve } from "../../models/manifest/manifest";
import { Actions } from "../../utils/rules/actions";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";

var rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The Bar Chart requires at least one split"))

  .when(Predicates.areExactSplitKinds("*"))
  .or(Predicates.areExactSplitKinds("*", "*"))
  .then(({ splits, dataCube, colors, isSelectedVisualization }) => {
    var continuousBoost = 0;

    // Auto adjustment
    var autoChanged = false;

    splits = splits.map((split: SplitCombine) => {
      var splitDimension = dataCube.getDimensionByExpression(split.expression);
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
        } else if (splitDimension.kind === "boolean") {  // Must sort boolean in deciding order!
          split = split.changeSortExpression(new SortExpression({
            expression: $(splitDimension.name),
            direction: SortExpression.DESCENDING
          }));
        } else {
          if (splitDimension.isContinuous()) {
            split = split.changeSortExpression(new SortExpression({
              expression: $(splitDimension.name),
              direction: SortExpression.ASCENDING
            }));
          } else {
            split = split.changeSortExpression(dataCube.getDefaultSortExpression());
          }
        }
        autoChanged = true;
      } else if (splitDimension.canBucketByDefault() && split.sortAction.refName() !== splitDimension.name) {
        split = split.changeSortExpression(new SortExpression({
          expression: $(splitDimension.name),
          direction: split.sortAction.direction
        }));
        autoChanged = true;
      }

      if (splitDimension.kind === "number") {
        continuousBoost = 4;
      }

      // ToDo: review this
      if (!split.limitAction && (autoChanged || splitDimension.kind !== "time")) {
        split = split.changeLimit(25);
        autoChanged = true;
      }

      if (colors) {
        colors = null;
        autoChanged = true;
      }

      return split;
    });

    if (autoChanged) {
      return Resolve.automatic(5 + continuousBoost, { splits });
    }

    return Resolve.ready(isSelectedVisualization ? 10 : (7 + continuousBoost));
  })

  .otherwise(({ splits, dataCube }) => {
    const categoricalDimensions = dataCube.dimensions.filterDimensions(dimension => dimension.kind !== "time");

    return Resolve.manual(
      3,
      "The Bar Chart needs one or two splits",
      categoricalDimensions.slice(0, 2).map((dimension: Dimension) => {
        return {
          description: `Split on ${dimension.title} instead`,
          adjustment: {
            splits: Splits.fromSplitCombine(SplitCombine.fromExpression(dimension.expression))
          }
        };
      })
    );
  })
  .build();

export const BAR_CHART_MANIFEST = new Manifest(
  "bar-chart",
  "Bar Chart",
  rulesEvaluator
);
