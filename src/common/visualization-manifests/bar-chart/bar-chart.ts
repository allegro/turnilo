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

import { List } from "immutable";
import { clamp } from "../../../client/utils/dom/dom";
import { AVAILABLE_LIMITS } from "../../limit/limit";
import { NORMAL_COLORS } from "../../models/colors/colors";
import { Dimension } from "../../models/dimension/dimension";
import { DimensionSort, SortDirection } from "../../models/sort/sort";
import { Split } from "../../models/split/split";
import { Splits } from "../../models/splits/splits";
import { NORMAL_PRIORITY_ACTION, Resolve, VisualizationManifest } from "../../models/visualization-manifest/visualization-manifest";
import { emptySettingsConfig } from "../../models/visualization-settings/empty-settings-config";
import { Actions } from "../../utils/rules/actions";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";

function isNominalSplitValid(nominalSplit: Split): boolean {
  return nominalSplit.limit !== null && nominalSplit.limit <= NORMAL_COLORS.length;
}

function isTimeSplitValid(timeSplit: Split): boolean {
  const sortByTime = new DimensionSort({
    reference: timeSplit.reference,
    direction: SortDirection.ascending
  });

  const isTimeSortValid = timeSplit.sort.equals(sortByTime);
  const isTimeLimitValid = timeSplit.limit === null;

  return isTimeSortValid && isTimeLimitValid;
}

const clampNominalSplitLimit = (split: Split) => split
  .update("limit", limit =>
    clamp(limit, AVAILABLE_LIMITS[0], NORMAL_COLORS.length));

const fixTimeSplit = (split: Split) => {
  const { reference } = split;
  return split
    .changeLimit(null)
    .changeSort(new DimensionSort({
      reference,
      direction: SortDirection.ascending
    }));
};

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The Bar Chart requires at least one split"))

  .when(Predicates.areExactSplitKinds("time"))
  .then(({ splits, isSelectedVisualization }) => {
    const timeSplit = splits.getSplit(0);
    if (isTimeSplitValid(timeSplit)) return Resolve.ready(isSelectedVisualization ? 10 : 3);
    return Resolve.automatic(6, {
      splits: new Splits({
        splits: List([
          fixTimeSplit(timeSplit)
        ])
      })
    });
  })

  .when(Predicates.areExactSplitKinds("time", "*"))
  .then(({ splits }) => {
    const timeSplit = splits.getSplit(0);
    const nominalSplit = splits.getSplit(1);

    return Resolve.automatic(6, {
      // Switch splits in place and conform
      splits: new Splits({
        splits: List([
          clampNominalSplitLimit(nominalSplit),
          fixTimeSplit(timeSplit)
        ])
      })
    });
  })
  .when(Predicates.areExactSplitKinds("*", "time"))
  .then(({ splits, isSelectedVisualization }) => {
    const nominalSplit = splits.getSplit(0);
    const timeSplit = splits.getSplit(1);

    if (isTimeSplitValid(timeSplit) && isNominalSplitValid(nominalSplit)) return Resolve.ready(isSelectedVisualization ? 10 : 3);
    return Resolve.automatic(6, {
      splits: new Splits({
        splits: List([
          clampNominalSplitLimit(nominalSplit),
          fixTimeSplit(timeSplit)
        ])
      })
    });

  })

  .when(Predicates.areExactSplitKinds("*"))
  .or(Predicates.areExactSplitKinds("*", "*"))
  .then(({ splits, dataCube, isSelectedVisualization }) => {
    let continuousBoost = 0;

    // Auto adjustment
    let autoChanged = false;

    const newSplits = splits.update("splits", splits => splits.map((split: Split) => {
      const splitDimension = dataCube.getDimension(split.reference);
      if (splitDimension.canBucketByDefault() && split.sort.reference !== splitDimension.name) {
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

      return split;
    }));

    if (autoChanged) {
      return Resolve.automatic(5 + continuousBoost, { splits: newSplits });
    }

    return Resolve.ready(isSelectedVisualization ? 10 : (7 + continuousBoost));
  })

  .otherwise(({ dataCube }) => {
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

export const BAR_CHART_MANIFEST = new VisualizationManifest(
  "bar-chart",
  "Bar Chart",
  rulesEvaluator,
  emptySettingsConfig
);
