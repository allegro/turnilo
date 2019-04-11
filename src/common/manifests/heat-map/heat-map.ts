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

import { Manifest, Resolve } from "../../models/manifest/manifest";
import { DimensionSort, isSortEmpty, SeriesSort, SortDirection } from "../../models/sort/sort";
import { SplitType } from "../../models/split/split";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.numberOfSplitsIs(2))
  .then(({ splits, dataCube, series }) => {
    let autoChanged = false;
    const newSplits = splits.update("splits", splits => splits.map((split, i) => {
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
        } else {
          if (split.type === SplitType.string) {
            split = split.changeSort(new SeriesSort({
              reference: series.series.first().reference,
              direction: SortDirection.descending
            }));
          } else {
            split = split.changeSort(new DimensionSort({
              reference: splitDimension.name,
              direction: SortDirection.descending
            }));
          }
          autoChanged = true;
        }
      }

      if (!split.limit && splitDimension.kind !== "time") {
        split = split.changeLimit(25);
        autoChanged = true;
      }

      return split;
    }));

    return autoChanged ? Resolve.automatic(10, { splits: newSplits }) : Resolve.ready(10);
  })
  .otherwise(() => Resolve.manual(3, "This visualization needs exactly 2 splits", []))
  .build();

export const HEAT_MAP_MANIFEST = new Manifest(
  "heatmap",
  "Heatmap",
  rulesEvaluator,
  "single"
);
