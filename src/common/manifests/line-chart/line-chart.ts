/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { List } from 'immutable';
import { $, SortAction } from 'plywood';
import { Splits, DataSource, SplitCombine, Colors, Dimension } from '../../models/index';
import { CircumstancesHandler } from '../../utils/circumstances-handler/circumstances-handler';
import { Manifest, Resolve } from '../../models/manifest/manifest';

var handler = CircumstancesHandler.EMPTY()

  .when((splits: Splits, dataSource: DataSource) => !(dataSource.getDimensionByKind('time') || dataSource.getDimensionByKind('number')))
  .then(() => Resolve.NEVER)

  .when(CircumstancesHandler.noSplits())
  .then((splits: Splits, dataSource: DataSource) => {
    let continuousDimensions = dataSource.getDimensionByKind('time').concat(dataSource.getDimensionByKind('number'));
    return Resolve.manual(3, 'This visualization requires a continuous dimension split',
      continuousDimensions.toArray().map((continuousDimension) => {
        return {
          description: `Add a split on ${continuousDimension.title}`,
          adjustment: {
            splits: Splits.fromSplitCombine(SplitCombine.fromExpression(continuousDimension.expression))
          }
        };
      })
    );
  })

  .when(CircumstancesHandler.areExactSplitKinds('time'))
  .or(CircumstancesHandler.areExactSplitKinds('number'))
  .then((splits: Splits, dataSource: DataSource, colors: Colors, current: boolean) => {
    var score = 4;

    var continuousSplit = splits.get(0);
    var continuousDimension = dataSource.getDimensionByExpression(continuousSplit.expression);

    var sortAction: SortAction = new SortAction({
      expression: $(continuousDimension.name),
      direction: SortAction.ASCENDING
    });

    let autoChanged = false;

    // Fix time sort
    if (!sortAction.equals(continuousSplit.sortAction)) {
      continuousSplit = continuousSplit.changeSortAction(sortAction);
      autoChanged = true;
    }

    // Fix time limit
    if (continuousSplit.limitAction && continuousDimension.kind === 'time') {
      continuousSplit = continuousSplit.changeLimitAction(null);
      autoChanged = true;
    }

    if (colors) {
      autoChanged = true;
    }

    if (continuousDimension.kind === 'time') score += 3;

    if (!autoChanged) return Resolve.ready(current ? 10 : score);
    return Resolve.automatic(score, {splits: new Splits(List([continuousSplit]))});
  })

  .when(CircumstancesHandler.areExactSplitKinds('time', '*'))
  .then((splits: Splits, dataSource: DataSource, colors: Colors) => {
    var timeSplit = splits.get(0);
    var timeDimension = timeSplit.getDimension(dataSource.dimensions);

    var sortAction: SortAction = new SortAction({
      expression: $(timeDimension.name),
      direction: SortAction.ASCENDING
    });

    // Fix time sort
    if (!sortAction.equals(timeSplit.sortAction)) {
      timeSplit = timeSplit.changeSortAction(sortAction);
    }

    // Fix time limit
    if (timeSplit.limitAction) {
      timeSplit = timeSplit.changeLimitAction(null);
    }

    let colorSplit = splits.get(1);

    if (!colorSplit.sortAction) {
      colorSplit = colorSplit.changeSortAction(dataSource.getDefaultSortAction());
    }

    var colorSplitDimension = dataSource.getDimensionByExpression(colorSplit.expression);
    if (!colors || colors.dimension !== colorSplitDimension.name) {
      colors = Colors.fromLimit(colorSplitDimension.name, 5);
    }

    return Resolve.automatic(8, {
      splits: new Splits(List([colorSplit, timeSplit])),
      colors
    });
  })

  .when(CircumstancesHandler.areExactSplitKinds('*', 'time'))
  .or(CircumstancesHandler.areExactSplitKinds('*', 'number'))
  .then((splits: Splits, dataSource: DataSource, colors: Colors) => {
    var timeSplit = splits.get(1);
    var timeDimension = timeSplit.getDimension(dataSource.dimensions);

    let autoChanged = false;

    var sortAction: SortAction = new SortAction({
      expression: $(timeDimension.name),
      direction: SortAction.ASCENDING
    });

    // Fix time sort
    if (!sortAction.equals(timeSplit.sortAction)) {
      timeSplit = timeSplit.changeSortAction(sortAction);
      autoChanged = true;
    }

    // Fix time limit
    if (timeSplit.limitAction) {
      timeSplit = timeSplit.changeLimitAction(null);
      autoChanged = true;
    }

    let colorSplit = splits.get(0);

    if (!colorSplit.sortAction) {
      colorSplit = colorSplit.changeSortAction(dataSource.getDefaultSortAction());
      autoChanged = true;
    }

    var colorSplitDimension = dataSource.getDimensionByExpression(colorSplit.expression);
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

  .when(CircumstancesHandler.haveAtLeastSplitKinds('time'))
  .then((splits: Splits, dataSource: DataSource) => {
    let timeSplit = splits.toArray().filter((split) => split.getDimension(dataSource.dimensions).kind === 'time')[0];
    return Resolve.manual(3, 'Too many splits', [
      {
        description: `Remove all but the time split`,
        adjustment: {
          splits: Splits.fromSplitCombine(timeSplit)
        }
      }
    ]);
  })

  .otherwise(
    (splits: Splits, dataSource: DataSource) => {
      let continuousDimensions = dataSource.getDimensionByKind('time').concat(dataSource.getDimensionByKind('number'));
      return Resolve.manual(3, 'The Line Chart needs one continuous dimension split',
        continuousDimensions.toArray().map((continuousDimension) => {
          return {
            description: `Split on ${continuousDimension.title} instead`,
            adjustment: {
              splits: Splits.fromSplitCombine(SplitCombine.fromExpression(continuousDimension.expression))
            }
          };
        })
      );
    }
  );


export const LINE_CHART_MANIFEST = new Manifest(
  'line-chart',
  'Line Chart',
  handler.evaluate.bind(handler)
);
