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

import { day, minute, Timezone } from "chronoshift";
import { Class, Instance } from "immutable-class";
import {
  ChainableExpression,
  ContainsExpression,
  Datum,
  Expression,
  ExpressionJS,
  InExpression,
  LiteralExpression,
  MatchExpression,
  NotExpression,
  NumberRange,
  OverlapExpression,
  r,
  Range,
  RefExpression,
  Set,
  TimeRange
} from "plywood";

// Basically these represent
// expression.in(selection) .not()?
export type FilterSelection = Expression | string;

export enum SupportedAction {
  overlap = "overlap",
  contains = "contains",
  match = "match"
}

export interface FilterClauseValue {
  action?: SupportedAction;
  expression: Expression;
  selection?: FilterSelection;
  exclude?: boolean;
}

export interface FilterClauseJS {
  action?: SupportedAction;
  expression: ExpressionJS;
  selection?: ExpressionJS | string;
  exclude?: boolean;
}

function isLiteral(ex: Expression): boolean {
  if (ex instanceof LiteralExpression) return TimeRange.isTimeRange(ex.value) || Set.isSet(ex.value) || NumberRange.isNumberRange(ex.value);
  return false;
}

function isRelative(ex: Expression): boolean {
  if (ex instanceof ChainableExpression) {
    if (ex.type !== "TIME_RANGE") return false;
    const expression = ex.getHeadOperand();
    if (expression instanceof RefExpression) {
      return expression.name === FilterClause.NOW_REF_NAME || expression.name === FilterClause.MAX_TIME_REF_NAME;
    }
  }
  return false;
}

function selectionsEqual(a: any, b: any) {
  if (!Boolean(a) === Boolean(b)) return false;
  if (a === b) return true;
  if (!a !== !b) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a === "string" && typeof b === "string") return a === b;
  return (a as Expression).equals(b as Expression);
}

let check: Class<FilterClauseValue, FilterClauseJS>;

export class FilterClause implements Instance<FilterClauseValue, FilterClauseJS> {

  static isFilterClause(candidate: any): candidate is FilterClause {
    return candidate instanceof FilterClause;
  }

  static NOW_REF_NAME = "n";
  static MAX_TIME_REF_NAME = "m";

  static evaluate(selection: Expression, now: Date, maxTime: Date, timezone: Timezone): TimeRange {
    if (!selection) return null;
    const maxTimeMinuteTop = minute.shift(minute.floor(maxTime || now, timezone), timezone, 1);
    const datum: Datum = {};
    datum[FilterClause.NOW_REF_NAME] = now;
    datum[FilterClause.MAX_TIME_REF_NAME] = maxTimeMinuteTop;
    return selection.defineEnvironment({ timezone }).getFn()(datum);
  }

  static fromExpression(ex: Expression): FilterClause {
    let exclude = false;

    if (ex instanceof NotExpression) {
      ex = ex.operand;
      exclude = true;
    }

    let dimension = "";
    if (ex instanceof ChainableExpression) {
      if (ex.operand instanceof RefExpression) {
        dimension = ex.operand.name;
      }
    }

    if (ex instanceof InExpression || ex instanceof OverlapExpression || ex instanceof ContainsExpression) {
      let dimExpression = ex.operand;
      const selection = ex.expression;
      const action = ex.op as SupportedAction;

      return new FilterClause({
        action,
        expression: dimExpression,
        selection,
        exclude
      });
    }

    if (ex instanceof MatchExpression) {
      let dimExpression = ex.operand;
      const regexp = (ex as MatchExpression).regexp;
      return new FilterClause({
        action: SupportedAction.match,
        expression: dimExpression,
        selection: regexp,
        exclude
      });
    }

    throw new Error(`invalid expression ${ex.toString()}`);
  }

  static fromJS(parameters: FilterClauseJS): FilterClause {
    const { selection, action } = parameters;
    const value: FilterClauseValue = {
      action,
      expression: Expression.fromJS(parameters.expression),
      selection: (typeof selection !== "string") ? Expression.fromJS(selection as ExpressionJS) : selection as string,
      exclude: Boolean(parameters.exclude)
    };
    return new FilterClause(value);
  }

  public action: SupportedAction;
  public expression: Expression;
  public selection: FilterSelection;
  public exclude: boolean;
  public relative: boolean;

  constructor(parameters: FilterClauseValue) {
    const { expression, selection, exclude, action } = parameters;
    if (action) this.action = action;
    this.expression = expression;
    if (isRelative(selection as Expression)) {
      this.relative = true;
    } else if (isLiteral(selection as Expression)) {
      this.relative = false;
    } else if (action === "match" && typeof selection !== "string") {
      throw new Error(`invalid match selection: ${selection}`);
    } else if (action === "contains" && !(selection instanceof Expression)) {
      throw new Error(`invalid contains expression: ${selection}`);
    }
    this.selection = selection;
    this.exclude = exclude || false;
  }

  public valueOf(): FilterClauseValue {
    return {
      action: this.action,
      expression: this.expression,
      selection: this.selection,
      exclude: this.exclude
    };
  }

  public toJS(): FilterClauseJS {
    const { selection, action } = this;
    const js: FilterClauseJS = {
      expression: this.expression.toJS(),
      selection: selection instanceof Expression ? (selection as Expression).toJS() : selection
    };
    if (this.exclude) js.exclude = true;
    if (action) js.action = action;
    return js;
  }

  public toJSON(): FilterClauseJS {
    return this.toJS();
  }

  public toString(): string {
    return `[FilterClause: ${this.expression.toString()}]`;
  }

  public equals(other: FilterClause): boolean {
    return FilterClause.isFilterClause(other) &&
      this.action === other.action &&
      this.expression.equals(other.expression) &&
      selectionsEqual(this.selection, other.selection) &&
      this.exclude === other.exclude;
  }

  public toExpression(): ChainableExpression {
    const { expression, selection, action } = this;
    let ex: ChainableExpression = null;
    if (selection instanceof Expression) {
      const selectionType = (selection as Expression).type;
      if (selectionType === "TIME_RANGE" || selectionType === "SET/TIME_RANGE" || selectionType === "NUMBER_RANGE" || selectionType === "SET/NUMBER_RANGE") {
        ex = expression.in(selection);
      } else if (action === "contains") {
        ex = expression.contains(selection);
      } else {
        ex = expression.overlap(selection);
      }
    } else if (action === "match") {
      ex = expression.match(selection);
    }
    if (this.exclude) ex = ex.not();
    return ex;

  }

  public getLiteralSet(): Set {
    const { selection } = this;
    if (this.relative) return null;
    if (selection instanceof Expression) {
      const v = (selection as Expression).getLiteralValue();
      return Set.isSet(v) ? v : Set.fromJS([v]);
    } else {
      return Set.fromJS([selection]);
    }
  }

  public getExtent(): Range<any> {
    const mySet = this.getLiteralSet();
    return mySet ? mySet.extent() : null;
  }

  public isLessThanFullDay(): boolean {
    let extent = this.getExtent();
    if (!extent) return false;
    return extent.end.valueOf() - extent.start.valueOf() < day.canonicalLength;
  }

  public changeSelection(selection: Expression) {
    const value = this.valueOf();
    value.selection = selection;
    return new FilterClause(value);
  }

  public changeExclude(exclude: boolean): FilterClause {
    const value = this.valueOf();
    value.exclude = exclude;
    return new FilterClause(value);
  }

  public evaluate(now: Date, maxTime: Date, timezone: Timezone): FilterClause {
    if (!this.relative) return this;
    return this.changeSelection(r(FilterClause.evaluate((this.selection as Expression), now, maxTime, timezone)));
  }
}

check = FilterClause;
