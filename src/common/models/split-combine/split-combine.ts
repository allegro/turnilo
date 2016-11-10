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

import { List } from 'immutable';
import { Class, Instance, isInstanceOf } from 'immutable-class';
import { Timezone, Duration, day, hour } from 'chronoshift';
import { $, Expression, ChainExpression, ExpressionJS, Action, ActionJS, SortAction, LimitAction, TimeBucketAction, NumberBucketAction } from 'plywood';
import { Dimension } from '../dimension/dimension';

export interface SplitCombineValue {
  expression: Expression;
  bucketAction: Action;
  sortAction: SortAction;
  limitAction: LimitAction;
}

export type SplitCombineJS = string | SplitCombineJSFull
export interface SplitCombineJSFull {
  expression: ExpressionJS;
  bucketAction?: ActionJS;
  sortAction?: ActionJS;
  limitAction?: ActionJS;
}

export interface SplitCombineContext {
  dimensions: List<Dimension>;
}

var check: Class<SplitCombineValue, SplitCombineJS>;
export class SplitCombine implements Instance<SplitCombineValue, SplitCombineJS> {
  static SORT_ON_DIMENSION_PLACEHOLDER = '__PIVOT_SORT_ON_DIMENSIONS__';

  static isSplitCombine(candidate: any): candidate is SplitCombine {
    return isInstanceOf(candidate, SplitCombine);
  }

  static fromExpression(expression: Expression): SplitCombine {
    return new SplitCombine({
      expression,
      bucketAction: null,
      sortAction: null,
      limitAction: null
    });
  }

  static fromJS(parameters: SplitCombineJS, context?: SplitCombineContext): SplitCombine {
    if (typeof parameters === 'string') {
      if (!context) throw new Error('must have context for string split');
      var dimension = context.dimensions.find(d => d.name === parameters);
      if (!dimension) throw new Error(`can not find dimension ${parameters}`);
      return new SplitCombine({
        expression: dimension.expression,
        bucketAction: null,
        sortAction: null,
        limitAction: null
      });
    } else {
      var value: SplitCombineValue = {
        expression: Expression.fromJSLoose(parameters.expression),
        bucketAction: null,
        sortAction: null,
        limitAction: null
      };

      if (parameters.bucketAction) value.bucketAction = Action.fromJS(parameters.bucketAction);
      if (parameters.sortAction) value.sortAction = SortAction.fromJS(parameters.sortAction);
      if (parameters.limitAction) value.limitAction = LimitAction.fromJS(parameters.limitAction);
      return new SplitCombine(value);
    }
  }


  public expression: Expression;
  public bucketAction: Action;
  public sortAction: SortAction;
  public limitAction: LimitAction;

  constructor(parameters: SplitCombineValue) {
    this.expression = parameters.expression;
    if (!this.expression) throw new Error('must have expression');
    this.bucketAction = parameters.bucketAction;
    this.sortAction = parameters.sortAction;
    this.limitAction = parameters.limitAction;
  }

  public valueOf(): SplitCombineValue {
    return {
      expression: this.expression,
      bucketAction: this.bucketAction,
      sortAction: this.sortAction,
      limitAction: this.limitAction
    };
  }

  public toJS(): SplitCombineJS {
    var js: SplitCombineJSFull = {
      expression: this.expression.toJS()
    };
    if (this.bucketAction) js.bucketAction = this.bucketAction.toJS();
    if (this.sortAction) js.sortAction = this.sortAction.toJS();
    if (this.limitAction) js.limitAction = this.limitAction.toJS();
    return js;
  }

  public toJSON(): SplitCombineJS {
    return this.toJS();
  }

  public toString(): string {
    return `[SplitCombine: ${this.expression}]`;
  }

  public equals(other: SplitCombine): boolean {
    var { expression, bucketAction, sortAction, limitAction } = this;
    return SplitCombine.isSplitCombine(other) &&
      expression.equals(other.expression) &&
      Boolean(bucketAction) === Boolean(other.bucketAction) &&
      (!bucketAction || bucketAction.equals(other.bucketAction)) &&
      Boolean(sortAction) === Boolean(other.sortAction) &&
      (!sortAction || sortAction.equals(other.sortAction)) &&
      Boolean(limitAction) === Boolean(other.limitAction) &&
      (!limitAction || limitAction.equals(other.limitAction));
  }

  public equalsByExpression(other: SplitCombine): boolean {
    var { expression } = this;
    return SplitCombine.isSplitCombine(other) && expression.equals(other.expression);
  }

  public toSplitExpression(): Expression {
    var { expression, bucketAction } = this;
    if (!bucketAction) return expression;
    return expression.performAction(bucketAction);
  }

  public toKey(): string {
    return this.toSplitExpression().toString();
  }

  public getNormalizedSortAction(dimensions: List<Dimension>): SortAction {
    const { sortAction } = this;
    var dimension = this.getDimension(dimensions);
    if (!sortAction) return null;
    if (sortAction.refName() === dimension.name) {
      return sortAction.changeExpression($(SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER)) as SortAction;
    }
    return sortAction;
  }

  public changeBucketAction(bucketAction: Action): SplitCombine {
    var value = this.valueOf();
    value.bucketAction = bucketAction;
    return new SplitCombine(value);
  }

  public changeSortAction(sortAction: SortAction): SplitCombine {
    var value = this.valueOf();
    value.sortAction = sortAction;
    return new SplitCombine(value);
  }

  public changeSortActionFromNormalized(sortAction: SortAction, dimensions: List<Dimension>): SplitCombine {
    if (sortAction.refName() === SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER) {
      var dimension = Dimension.getDimensionByExpression(dimensions, this.expression);
      if (!dimension) throw new Error('can not find dimension for split');
      sortAction = sortAction.changeExpression($(dimension.name)) as SortAction;
    }
    return this.changeSortAction(sortAction);
  }

  public changeLimitAction(limitAction: LimitAction): SplitCombine {
    var value = this.valueOf();
    value.limitAction = limitAction;
    return new SplitCombine(value);
  }

  public changeLimit(limit: number): SplitCombine {
    var limitAction = limit === null ? null : new LimitAction({ limit });
    return this.changeLimitAction(limitAction);
  }

  public timezoneDependant(): boolean {
    const { bucketAction } = this;
    if (!bucketAction) return false;
    return bucketAction.needsEnvironment();
  }

  public getDimension(dimensions: List<Dimension>): Dimension {
    return Dimension.getDimensionByExpression(dimensions, this.expression);
  }

  public getTitle(dimensions: List<Dimension>): string {
    var dimension = this.getDimension(dimensions);
    return (dimension ? dimension.title : '?') + this.getBucketTitle();
  }

  public getBucketTitle(): string {
    var bucketAction = this.bucketAction;
    if (bucketAction instanceof TimeBucketAction) {
      return ` (${bucketAction.duration.getDescription(true)})`;
    } else if (bucketAction instanceof NumberBucketAction) {
      return ` (by ${bucketAction.size})`;
    }
    return '';
  }

}
