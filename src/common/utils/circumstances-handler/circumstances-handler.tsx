import { r, $, ply, Executor, Expression, Dataset, Datum, TimeRange, TimeRangeJS, TimeBucketAction, SortAction } from 'plywood';
import { Dimension, Essence, Splits, SplitCombine, Filter, FilterClause, Measure, DataSource, Resolve, Resolution, Colors } from '../../models/index';

export type Configuration = (splits: Splits, dataSource?: DataSource) => boolean;
export type Action = (splits?: Splits, dataSource?: DataSource, colors?: Colors, current?: boolean) => Resolve;

export class CircumstancesHandler {
  public static noSplits() {
    return (splits: Splits) => splits.length() === 0;
  }

  public static areExactSplitKinds = (...kinds: string[]) => {
    return (splits: Splits, dataSource: DataSource): boolean => {
      if (kinds.length !== splits.length()) {
        return false;
      }

      let getKind = (split: SplitCombine) => split.getDimension(dataSource.dimensions).kind;

      return kinds.every((kind, i) => kind === '*' || getKind(splits.get(i)) === kind);
    };
  }

  public static haveAtLeastSplitKinds = (...kinds: string[]) => {
    return (splits: Splits, dataSource: DataSource): boolean => {
      let getKind = (split: SplitCombine) => split.getDimension(dataSource.dimensions).kind;

      let actualKinds = splits.toArray().map(getKind);

      return kinds.every((kind) => actualKinds.indexOf(kind) > -1);
    };
  }

  public static EMPTY() {
    return new CircumstancesHandler();
  }

  private configurations: Configuration[];
  private actions: Action[];

  private otherwiseAction: Action;

  constructor() {
    this.configurations = [];
    this.actions = [];
  }

  public when(configuration: Configuration, action: Action): CircumstancesHandler {
    this.configurations.push(configuration);
    this.actions.push(action);

    return this;
  }

  public otherwise(action: Action): CircumstancesHandler {
    this.otherwiseAction = action;

    return this;
  }

  public needsAtLeastOneSplit(): CircumstancesHandler {
    return this.when(
      CircumstancesHandler.noSplits(),
      (splits: Splits, dataSource: DataSource) => {
        var someDimensions = dataSource.dimensions.toArray().filter(d => d.kind === 'string').slice(0, 2);
        return Resolve.manual(4, 'This visualization requires at least one split',
          someDimensions.map((someDimension) => {
            return {
              description: `Add a split on ${someDimension.title}`,
              adjustment: {
                splits: Splits.fromSplitCombine(SplitCombine.fromExpression(someDimension.expression))
              }
            };
          })
        );
      }
    );
  }

  public evaluate(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
    for (let i = 0; i < this.configurations.length; i++) {
      if (this.configurations[i](splits, dataSource)) {
        return this.actions[i](splits, dataSource, colors, current);
      }
    }

    return this.otherwiseAction(splits, dataSource, colors, current);
  }
}
