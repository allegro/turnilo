import { List } from 'immutable';
import { Class, Instance, isInstanceOf, immutableArraysEqual } from 'immutable-class';
import { Timezone, Duration, day, hour } from 'chronoshift';
import { $, Expression, RefExpression, TimeRange, TimeBucketAction, SortAction } from 'plywood';
import { immutableListsEqual } from '../../utils/general/general';
import { getBestGranularityDuration } from '../../utils/time/time';
import { Dimension } from '../dimension/dimension';
import { SplitCombine, SplitCombineJS, SplitCombineContext } from '../split-combine/split-combine';

const DEFAULT_GRANULARITY = Duration.fromJS('P1D');

function withholdSplit(splits: List<SplitCombine>, split: SplitCombine, allowIndex: number): List<SplitCombine> {
  return <List<SplitCombine>>splits.filter((s, i) => {
    return i === allowIndex || !s.equalsByExpression(split);
  });
}

function swapSplit(splits: List<SplitCombine>, split: SplitCombine, other: SplitCombine, allowIndex: number): List<SplitCombine> {
  return <List<SplitCombine>>splits.map((s, i) => {
    return (i === allowIndex || !s.equalsByExpression(split)) ? s : other;
  });
}

export type SplitsValue = List<SplitCombine>;
export type SplitsJS = SplitCombineJS | SplitCombineJS[];
export type SplitContext = SplitCombineContext;

var check: Class<SplitsValue, SplitsJS>;
export class Splits implements Instance<SplitsValue, SplitsJS> {
  static EMPTY: Splits;

  static isSplits(candidate: any): candidate is Splits {
    return isInstanceOf(candidate, Splits);
  }

  static fromSplitCombine(splitCombine: SplitCombine): Splits {
    return new Splits(<List<SplitCombine>>List([splitCombine]));
  }

  static fromJS(parameters: SplitsJS, context?: SplitContext): Splits {
    if (!Array.isArray(parameters)) parameters = [parameters as any];
    return new Splits(List((parameters as SplitCombineJS[]).map(splitCombine => SplitCombine.fromJS(splitCombine, context))));
  }


  public splitCombines: List<SplitCombine>;

  constructor(parameters: SplitsValue) {
    this.splitCombines = parameters;
  }

  public valueOf(): SplitsValue {
    return this.splitCombines;
  }

  public toJS(): SplitsJS {
    return this.splitCombines.toArray().map(splitCombine => splitCombine.toJS());
  }

  public toJSON(): SplitsJS {
    return this.toJS();
  }

  public toString() {
    return this.splitCombines.map(splitCombine => splitCombine.toString()).join(',');
  }

  public equals(other: Splits): boolean {
    return Splits.isSplits(other) &&
      immutableListsEqual(this.splitCombines, other.splitCombines);
  }

  public replaceByIndex(index: number, replace: SplitCombine): Splits {
    var { splitCombines } = this;
    if (splitCombines.size === index) return this.insertByIndex(index, replace);
    var replacedSplit = splitCombines.get(index);
    splitCombines = <List<SplitCombine>>splitCombines.map((s, i) => i === index ? replace : s);
    splitCombines = swapSplit(splitCombines, replace, replacedSplit, index);
    return new Splits(splitCombines);
  }

  public insertByIndex(index: number, insert: SplitCombine): Splits {
    var { splitCombines } = this;
    splitCombines = <List<SplitCombine>>splitCombines.splice(index, 0, insert);
    splitCombines = withholdSplit(splitCombines, insert, index);
    return new Splits(splitCombines);
  }

  public addSplit(split: SplitCombine): Splits {
    var { splitCombines } = this;
    return this.insertByIndex(splitCombines.size, split);
  }

  public removeSplit(split: SplitCombine): Splits {
    return new Splits(<List<SplitCombine>>this.splitCombines.filter(s => s !== split));
  }

  public changeSortAction(sort: SortAction): Splits {
    return new Splits(<List<SplitCombine>>this.splitCombines.map(s => s.changeSortAction(sort)));
  }

  public getTitle(dimensions: List<Dimension>): string {
    return this.splitCombines.map(s => s.getDimension(dimensions).title).join(', ');
  }

  public length(): number {
    return this.splitCombines.size;
  }

  public forEach(sideEffect: (value?: SplitCombine, key?: number, iter?: List<SplitCombine>) => any, context?: any): number {
    return this.splitCombines.forEach(sideEffect, context);
  }

  public get(index: number): SplitCombine {
    return this.splitCombines.get(index);
  }

  public first(): SplitCombine {
    return this.splitCombines.first();
  }

  public last(): SplitCombine {
    return this.splitCombines.last();
  }

  public findSplitForDimension(dimension: Dimension): SplitCombine {
    var dimensionExpression = dimension.expression;
    return this.splitCombines.find((s) => s.expression.equals(dimensionExpression));
  }

  public hasSplitOn(dimension: Dimension): boolean {
    return Boolean(this.findSplitForDimension(dimension));
  }

  public replace(search: SplitCombine, replace: SplitCombine): Splits {
    return new Splits(<List<SplitCombine>>this.splitCombines.map((s) => s.equals(search) ? replace : s));
  }

  public map(mapper: (value?: SplitCombine, key?: number) => SplitCombine, context?: any): Splits {
    return new Splits(<List<SplitCombine>>this.splitCombines.map(mapper, context));
  }

  public toArray(): SplitCombine[] {
    return this.splitCombines.toArray();
  }

  public updateWithTimeRange(timeAttribute: RefExpression, timeRange: TimeRange, force?: boolean): Splits {
    var changed = false;

    var granularity = timeRange ? getBestGranularityDuration(timeRange) : DEFAULT_GRANULARITY;

    var newSplitCombines = <List<SplitCombine>>this.splitCombines.map((splitCombine) => {
      if (!splitCombine.expression.equals(timeAttribute)) return splitCombine;
      var { bucketAction } = splitCombine;
      if (bucketAction) {
        if (!force) return splitCombine;
        if (bucketAction instanceof TimeBucketAction && !bucketAction.duration.equals(granularity)) {
          changed = true;
          return splitCombine.changeBucketAction(new TimeBucketAction({
            timezone: bucketAction.timezone, // This is just preserving the existing timezone which is probably null
            duration: granularity
          }));
        } else {
          return splitCombine;
        }
      } else {
        changed = true;
        return splitCombine.changeBucketAction(new TimeBucketAction({
          duration: granularity
        }));
      }
    });

    return changed ? new Splits(newSplitCombines) : this;
  }

  public constrainToDimensions(dimensions: List<Dimension>): Splits {
    var hasChanged = false;
    var splitCombines: SplitCombine[] = [];
    this.splitCombines.forEach((split) => {
      if (split.getDimension(dimensions)) {
        splitCombines.push(split);
      } else {
        hasChanged = true;
        // Potential special handling for time split would go here
      }
    });

    return hasChanged ? new Splits(List(splitCombines)) : this;
  }

  public timezoneDependant(): boolean {
    return this.splitCombines.some((splitCombine) => splitCombine.timezoneDependant());
  }

}
check = Splits;

Splits.EMPTY = new Splits(<List<SplitCombine>>List());
