'use strict';

import { ImmutableClass, ImmutableInstance, isInstanceOf } from 'higher-object';
import { $, Expression, ExpressionJS, Action, ActionJS, SortAction, LimitAction } from 'plywood';

export interface SplitCombineValue {
  dimension: string;
  splitOn: Expression;
  sortAction: SortAction;
  limitAction: LimitAction;
}

export interface SplitCombineJS {
  dimension: string;
  splitOn: ExpressionJS;
  sortAction: ActionJS;
  limitAction: ActionJS;
}

var check: ImmutableClass<SplitCombineValue, SplitCombineJS>;
export class SplitCombine implements ImmutableInstance<SplitCombineValue, SplitCombineJS> {
  public dimension: string;
  public splitOn: Expression;
  public sortAction: SortAction;
  public limitAction: LimitAction;

  static isSplitCombine(candidate: any): boolean {
    return isInstanceOf(candidate, SplitCombine);
  }

  static fromJS(parameters: SplitCombineJS): SplitCombine {
    return new SplitCombine({
      dimension: parameters.dimension,
      splitOn: Expression.fromJS(parameters.splitOn),
      sortAction: SortAction.fromJS(parameters.sortAction),
      limitAction: LimitAction.fromJS(parameters.limitAction)
    });
  }

  constructor(parameters: SplitCombineValue) {
    this.dimension = parameters.dimension;
    this.splitOn = parameters.splitOn;
    this.sortAction = parameters.sortAction;
    this.limitAction = parameters.limitAction;
  }

  public valueOf(): SplitCombineValue {
    return {
      dimension: this.dimension,
      splitOn: this.splitOn,
      sortAction: this.sortAction,
      limitAction: this.limitAction
    };
  }

  public toJS(): SplitCombineJS {
    return {
      dimension: this.dimension,
      splitOn: this.splitOn.toJS(),
      sortAction: this.sortAction.toJS(),
      limitAction: this.limitAction.toJS()
    };
  }

  public toJSON(): SplitCombineJS {
    return this.toJS();
  }

  public toString(): string {
    return `[SplitCombine: ${this.dimension}]`;
  }

  public equals(other: SplitCombine): boolean {
    return SplitCombine.isSplitCombine(other) &&
      this.dimension === other.dimension &&
      this.splitOn.equals(other.splitOn) &&
      this.sortAction.equals(other.sortAction) &&
      this.limitAction.equals(other.limitAction);
  }
}
