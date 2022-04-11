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
import { Dimension } from "../../models/dimension/dimension";
import { allDimensions, findDimensionByName } from "../../models/dimension/dimensions";
import { Split, SplitType } from "../../models/split/split";
import { Splits } from "../../models/splits/splits";
import {
  NORMAL_PRIORITY_ACTION,
  Resolve,
  VisualizationManifest
} from "../../models/visualization-manifest/visualization-manifest";
import { emptySettingsConfig } from "../../models/visualization-settings/empty-settings-config";
import { thread } from "../../utils/functional/functional";
import { Actions } from "../../utils/rules/actions";
import { Predicates } from "../../utils/rules/predicates";
import { adjustColorSplit, adjustContinuousTimeSplit, adjustFiniteLimit, adjustSort } from "../../utils/rules/split-adjustments";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The Bar Chart requires at least one split"))

  .when(Predicates.areExactSplitKinds("time"))
  .then(({ splits, isSelectedVisualization }) => {
    const timeSplit = splits.getSplit(0);
    const newTimeSplit = adjustContinuousTimeSplit(timeSplit);
    if (timeSplit.equals(newTimeSplit)) return Resolve.ready(isSelectedVisualization ? 10 : 3);
    return Resolve.automatic(6, {
      splits: new Splits({
        splits: List([newTimeSplit])
      })
    });
  })

  .when(Predicates.areExactSplitKinds("time", "*"))
  .then(({ splits, series, dataCube }) => {
    const timeSplit = splits.getSplit(0);
    const nominalSplit = splits.getSplit(1);
    const nominalDimension = findDimensionByName(dataCube.dimensions, nominalSplit.reference);

    return Resolve.automatic(6, {
      // Switch splits in place and conform
      splits: new Splits({
        splits: List([
          adjustColorSplit(nominalSplit, nominalDimension, series),
          adjustContinuousTimeSplit(timeSplit)
        ])
      })
    });
  })
  .when(Predicates.areExactSplitKinds("*", "time"))
  .then(({ splits, series, dataCube, isSelectedVisualization }) => {
    const timeSplit = splits.getSplit(1);
    const nominalSplit = splits.getSplit(0);
    const nominalDimension = findDimensionByName(dataCube.dimensions, nominalSplit.reference);

    const newSplits = new Splits({
      splits: List([
        adjustColorSplit(nominalSplit, nominalDimension, series),
        adjustContinuousTimeSplit(timeSplit)
      ])
    });

    const changed = !splits.equals(newSplits);
    if (!changed) return Resolve.ready(isSelectedVisualization ? 10 : 3);
    return Resolve.automatic(6, {
      splits: newSplits
    });

  })

  .when(Predicates.areExactSplitKinds("*"))
  .or(Predicates.areExactSplitKinds("*", "*"))
  .then(({ splits, series, dataCube, isSelectedVisualization }) => {
    const hasNumberSplits = splits.splits.some(split => split.type === SplitType.number);
    const continuousBoost = hasNumberSplits ? 4 : 0;

    const newSplits = splits.update("splits", splits => splits.map((split: Split) => {
      const splitDimension = findDimensionByName(dataCube.dimensions, split.reference);
      return thread(
        split,
        adjustFiniteLimit(splitDimension.limits),
        adjustSort(splitDimension, series)
      );
    }));

    const changed = !splits.equals(newSplits);
    if (changed) {
      return Resolve.automatic(5 + continuousBoost, { splits: newSplits });
    }

    return Resolve.ready(isSelectedVisualization ? 10 : 6 + continuousBoost);
  })

  .otherwise(({ dataCube }) => {
    const categoricalDimensions = allDimensions(dataCube.dimensions).filter(dimension => dimension.kind !== "time");

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
