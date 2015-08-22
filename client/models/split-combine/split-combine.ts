'use strict';

import { ImmutableClass, ImmutableInstance, isInstanceOf } from 'higher-object';
import { $, Expression, ChainExpression, ExpressionJS, Action, ActionJS, SortAction, LimitAction, TimeBucketAction } from 'plywood';

export interface SplitCombineValue {
  dimension: string;
  splitOn: Expression;
  sortAction: SortAction;
  limitAction: LimitAction;
}

export interface SplitCombineJS {
  dimension: string;
  splitOn?: ExpressionJS;
  sortAction?: ActionJS;
  limitAction?: ActionJS;
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
    var value: SplitCombineValue = {
      dimension: parameters.dimension,
      splitOn: null,
      sortAction: null,
      limitAction: null
    };

    if (parameters.splitOn) value.splitOn = Expression.fromJS(parameters.splitOn);
    if (parameters.sortAction) value.sortAction = SortAction.fromJS(parameters.sortAction);
    if (parameters.limitAction) value.limitAction = LimitAction.fromJS(parameters.limitAction);
    return new SplitCombine(value);
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
    var js: SplitCombineJS = {
      dimension: this.dimension
    };
    if (this.splitOn) js.splitOn = this.splitOn.toJS();
    if (this.sortAction) js.sortAction = this.sortAction.toJS();
    if (this.limitAction) js.limitAction = this.limitAction.toJS();
    return js;
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

  public getExtraTitle(): string {
    var splitOn = this.splitOn;
    if (splitOn instanceof ChainExpression) {
      var action = splitOn.actions[0];
      if (action instanceof TimeBucketAction) {
        var duration = action.duration.toString();
        switch (duration) {
          case 'P1D': return ' (Day)';
          case 'PT1H': return ' (Hour)';
          case 'PT1M': return ' (Minute)';
          default: return '';
        }
      }
    }
    return '';
  }
}
