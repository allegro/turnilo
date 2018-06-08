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

import { List } from "immutable";
import { $, SortExpression } from "plywood";
import { Colors, SplitCombine, Splits } from "../../models";
import { Manifest, Resolve } from "../../models/manifest/manifest";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(({ dataCube }) => !(dataCube.getDimensionsByKind("time").length || dataCube.getDimensionsByKind("number").length))
  .then(() => Resolve.NEVER)

  .when(Predicates.noSplits())
  .then(({ splits, dataCube }) => {
    const continuousDimensions = dataCube.getDimensionsByKind("time").concat(dataCube.getDimensionsByKind("number"));
    return Resolve.manual(3, "This visualization requires a continuous dimension split",
      continuousDimensions.map(continuousDimension => {
        return {
          description: `Add a split on ${continuousDimension.title}`,
          adjustment: {
            splits: Splits.fromSplitCombine(SplitCombine.fromExpression(continuousDimension.expression))
          }
        };
      })
    );
  })

  .when(Predicates.areExactSplitKinds("time"))
  .or(Predicates.areExactSplitKinds("number"))
  .then(({ splits, dataCube, colors, isSelectedVisualization }) => {
    let score = 4;

    let continuousSplit = splits.get(0);
    const continuousDimension = dataCube.getDimensionByExpression(continuousSplit.expression);
    const sortStrategy = continuousDimension.sortStrategy;

    let sortAction: SortExpression = null;
    if (sortStrategy && sortStrategy !== "self") {
      sortAction = new SortExpression({
        expression: $(sortStrategy),
        direction: SortExpression.ASCENDING
      });
    } else {
      sortAction = new SortExpression({
        expression: $(continuousDimension.name),
        direction: SortExpression.ASCENDING
      });
    }

    let autoChanged = false;

    // Fix time sort
    if (!sortAction.equals(continuousSplit.sortAction)) {
      continuousSplit = continuousSplit.changeSortExpression(sortAction);
      autoChanged = true;
    }

    // Fix time limit
    if (continuousSplit.limitAction && continuousDimension.kind === "time") {
      continuousSplit = continuousSplit.changeLimitExpression(null);
      autoChanged = true;
    }

    if (colors) {
      autoChanged = true;
    }

    if (continuousDimension.kind === "time") score += 3;

    if (!autoChanged) return Resolve.ready(isSelectedVisualization ? 10 : score);
    return Resolve.automatic(score, { splits: new Splits(List([continuousSplit])) });
  })

  .when(Predicates.areExactSplitKinds("time", "*"))
  .then(({ splits, dataCube, colors }) => {
    let timeSplit = splits.get(0);
    const timeDimension = timeSplit.getDimension(dataCube.dimensions);

    const sortAction: SortExpression = new SortExpression({
      expression: $(timeDimension.name),
      direction: SortExpression.ASCENDING
    });

    // Fix time sort
    if (!sortAction.equals(timeSplit.sortAction)) {
      timeSplit = timeSplit.changeSortExpression(sortAction);
    }

    // Fix time limit
    if (timeSplit.limitAction) {
      timeSplit = timeSplit.changeLimitExpression(null);
    }

    let colorSplit = splits.get(1);

    if (!colorSplit.sortAction) {
      colorSplit = colorSplit.changeSortExpression(dataCube.getDefaultSortExpression());
    }

    const colorSplitDimension = dataCube.getDimensionByExpression(colorSplit.expression);
    if (!colors || colors.dimension !== colorSplitDimension.name) {
      colors = Colors.fromLimit(colorSplitDimension.name, 5);
    }

    return Resolve.automatic(8, {
      splits: new Splits(List([colorSplit, timeSplit])),
      colors
    });
  })

  .when(Predicates.areExactSplitKinds("*", "time"))
  .or(Predicates.areExactSplitKinds("*", "number"))
  .then(({ splits, dataCube, colors }) => {
    let timeSplit = splits.get(1);
    const timeDimension = timeSplit.getDimension(dataCube.dimensions);

    let autoChanged = false;

    const sortAction: SortExpression = new SortExpression({
      expression: $(timeDimension.name),
      direction: SortExpression.ASCENDING
    });

    // Fix time sort
    if (!sortAction.equals(timeSplit.sortAction)) {
      timeSplit = timeSplit.changeSortExpression(sortAction);
      autoChanged = true;
    }

    // Fix time limit
    if (timeSplit.limitAction) {
      timeSplit = timeSplit.changeLimitExpression(null);
      autoChanged = true;
    }

    let colorSplit = splits.get(0);

    if (!colorSplit.sortAction) {
      colorSplit = colorSplit.changeSortExpression(dataCube.getDefaultSortExpression());
      autoChanged = true;
    }

    const colorSplitDimension = dataCube.getDimensionByExpression(colorSplit.expression);
    if (!colors || colors.dimension !== colorSplitDimension.name) {
      colors = Colors.fromLimit(colorSplitDimension.name, 5);
      autoChanged = true;
    }

    if (!autoChanged) return Resolve.ready(10);
    return Resolve.automatic(8, {
      splits: new Splits(List([colorSplit, timeSplit])),
      colors
    });
  })

  .when(Predicates.haveAtLeastSplitKinds("time"))
  .then(({ splits, dataCube }) => {
    let timeSplit = splits.toArray().filter(split => split.getDimension(dataCube.dimensions).kind === "time")[0];
    return Resolve.manual(3, "Too many splits on the line chart", [
      {
        description: "Remove all but the time split",
        adjustment: {
          splits: Splits.fromSplitCombine(timeSplit)
        }
      }
    ]);
  })

  .otherwise(({ splits, dataCube }) => {
    let continuousDimensions = dataCube.getDimensionsByKind("time").concat(dataCube.getDimensionsByKind("number"));
    return Resolve.manual(3, "The Line Chart needs one continuous dimension split",
      continuousDimensions.map(continuousDimension => {
        return {
          description: `Split on ${continuousDimension.title} instead`,
          adjustment: {
            splits: Splits.fromSplitCombine(SplitCombine.fromExpression(continuousDimension.expression))
          }
        };
      })
    );
  })
  .build();

export const LINE_CHART_MANIFEST = new Manifest(
  "line-chart",
  "Line Chart",
  rulesEvaluator
);
