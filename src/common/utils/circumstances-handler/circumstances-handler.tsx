import { r, $, ply, Executor, Expression, Dataset, Datum, TimeRange, TimeRangeJS, TimeBucketAction, SortAction } from 'plywood';
import { Dimension, Essence, Splits, SplitCombine, Filter, FilterClause, Measure, DataSource, Resolve, Resolution, Colors } from '../../models/index';

export type Configuration = (splits: Splits, dataSource?: DataSource) => boolean;
export type Action = (splits?: Splits, dataSource?: DataSource, colors?: Colors, current?: boolean) => Resolve;

export class CircumstancesHandler {
  public static noSplits() {
    return (splits: Splits) => splits.length() === 0;
  }

  private static testKind(kind: string, selector: string): boolean {
    if (selector === '*') {
      return true;
    }

    var bareSelector = selector.replace(/^!/, '');

    // This can be enriched later, right now it's just a 1-1 match
    var result = kind === bareSelector;

    if (selector.charAt(0) === '!') {
      return !result;
    }

    return result;
  }


  public static strictCompare(selectors: string[], kinds: string[]): boolean {
    if (selectors.length !== kinds.length) {
      return false;
    }

    return selectors.every((selector, i) => CircumstancesHandler.testKind(kinds[i], selector));
  }

  public static areExactSplitKinds = (...selectors: string[]) => {
    return (splits: Splits, dataSource: DataSource): boolean => {
      var kinds: string[] = splits.toArray().map((split: SplitCombine) => split.getDimension(dataSource.dimensions).kind);
      return CircumstancesHandler.strictCompare(selectors, kinds);
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

  public needsAtLeastOneSplit(message?: string): CircumstancesHandler {
    return this.when(
      CircumstancesHandler.noSplits(),
      (splits: Splits, dataSource: DataSource) => {
        var someDimensions = dataSource.dimensions.toArray().filter(d => d.kind === 'string').slice(0, 2);
        return Resolve.manual(4, message,
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
