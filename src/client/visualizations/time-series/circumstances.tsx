import { $, SortAction } from 'plywood';
import { List } from 'immutable';
import { Splits, DataSource, Resolve, SplitCombine, Colors } from '../../../common/models/index';
import { CircumstancesHandler } from '../../../common/utils/circumstances-handler/circumstances-handler';

export default CircumstancesHandler.EMPTY()
  .when(
    (splits: Splits, dataSource: DataSource) => !dataSource.getDimensionByKind('time'),
    () => Resolve.NEVER
  ).when(
    CircumstancesHandler.noSplits(),
    (splits: Splits, dataSource: DataSource) => {
      let timeDimensions = dataSource.getDimensionByKind('time');
      return Resolve.manual(3, 'This visualization requires a time split',
        timeDimensions.toArray().map((timeDimension) => {
          return {
            description: `Add a split on ${timeDimension.title}`,
            adjustment: {
              splits: Splits.fromSplitCombine(SplitCombine.fromExpression(timeDimension.expression))
            }
          };
        })
      );
    }
  ).when(
    CircumstancesHandler.areExactSplitKinds('time'),
    (splits: Splits, dataSource: DataSource, colors: Colors) => {
      var timeSplit = splits.get(0);
      var timeDimension = timeSplit.getDimension(dataSource.dimensions);

      var sortAction: SortAction = new SortAction({
        expression: $(timeDimension.name),
        direction: SortAction.ASCENDING
      });

      let autoChanged = false;

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

      if (colors) {
        autoChanged = true;
      }

      if (!autoChanged) return Resolve.ready(10);
      return Resolve.automatic(8, {splits: new Splits(List([timeSplit]))});
    }
  ).when(
    CircumstancesHandler.areExactSplitKinds('time', '*'),
    (splits: Splits, dataSource: DataSource, colors: Colors) => {
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
    }
  ).when(
    CircumstancesHandler.areExactSplitKinds('*', 'time'),
    (splits: Splits, dataSource: DataSource, colors: Colors) => {
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
    }
  ).when(
    CircumstancesHandler.haveAtLeastSplitKinds('time'),
    (splits: Splits, dataSource: DataSource) => {
      let timeSplit = splits.toArray().filter((split) => split.getDimension(dataSource.dimensions).kind === 'time')[0];
      return Resolve.manual(3, 'Too many splits', [
        {
          description: `Remove all but the time split`,
          adjustment: {
            splits: Splits.fromSplitCombine(timeSplit)
          }
        }
      ]);
    }
  ).otherwise(
    (splits: Splits, dataSource: DataSource) => {
      let timeDimensions = dataSource.getDimensionByKind('time');
      return Resolve.manual(3, 'Too many splits',
        timeDimensions.toArray().map((timeDimension) => {
          return {
            description: `Split on ${timeDimension.title} instead`,
            adjustment: {
              splits: Splits.fromSplitCombine(SplitCombine.fromExpression(timeDimension.expression))
            }
          };
        })
      );
    }
  );
