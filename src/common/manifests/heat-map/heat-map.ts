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
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";
import { Sort, SortDirection, SortReferenceType } from "../../models/sort/sort";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.numberOfSplitsIs(2))
  .then(({ splits, dataCube }) => {
    let autoChanged = false;
    const newSplits = splits.update("splits", splits => splits.map((split, i) => {
      const splitDimension = dataCube.getDimension(split.reference);
      const sortStrategy = splitDimension.sortStrategy;

      if (split.sort.empty()) {
        if (sortStrategy) {
          if (sortStrategy === "self") {
            split = split.changeSort(new Sort({
              reference: splitDimension.name,
              direction: SortDirection.descending,
              type: SortReferenceType.DIMENSION
            }));
          } else {
            const type = split.reference === sortStrategy ? SortReferenceType.DIMENSION : SortReferenceType.MEASURE;
            split = split.changeSort(new Sort({
              reference: sortStrategy,
              direction: SortDirection.descending,
              type
            }));
          }
        } else if (splitDimension.kind === "boolean") {  // Must sort boolean in deciding order!
          split = split.changeSort(new Sort({
            reference: splitDimension.name,
            direction: SortDirection.descending,
            type: SortReferenceType.DIMENSION
          }));
        } else {
          if (splitDimension.isContinuous()) {
            split = split.changeSort(new Sort({
              reference: splitDimension.name,
              direction: SortDirection.ascending,
              type: SortReferenceType.DIMENSION
            }));
          } else {
            split = split.changeSort(dataCube.getDefaultSortExpression());
          }
        }
        autoChanged = true;
      } else if (splitDimension.canBucketByDefault() && split.sort.reference !== splitDimension.name) {
        split = split.changeSort(new Sort({
          reference: splitDimension.name,
          direction: split.sort.direction,
          type: SortReferenceType.DIMENSION
        }));
        autoChanged = true;
      }

      // ToDo: review this
      if (!split.limit && splitDimension.kind !== "time") {
        split = split.changeLimit(50);
        autoChanged = true;
      }

      return split;
    }));

    return autoChanged ? Resolve.automatic(10, { splits: newSplits }) : Resolve.ready(10);
  })
  .otherwise(() => Resolve.manual(3, "This visualization needs exactly 2 splits", []))
  .build();

export const HEAT_MAP_MANIFEST = new Manifest(
  "heat-map",
  "Heatmap",
  rulesEvaluator,
  "multi"
);
