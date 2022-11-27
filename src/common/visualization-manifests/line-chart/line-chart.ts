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
import { getDimensionsByKind } from "../../models/data-cube/data-cube";
import { Dimension } from "../../models/dimension/dimension";
import { findDimensionByName } from "../../models/dimension/dimensions";
import { DimensionSort, SortDirection } from "../../models/sort/sort";
import { Split } from "../../models/split/split";
import { Splits } from "../../models/splits/splits";
import {
  NORMAL_PRIORITY_ACTION,
  Resolve,
  VisualizationManifest
} from "../../models/visualization-manifest/visualization-manifest";
import { thread } from "../../utils/functional/functional";
import { Predicates } from "../../utils/rules/predicates";
import { adjustColorSplit, adjustContinuousTimeSplit, adjustFiniteLimit } from "../../utils/rules/split-adjustments";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";
import { settings } from "./settings";

function fixNumberSplit(split: Split, dimension: Dimension): Split {
  return thread(
    split.changeSort(new DimensionSort({
      reference: split.reference,
      direction: SortDirection.ascending
    })),
    adjustFiniteLimit(dimension.limits)
  );
}

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(({ dataCube }) => !(getDimensionsByKind(dataCube, "time").length || getDimensionsByKind(dataCube, "number").length))
  .then(() => Resolve.NEVER)

  .when(Predicates.noSplits())
  .then(({ dataCube }) => {
    const continuousDimensions = getDimensionsByKind(dataCube, "time").concat(getDimensionsByKind(dataCube, "number"));
    return Resolve.manual(NORMAL_PRIORITY_ACTION, "This visualization requires a continuous dimension split",
      continuousDimensions.map(continuousDimension => {
        return {
          description: `Add a split on ${continuousDimension.title}`,
          adjustment: {
            splits: Splits.fromSplit(Split.fromDimension(continuousDimension))
          }
        };
      })
    );
  })

  .when(Predicates.areExactSplitKinds("time"))
  .then(({ splits, isSelectedVisualization }) => {
    const timeSplit = splits.getSplit(0);
    const newTimeSplit = adjustContinuousTimeSplit(timeSplit);
    if (timeSplit.equals(newTimeSplit)) return Resolve.ready(isSelectedVisualization ? 10 : 7);
    return Resolve.automatic(7, { splits: new Splits({ splits: List([newTimeSplit]) }) });
  })
  .when(Predicates.areExactSplitKinds("number"))
  .then(({ splits, dataCube, isSelectedVisualization }) => {
    const numberSplit = splits.getSplit(0);
    const dimension = findDimensionByName(dataCube.dimensions, numberSplit.reference);

    const newContinuousSplit = fixNumberSplit(numberSplit, dimension);

    if (newContinuousSplit.equals(numberSplit)) return Resolve.ready(isSelectedVisualization ? 10 : 4);
    return Resolve.automatic(4, { splits: new Splits({ splits: List([numberSplit]) }) });
  })

  .when(Predicates.areExactSplitKinds("time", "*"))
  .then(({ splits, series, dataCube }) => {
    const timeSplit = splits.getSplit(0);

    const newTimeSplit = timeSplit
      .changeSort(new DimensionSort({ reference: timeSplit.reference, direction: SortDirection.ascending }))
      .changeLimit(null);

    const colorSplit = splits.getSplit(1);
    const colorDimension = findDimensionByName(dataCube.dimensions, colorSplit.reference);

    const newColorSplit = adjustColorSplit(colorSplit, colorDimension, series);

    return Resolve.automatic(8, {
      splits: new Splits({ splits: List([newColorSplit, newTimeSplit]) })
    });
  })

  .when(Predicates.areExactSplitKinds("*", "time"))
  .then(({ splits, series, dataCube }) => {
    const timeSplit = splits.getSplit(1);
    const newTimeSplit = adjustContinuousTimeSplit(timeSplit);

    const colorSplit = splits.getSplit(0);
    const colorDimension = findDimensionByName(dataCube.dimensions, colorSplit.reference);
    const newColorSplit = adjustColorSplit(colorSplit, colorDimension, series);

    const newSplits = new Splits({ splits: List([newColorSplit, newTimeSplit]) });
    if (newSplits.equals(splits)) return Resolve.ready(10);
    return Resolve.automatic(8, { splits: newSplits });
  })
  .when(Predicates.areExactSplitKinds("*", "number"))
  .then(({ splits, dataCube, series }) => {
    const numberSplit = splits.getSplit(1);
    const numberDimension = findDimensionByName(dataCube.dimensions, numberSplit.reference);

    const newNumberSplit = fixNumberSplit(numberSplit, numberDimension);

    const colorSplit = splits.getSplit(0);
    const colorDimension = findDimensionByName(dataCube.dimensions, colorSplit.reference);
    const newColorSplit = adjustColorSplit(colorSplit, colorDimension, series);

    const newSplits = new Splits({ splits: List([newColorSplit, newNumberSplit]) });
    if (newSplits.equals(splits)) return Resolve.ready(10);
    return Resolve.automatic(8, { splits: newSplits });
  })

  .when(Predicates.haveAtLeastSplitKinds("time"))
  .then(({ splits, dataCube }) => {
    const timeSplit = splits.splits.find(split => findDimensionByName(dataCube.dimensions, split.reference).kind === "time");
    return Resolve.manual(NORMAL_PRIORITY_ACTION, "Too many splits on the line chart", [
      {
        description: "Remove all but the time split",
        adjustment: {
          splits: Splits.fromSplit(timeSplit)
        }
      }
    ]);
  })

  .otherwise(({ dataCube }) => {
    const continuousDimensions = getDimensionsByKind(dataCube, "time").concat(getDimensionsByKind(dataCube, "number"));
    return Resolve.manual(NORMAL_PRIORITY_ACTION, "The Line Chart needs one continuous dimension split",
      continuousDimensions.map(continuousDimension => {
        return {
          description: `Split on ${continuousDimension.title} instead`,
          adjustment: {
            splits: Splits.fromSplit(Split.fromDimension(continuousDimension))
          }
        };
      })
    );
  })
  .build();

export const LINE_CHART_MANIFEST = new VisualizationManifest(
  "line-chart",
  "Line Chart",
  rulesEvaluator,
  settings
);
