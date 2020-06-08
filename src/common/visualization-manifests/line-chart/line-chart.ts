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
import { DimensionSort, Sort, SortDirection } from "../../models/sort/sort";
import { Split } from "../../models/split/split";
import { Splits } from "../../models/splits/splits";
import { NORMAL_PRIORITY_ACTION, Resolve, VisualizationManifest } from "../../models/visualization-manifest/visualization-manifest";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";
import { settings } from "./settings";

const COLORS_COUNT = NORMAL_COLORS.length;

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(({ dataCube }) => !(dataCube.getDimensionsByKind("time").length || dataCube.getDimensionsByKind("number").length))
  .then(() => Resolve.NEVER)

  .when(Predicates.noSplits())
  .then(({ dataCube }) => {
    const continuousDimensions = dataCube.getDimensionsByKind("time").concat(dataCube.getDimensionsByKind("number"));
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
  .or(Predicates.areExactSplitKinds("number"))
  .then(({ splits, dataCube, isSelectedVisualization }) => {
    let score = 4;

    let continuousSplit = splits.getSplit(0);
    const continuousDimension = dataCube.getDimension(continuousSplit.reference);
    const sortStrategy = continuousDimension.sortStrategy;

    let sort: Sort = null;
    if (sortStrategy && sortStrategy !== "self") {
      sort = new DimensionSort({
        reference: sortStrategy,
        direction: SortDirection.ascending
      });
    } else {
      sort = new DimensionSort({
        reference: continuousDimension.name,
        direction: SortDirection.ascending
      });
    }

    let autoChanged = false;

    // Fix time sort
    if (!sort.equals(continuousSplit.sort)) {
      continuousSplit = continuousSplit.changeSort(sort);
      autoChanged = true;
    }

    // Fix time limit
    if (continuousSplit.limit && continuousDimension.kind === "time") {
      continuousSplit = continuousSplit.changeLimit(null);
      autoChanged = true;
    }

    if (continuousDimension.kind === "time") score += 3;

    if (!autoChanged) return Resolve.ready(isSelectedVisualization ? 10 : score);
    return Resolve.automatic(score, { splits: new Splits({ splits: List([continuousSplit]) }) });
  })

  .when(Predicates.areExactSplitKinds("time", "*"))
  .then(({ splits, dataCube }) => {
    let timeSplit = splits.getSplit(0);
    const timeDimension = dataCube.getDimension(timeSplit.reference);

    const sort: Sort = new DimensionSort({
      reference: timeDimension.name,
      direction: SortDirection.ascending
    });

    // Fix time sort
    if (!sort.equals(timeSplit.sort)) {
      timeSplit = timeSplit.changeSort(sort);
    }

    // Fix time limit
    if (timeSplit.limit) {
      timeSplit = timeSplit.changeLimit(null);
    }

    const colorSplit = splits.getSplit(1).update("limit", limit => clamp(limit, AVAILABLE_LIMITS[0], COLORS_COUNT));

    return Resolve.automatic(8, {
      splits: new Splits({ splits: List([colorSplit, timeSplit]) })
    });
  })

  .when(Predicates.areExactSplitKinds("*", "time"))
  .or(Predicates.areExactSplitKinds("*", "number"))
  .then(({ splits, dataCube }) => {
    let timeSplit = splits.getSplit(1);
    const timeDimension = dataCube.getDimension(timeSplit.reference);

    let autoChanged = false;

    const sort: Sort = new DimensionSort({
      reference: timeDimension.name,
      direction: SortDirection.ascending
    });

    // Fix time sort
    if (!sort.equals(timeSplit.sort)) {
      timeSplit = timeSplit.changeSort(sort);
      autoChanged = true;
    }

    // Fix time limit
    if (timeSplit.limit) {
      timeSplit = timeSplit.changeLimit(null);
      autoChanged = true;
    }

    const colorSplit = splits.getSplit(0).update("limit", limit => {
      if (limit === null || limit > COLORS_COUNT) {
        autoChanged = true;
        return COLORS_COUNT;
      }
      return limit;
    });

    if (!autoChanged) return Resolve.ready(10);
    return Resolve.automatic(8, {
      splits: new Splits({ splits: List([colorSplit, timeSplit]) })
    });
  })

  .when(Predicates.haveAtLeastSplitKinds("time"))
  .then(({ splits, dataCube }) => {
    let timeSplit = splits.splits.find(split => dataCube.getDimension(split.reference).kind === "time");
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
    let continuousDimensions = dataCube.getDimensionsByKind("time").concat(dataCube.getDimensionsByKind("number"));
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
