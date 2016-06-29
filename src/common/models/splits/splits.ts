import { List } from 'immutable';
import { Class, Instance, isInstanceOf, immutableArraysEqual } from 'immutable-class';
import { Timezone, Duration, day, hour } from 'chronoshift';
import { $, Expression, RefExpression, TimeRange, TimeBucketAction, SortAction, NumberRange, Range } from 'plywood';
import { immutableListsEqual } from '../../utils/general/general';
import { Dimension } from '../dimension/dimension';
import { Filter } from '../filter/filter';
import { SplitCombine, SplitCombineJS, SplitCombineContext } from '../split-combine/split-combine';
import { NumberBucketAction } from "plywood";
import { getDefaultGranularityForKind, getBestBucketUnitForRange } from "../granularity/granularity";

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

  public removeBucketingFrom(expressions: Expression[]) {
    var changed = false;
    var newSplitCombines = <List<SplitCombine>>this.splitCombines.map((splitCombine) => {
      if (!splitCombine.bucketAction) return splitCombine;
      var splitCombineExpression = splitCombine.expression;
      if (expressions.every(ex => !ex.equals(splitCombineExpression))) return splitCombine;

      changed = true;
      return splitCombine.changeBucketAction(null);
    });

    return changed ? new Splits(newSplitCombines) : this;
  }

  public updateWithFilter(filter: Filter, dimensions: List<Dimension>): Splits {
    if (filter.isRelative()) throw new Error('can not be a relative filter');

    var changed = false;
    var newSplitCombines = <List<SplitCombine>>this.splitCombines.map((splitCombine) => {
      if (splitCombine.bucketAction) return splitCombine;

      var splitExpression = splitCombine.expression;
      var splitDimension = dimensions.find(d => splitExpression.equals(d.expression));
      var splitKind = splitDimension.kind;
      if (!splitDimension || !(splitKind === 'time' || splitKind === 'number')) return splitCombine;
      changed = true;

      var selectionSet = filter.getLiteralSet(splitExpression);
      var extent = selectionSet ? selectionSet.extent() : null;

      if (splitKind === 'time') {
        return splitCombine.changeBucketAction(new TimeBucketAction({
          duration: TimeRange.isTimeRange(extent) ? (getBestBucketUnitForRange(extent, false, splitDimension.bucketedBy, splitDimension.granularities) as Duration) :
            (getDefaultGranularityForKind('time', splitDimension.bucketedBy, splitDimension.granularities) as TimeBucketAction).duration
        }));

      } else if (splitKind === 'number') {
        return splitCombine.changeBucketAction(new NumberBucketAction({
          size: extent ? (getBestBucketUnitForRange(extent, false, splitDimension.bucketedBy, splitDimension.granularities) as number) :
            (getDefaultGranularityForKind('number', splitDimension.bucketedBy, splitDimension.granularities) as NumberBucketAction).size
        }));

      }

      throw new Error('unknown extent type');
    });

    return changed ? new Splits(newSplitCombines) : this;
  }

  public constrainToDimensions(dimensions: List<Dimension>): Splits {
    var changed = false;
    var splitCombines: SplitCombine[] = [];
    this.splitCombines.forEach((split) => {
      if (split.getDimension(dimensions)) {
        splitCombines.push(split);
      } else {
        changed = true;
        // Potential special handling for time split would go here
      }
    });

    return changed ? new Splits(List(splitCombines)) : this;
  }

  public timezoneDependant(): boolean {
    return this.splitCombines.some((splitCombine) => splitCombine.timezoneDependant());
  }

  public changeSortIfOnMeasure(fromMeasure: string, toMeasure: string): Splits {
    var changed = false;
    var newSplitCombines = <List<SplitCombine>>this.splitCombines.map((splitCombine) => {
      const { sortAction } = splitCombine;
      if (!sortAction || sortAction.refName() !== fromMeasure) return splitCombine;

      changed = true;
      return splitCombine.changeSortAction(new SortAction({
        expression: $(toMeasure),
        direction: sortAction.direction
      }));
    });

    return changed ? new Splits(newSplitCombines) : this;
  }

}
check = Splits;

Splits.EMPTY = new Splits(<List<SplitCombine>>List());
