import { $, SortAction } from 'plywood';
import { Splits, DataSource, SplitCombine, Colors, Dimension } from '../../models/index';
import { CircumstancesHandler } from '../../utils/circumstances-handler/circumstances-handler';
import { Manifest, Resolve } from '../../models/manifest/manifest';

var handler = CircumstancesHandler.EMPTY()
  .needsAtLeastOneSplit('The Table requires at least one split')
  .otherwise(
    (splits: Splits, dataSource: DataSource, colors: Colors, current: boolean) => {
      var autoChanged = false;
      splits = splits.map((split, i) => {
        if (!split.sortAction) {
          split = split.changeSortAction(dataSource.getDefaultSortAction());
          autoChanged = true;
        }

        var splitDimension = splits.get(0).getDimension(dataSource.dimensions);

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
