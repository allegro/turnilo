import { Class, Instance, isInstanceOf } from 'immutable-class';
import { Timezone, Duration, minute, day } from 'chronoshift';
import { $, r, Expression, ExpressionJS, LiteralExpression, RefExpression, Set, SetJS, ChainExpression, NotAction, OverlapAction, InAction, Range, TimeRange, Datum, NumberRange } from 'plywood';

// Basically these represent
// expression.in(selection) .not()?

export interface FilterClauseValue {
  expression: Expression;
  selection?: Expression;
  exclude?: boolean;
}

export interface FilterClauseJS {
  expression: ExpressionJS;
  selection?: ExpressionJS;
  exclude?: boolean;
}

function isLiteral(ex: Expression): boolean {
  if (ex instanceof LiteralExpression) return TimeRange.isTimeRange(ex.value) || Set.isSet(ex.value) || NumberRange.isNumberRange(ex.value);
  return false;
}

function isRelative(ex: Expression): boolean {
  if (ex instanceof ChainExpression) {
    if (ex.type !== 'TIME_RANGE') return false;
    var expression = ex.expression;
    if (expression instanceof RefExpression) {
      return expression.name === FilterClause.NOW_REF_NAME || expression.name === FilterClause.MAX_TIME_REF_NAME;
    }
  }
  return false;
}

var check: Class<FilterClauseValue, FilterClauseJS>;
export class FilterClause implements Instance<FilterClauseValue, FilterClauseJS> {

  static isFilterClause(candidate: any): candidate is FilterClause {
    return isInstanceOf(candidate, FilterClause);
  }

  static NOW_REF_NAME = 'n';
  static MAX_TIME_REF_NAME = 'm';

  static evaluate(selection: Expression, now: Date, maxTime: Date, timezone: Timezone): TimeRange {
    if (!selection) return null;
    var maxTimeMinuteTop = minute.shift(minute.floor(maxTime || now, timezone), timezone, 1);
    var datum: Datum = {};
    datum[FilterClause.NOW_REF_NAME] = now;
    datum[FilterClause.MAX_TIME_REF_NAME] = maxTimeMinuteTop;
    return selection.defineEnvironment({ timezone }).getFn()(datum, {});
  }

  static fromExpression(ex: Expression): FilterClause {
    var exclude = false;
    if (ex.lastAction() instanceof NotAction) {
      ex = ex.popAction();
      exclude = true;
    }
    var lastAction = ex.lastAction();
    var dimExpression = ex.popAction();
    if (lastAction instanceof InAction || lastAction instanceof OverlapAction) {
      var selection = lastAction.expression;

      return new FilterClause({
        expression: dimExpression,
        selection,
        exclude
      });
    }
    throw new Error(`invalid expression ${ex.toString()}`);
  }

  static fromJS(parameters: FilterClauseJS): FilterClause {
    var value: FilterClauseValue = {
      expression: Expression.fromJS(parameters.expression),
      selection: Expression.fromJS(parameters.selection),
      exclude: Boolean(parameters.exclude)
    };
    return new FilterClause(value);
  }


  public expression: Expression;
  public selection: Expression;
  public exclude: boolean;
  public relative: boolean;

  constructor(parameters: FilterClauseValue) {
    this.expression = parameters.expression;
    var selection = parameters.selection;
    if (isRelative(selection)) {
      this.relative = true;
    } else if (isLiteral(selection)) {
      this.relative = false;
    } else {
      throw new Error(`invalid expression ${selection.toString()}`);
    }
    this.selection = selection;
    this.exclude = parameters.exclude || false;
  }

  public valueOf(): FilterClauseValue {
    return {
      expression: this.expression,
      selection: this.selection,
      exclude: this.exclude
    };
  }

  public toJS(): FilterClauseJS {
    var js: FilterClauseJS = {
      expression: this.expression.toJS(),
      selection: this.selection.toJS()
    };
    if (this.exclude) js.exclude = true;
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
      this.expression.equals(other.expression) &&
      this.selection.equals(other.selection) &&
      this.exclude === other.exclude;
  }

  public toExpression(): ChainExpression {
    const { expression, selection } = this;
    var ex: ChainExpression = null;
    var selectionType = selection.type;
    if (selectionType === 'TIME_RANGE' || selectionType === 'SET/TIME_RANGE' || selectionType === 'NUMBER_RANGE' || selectionType === 'SET/NUMBER_RANGE') {
      ex = expression.in(selection);
    } else {
      ex = expression.overlap(selection);
    }
    if (this.exclude) ex = ex.not();
    return ex;
  }

  public getLiteralSet(): Set {
    if (this.relative) return null;
    var v = this.selection.getLiteralValue();
    return (TimeRange.isTimeRange(v) || NumberRange.isNumberRange(v)) ? Set.fromJS([v]) : v;
  }

  public getExtent(): Range<any> {
    var mySet = this.getLiteralSet();
    return mySet ? mySet.extent() : null;
  }

  public isLessThanFullDay(): boolean {
    var extent = this.getExtent();
    if (!extent) return false;
    return extent.end.valueOf() - extent.start.valueOf() < day.canonicalLength;
  }

  public changeSelection(selection: Expression) {
    var value = this.valueOf();
    value.selection = selection;
    return new FilterClause(value);
  }

  public changeExclude(exclude: boolean): FilterClause {
    var value = this.valueOf();
    value.exclude = exclude;
    return new FilterClause(value);
  }

  public evaluate(now: Date, maxTime: Date, timezone: Timezone): FilterClause {
    if (!this.relative) return this;
    return this.changeSelection(r(FilterClause.evaluate(this.selection, now, maxTime, timezone)));
  }
}
check = FilterClause;
