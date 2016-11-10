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
import { CircumstancesHandler } from '../../utils/circumstances-handler/circumstances-handler';
import { Manifest, Resolve } from '../../models/manifest/manifest';

var handler = CircumstancesHandler.EMPTY()
  .needsAtLeastOneSplit('The Table requires at least one split')
  .otherwise(
    (splits: Splits, dataCube: DataCube, colors: Colors, current: boolean) => {
      var autoChanged = false;
      splits = splits.map((split, i) => {
        var splitDimension = splits.get(0).getDimension(dataCube.dimensions);
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
          } else {
            split = split.changeSortAction(dataCube.getDefaultSortAction());
            autoChanged = true;
          }
        }


        // ToDo: review this
        if (!split.limitAction && (autoChanged || splitDimension.kind !== 'time')) {
          split = split.changeLimit(i ? 5 : 50);
          autoChanged = true;
        }

        return split;
      });

      if (colors) {
        colors = null;
        autoChanged = true;
      }

      return autoChanged ? Resolve.automatic(6, { splits }) : Resolve.ready(current ? 10 : 8);
    }
  );


export const TABLE_MANIFEST = new Manifest(
  'table',
  'Table',
  handler.evaluate.bind(handler)
);
