/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import { Duration } from "chronoshift";
import { Class, Instance } from "immutable-class";
import { $, Expression, ExpressionJS, LimitExpression, NumberBucketExpression, RefExpression, SortExpression, TimeBucketExpression } from "plywood";
import { Dimension } from "../dimension/dimension";
import { Dimensions } from "../dimension/dimensions";

export interface SplitCombineValue {
  expression: Expression;
  bucketAction: Expression;
  sortAction: SortExpression;
  limitAction: LimitExpression;
}

export type SplitCombineJS = string | SplitCombineJSFull;

export interface SplitCombineJSFull {
  expression: ExpressionJS;
  bucketAction?: ExpressionJS;
  sortAction?: ExpressionJS;
  limitAction?: ExpressionJS;
}

export interface SplitCombineContext {
  dimensions: Dimensions;
}

let check: Class<SplitCombineValue, SplitCombineJS>;

export class SplitCombine implements Instance<SplitCombineValue, SplitCombineJS> {
  static SORT_ON_DIMENSION_PLACEHOLDER = "__SWIV_SORT_ON_DIMENSIONS__";

  static isSplitCombine(candidate: any): candidate is SplitCombine {
    return candidate instanceof SplitCombine;
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
    if (typeof parameters === "string") {
      if (!context) throw new Error("must have context for string split");
      const dimension = context.dimensions.getDimensionByName(parameters);
      if (!dimension) throw new Error(`can not find dimension ${parameters}`);
      return new SplitCombine({
        expression: dimension.expression,
        bucketAction: null,
        sortAction: null,
        limitAction: null
      });
    } else {
      const value: SplitCombineValue = {
        expression: Expression.fromJSLoose(parameters.expression),
        bucketAction: null,
        sortAction: null,
        limitAction: null
      };

      if (parameters.bucketAction) value.bucketAction = Expression.fromJS(parameters.bucketAction);
      if (parameters.sortAction) value.sortAction = SortExpression.fromJS(parameters.sortAction);
      if (parameters.limitAction) value.limitAction = LimitExpression.fromJS(parameters.limitAction);
      return new SplitCombine(value);
    }
  }

  public expression: Expression;
  public bucketAction: Expression;
  public sortAction: SortExpression;
  public limitAction: LimitExpression;

  constructor(parameters: SplitCombineValue) {
    this.expression = parameters.expression;
    if (!this.expression) throw new Error("must have expression");
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
    const js: SplitCombineJSFull = {
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
    const { expression, bucketAction, sortAction, limitAction } = this;
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
    const { expression } = this;
    return SplitCombine.isSplitCombine(other) && expression.equals(other.expression);
  }

  public withTimeShift(filter: Expression, shift: Duration): SplitCombine {
    const { expression } = this;
    if (expression instanceof RefExpression && expression.name === "__time") {
      return new SplitCombine({
        ...this.valueOf(),
        expression: filter.then(expression).fallback(expression.timeShift(shift))
      });
    }
    return this;
  }

  public toSplitExpression(): Expression {
    const { expression, bucketAction } = this;
    if (!bucketAction) return expression;
    return expression.performAction(bucketAction);
  }

  public toKey(): string {
    return this.toSplitExpression().toString();
  }

  public getNormalizedSortExpression(dimensions: Dimensions): SortExpression {
    const { sortAction } = this;
    const dimension = this.getDimension(dimensions);
    if (!sortAction) return null;
    if (sortAction.refName() === dimension.name) {
      return sortAction.changeExpression($(SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER)) as SortExpression;
    }
    return sortAction;
  }

  public changeBucketAction(bucketAction: Expression): SplitCombine {
    const value = this.valueOf();
    value.bucketAction = bucketAction;
    return new SplitCombine(value);
  }

  public changeSortExpression(sortAction: SortExpression): SplitCombine {
    const value = this.valueOf();
    value.sortAction = sortAction;
    return new SplitCombine(value);
  }

  public changeSortExpressionFromNormalized(sortAction: SortExpression, dimensions: Dimensions): SplitCombine {
    if (sortAction.refName() === SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER) {
      const dimension = dimensions.getDimensionByExpression(this.expression);
      if (!dimension) throw new Error("can not find dimension for split");
      sortAction = sortAction.changeExpression($(dimension.name)) as SortExpression;
    }
    return this.changeSortExpression(sortAction);
  }

  public changeLimitExpression(limitAction: LimitExpression): SplitCombine {
    const value = this.valueOf();
    value.limitAction = limitAction;
    return new SplitCombine(value);
  }

  public changeLimit(limit: number): SplitCombine {
    const limitAction = limit === null ? null : new LimitExpression({ value: limit });
    return this.changeLimitExpression(limitAction);
  }

  public timezoneDependant(): boolean {
    const { bucketAction } = this;
    if (!bucketAction) return false;
    return bucketAction.needsEnvironment();
  }

  public getDimension(dimensions: Dimensions): Dimension {
    return dimensions.getDimensionByExpression(this.expression);
  }

  public getTitle(dimensions: Dimensions): string {
    const dimension = this.getDimension(dimensions);
    return (dimension ? dimension.title : "?") + this.getBucketTitle();
  }

  public getBucketTitle(): string {
    const bucketAction = this.bucketAction;
    if (bucketAction instanceof TimeBucketExpression) {
      return ` (${bucketAction.duration.getDescription(true)})`;
    } else if (bucketAction instanceof NumberBucketExpression) {
      return ` (by ${bucketAction.size})`;
    }
    return "";
  }

}
