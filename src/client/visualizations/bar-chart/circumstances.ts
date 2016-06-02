import { $, SortAction } from 'plywood';
import { List } from 'immutable';
import { Splits, DataSource, Resolve, SplitCombine, Colors, Dimension } from '../../../common/models/index';
import { CircumstancesHandler } from '../../../common/utils/circumstances-handler/circumstances-handler';

export default CircumstancesHandler.EMPTY()
  .needsAtLeastOneSplit('The Bar Chart requires at least one split')

  .when(CircumstancesHandler.areExactSplitKinds('*'))
  .or(CircumstancesHandler.areExactSplitKinds('*', '*'))
  .then((splits: Splits, dataSource: DataSource, colors: Colors, current: boolean) => {
    var booleanBoost = 0;

    // Auto adjustment
    var autoChanged = false;

    splits = splits.map((split: SplitCombine) => {
      var splitDimension = dataSource.getDimensionByExpression(split.expression);

      if (!split.sortAction) {
        // Must sort boolean in deciding order!
        if (splitDimension.kind === 'boolean') {
          split = split.changeSortAction(new SortAction({
            expression: $(splitDimension.name),
            direction: SortAction.DESCENDING
          }));
        } else {
          split = split.changeSortAction(dataSource.getDefaultSortAction());
        }
        autoChanged = true;
      } else if (splitDimension.isContinuous() && split.sortAction.refName() !== splitDimension.name) {
        split = split.changeSortAction(new SortAction({
          expression: $(splitDimension.name),
          direction: split.sortAction.direction
        }));
        autoChanged = true;
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
      return Resolve.automatic(5 + booleanBoost, { splits });
    }

    return Resolve.ready(current ? 10 : (7 + booleanBoost));
  })

  .otherwise(
    (splits: Splits, dataSource: DataSource) => {
      let categoricalDimensions = dataSource.dimensions.filter((d) => d.kind !== 'time');

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
