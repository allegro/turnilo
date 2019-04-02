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

import { Dimension } from "../../models/dimension/dimension";
import { Essence } from "../../models/essence/essence";
import { Manifest, NORMAL_PRIORITY_ACTION, Resolve } from "../../models/manifest/manifest";
import { DimensionSort, isSortEmpty, SeriesSort, SortDirection } from "../../models/sort/sort";
import { Split } from "../../models/split/split";
import { Splits } from "../../models/splits/splits";
import { Actions } from "../../utils/rules/actions";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The Bar Chart requires at least one split"))

  .when(Predicates.areExactSplitKinds("*"))
  .or(Predicates.areExactSplitKinds("*", "*"))
  .then(({ series, splits, dataCube, colors, isSelectedVisualization }) => {
    let continuousBoost = 0;

    // Auto adjustment
    let autoChanged = false;

    const newSplits = splits.update("splits", splits => splits.map((split: Split) => {
      const splitDimension = dataCube.getDimension(split.reference);
      const sortStrategy = splitDimension.sortStrategy;
      if (isSortEmpty(split.sort)) {
        if (sortStrategy) {
          if (sortStrategy === "self" || split.reference === sortStrategy) {
            split = split.changeSort(new DimensionSort({
              reference: splitDimension.name,
              direction: SortDirection.descending
            }));
          } else {
            split = split.changeSort(new SeriesSort({
              reference: sortStrategy,
              direction: SortDirection.descending
            }));
          }
        } else if (splitDimension.kind === "boolean") {  // Must sort boolean in deciding order!
          split = split.changeSort(new DimensionSort({
            reference: splitDimension.name,
            direction: SortDirection.descending
          }));
        } else {
          if (splitDimension.isContinuous()) {
            split = split.changeSort(new DimensionSort({
              reference: splitDimension.name,
              direction: SortDirection.ascending
            }));
          } else {
            split = split.changeSort(Essence.defaultSort(series, dataCube));
          }
        }
        autoChanged = true;
      } else if (splitDimension.canBucketByDefault() && split.sort.reference !== splitDimension.name) {
        split = split.changeSort(new DimensionSort({
          reference: splitDimension.name,
          direction: split.sort.direction
        }));
        autoChanged = true;
      }

      if (splitDimension.kind === "number") {
        continuousBoost = 4;
      }

      // ToDo: review this
      if (!split.limit && (autoChanged || splitDimension.kind !== "time")) {
        split = split.changeLimit(25);
        autoChanged = true;
      }

      if (colors) {
        colors = null;
        autoChanged = true;
      }

      return split;
    }));

    if (autoChanged) {
      return Resolve.automatic(5 + continuousBoost, { splits: newSplits });
    }

    return Resolve.ready(isSelectedVisualization ? 10 : (7 + continuousBoost));
  })

  .otherwise(({ splits, dataCube }) => {
    const categoricalDimensions = dataCube.dimensions.filterDimensions(dimension => dimension.kind !== "time");

    return Resolve.manual(
      NORMAL_PRIORITY_ACTION,
      "The Bar Chart needs one or two splits",
      categoricalDimensions.slice(0, 2).map((dimension: Dimension) => {
        return {
          description: `Split on ${dimension.title} instead`,
          adjustment: {
            splits: Splits.fromSplit(Split.fromDimension(dimension))
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
