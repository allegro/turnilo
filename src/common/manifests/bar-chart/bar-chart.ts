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

import { $, SortAction } from 'plywood';
import { Splits, DataCube, SplitCombine, Colors, Dimension } from '../../models/index';
import { Manifest, Resolve } from '../../models/manifest/manifest';
import { CircumstancesHandler } from '../../utils/circumstances-handler/circumstances-handler';

var handler = CircumstancesHandler.EMPTY()
  .needsAtLeastOneSplit('The Bar Chart requires at least one split')

  .when(CircumstancesHandler.areExactSplitKinds('*'))
  .or(CircumstancesHandler.areExactSplitKinds('*', '*'))
  .then((splits: Splits, dataCube: DataCube, colors: Colors, current: boolean) => {
    var continuousBoost = 0;

    // Auto adjustment
    var autoChanged = false;

    splits = splits.map((split: SplitCombine) => {
      var splitDimension = dataCube.getDimensionByExpression(split.expression);
      var sortStrategy = splitDimension.sortStrategy;
      if (!split.sortAction) {
        if (sortStrategy) {
          if (sortStrategy === 'self') {
            split = split.changeSortAction(new SortAction({
              expression: $(splitDimension.name),
              direction: SortAction.DESCENDING
            }));
          } else {
            split = split.changeSortAction(new SortAction({
              expression: $(sortStrategy),
              direction: SortAction.DESCENDING
            }));
          }
        } else if (splitDimension.kind === 'boolean') {  // Must sort boolean in deciding order!
          split = split.changeSortAction(new SortAction({
            expression: $(splitDimension.name),
            direction: SortAction.DESCENDING
          }));
        } else {
          if (splitDimension.isContinuous()) {
            split = split.changeSortAction(new SortAction({
              expression: $(splitDimension.name),
              direction: SortAction.ASCENDING
            }));
          } else {
            split = split.changeSortAction(dataCube.getDefaultSortAction());
          }
        }
        autoChanged = true;
      } else if (splitDimension.canBucketByDefault() && split.sortAction.refName() !== splitDimension.name) {
        split = split.changeSortAction(new SortAction({
          expression: $(splitDimension.name),
          direction: split.sortAction.direction
        }));
        autoChanged = true;
      }

      if (splitDimension.kind === 'number') {
        continuousBoost = 4;
      }

      // ToDo: review this
      if (!split.limitAction && (autoChanged || splitDimension.kind !== 'time')) {
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

    return Resolve.ready(current ? 10 : (7 + continuousBoost));
  })

  .otherwise(
    (splits: Splits, dataCube: DataCube) => {
      let categoricalDimensions = dataCube.dimensions.filter((d) => d.kind !== 'time');

      return Resolve.manual(
        3,
        'The Bar Chart needs one or two splits',
        categoricalDimensions.toArray().slice(0, 2).map((dimension: Dimension) => {
          return {
            description: `Split on ${dimension.title} instead`,
            adjustment: {
              splits: Splits.fromSplitCombine(SplitCombine.fromExpression(dimension.expression))
            }
          };
        })
      );
    }
  );


export const BAR_CHART_MANIFEST = new Manifest(
  'bar-chart',
  'Bar Chart',
  handler.evaluate.bind(handler)
);
