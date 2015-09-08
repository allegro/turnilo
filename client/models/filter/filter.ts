'use strict';

import { List } from 'immutable';
import { Class, Instance, isInstanceOf } from 'immutable-class';
import { $, Expression, LiteralExpression, ChainExpression, ExpressionJS, InAction, Set, TimeRange } from 'plywood';
import { listsEqual } from '../../utils/general';

export type FilterValue = List<ChainExpression>;
export type FilterJS = ExpressionJS[];

var check: Class<FilterValue, FilterJS>;
export class Filter implements Instance<FilterValue, FilterJS> {
  static EMPTY: Filter;

  static isFilter(candidate: any): boolean {
    return isInstanceOf(candidate, Filter);
  }

  static fromClause(clause: ChainExpression): Filter {
    if (!clause) throw new Error('must have clause');
    return new Filter(List([clause]));
  }

  static fromJS(parameters: FilterJS): Filter {
    return new Filter(List(parameters.map(clause => ChainExpression.fromJS(clause))));
  }


  public clauses: List<ChainExpression>;

  constructor(parameters: FilterValue) {
    this.clauses = parameters;
  }

  public valueOf(): FilterValue {
    return this.clauses;
  }

  public toJS(): FilterJS {
    return this.clauses.toArray().map(clause => clause.toJS());
  }

  public toJSON(): FilterJS {
    return this.toJS();
  }

  public toString() {
    return this.clauses.map(clause => clause.toString()).join(' and ');
  }

  public equals(other: Filter): boolean {
    return Filter.isFilter(other) &&
      listsEqual(this.clauses, other.clauses);
  }

  public empty(): boolean {
    return this.clauses.size === 0;
  }

  public single(): boolean {
    return this.clauses.size === 1;
  }

  public length(): number {
    return this.clauses.size;
  }

  public toExpression(): Expression {
    var clauses = this.clauses;
    switch (clauses.size) {
      case 0:  return Expression.TRUE;
      case 1:  return clauses.first();
      default: return clauses.reduce((red: ChainExpression, next: ChainExpression) => red.and(next));
    }
  }

  private indexOfOperand(attribute: Expression): number {
    return this.clauses.findIndex(clause => clause.expression.equals(attribute));
  }

  public filteredOn(attribute: Expression): boolean {
    return this.indexOfOperand(attribute) !== -1;
  }

  public add(attribute: Expression, value: any): Filter {
    var clauses = this.clauses;
    var index = this.indexOfOperand(attribute);
    if (index === -1) {
      return new Filter(<List<ChainExpression>>clauses.concat(attribute.in([value])));
    } else {
      var clause = clauses.get(index);
      var action = clause.actions[0];
      if (action instanceof InAction) {
        var newSet = (<Set>(<LiteralExpression>action.expression).value).add(value);
        clause = attribute.in(newSet);
      } else {
        throw new Error('invalid clause');
      }
      return new Filter(<List<ChainExpression>>clauses.splice(index, 1, clause));
    }
  }

  public setValues(attribute: Expression, values: any[]): Filter {
    var clauses = this.clauses;
    var index = this.indexOfOperand(attribute);
    if (values.length) {
      var newOperand = attribute.in(values);
      if (index === -1) {
        clauses = <List<ChainExpression>>clauses.push(newOperand);
      } else {
        clauses = <List<ChainExpression>>clauses.splice(index, 1, newOperand);
      }
    } else {
      return new Filter(clauses.delete(index));
    }
    return new Filter(clauses);
  }

  public getValues(attribute: Expression): any[] {
    var clauses = this.clauses;
    var index = this.indexOfOperand(attribute);
    if (index === -1) return null;
    return clauses.get(index).actions[0].getLiteralValue().elements;
  }

  public setTimeRange(attribute: Expression, timeRange: TimeRange): Filter {
    var clauses = this.clauses;
    var index = this.indexOfOperand(attribute);
    var newOperand = attribute.in(timeRange);
    if (index === -1) {
      clauses = <List<ChainExpression>>clauses.push(newOperand);
    } else {
      clauses = <List<ChainExpression>>clauses.splice(index, 1, newOperand);
    }
    return new Filter(clauses);
  }

  public getTimeRange(attribute: Expression): TimeRange {
    var clauses = this.clauses;
    var index = this.indexOfOperand(attribute);
    if (index === -1) return null;
    return clauses.get(index).actions[0].getLiteralValue();
  }

  public remove(attribute: Expression): Filter {
    var clauses = this.clauses;
    var index = this.indexOfOperand(attribute);
    if (index === -1) return this;
    return new Filter(clauses.delete(index));
  }

  public setClause(expression: ChainExpression): Filter {
    var expressionAttribute = expression.expression;
    var added = false;
    var newOperands = <List<ChainExpression>>this.clauses.map((clause) => {
      if (clause.expression.equals(expressionAttribute)) {
        added = true;
        return expression;
      } else {
        return clause;
      }
    });
    if (!added) {
      newOperands = newOperands.push(expression);
    }
    return new Filter(newOperands);
  }

  public applyDelta(delta: Filter): Filter {
    var newFilter = this;
    var deltaClauses = delta.clauses;
    deltaClauses.forEach((deltaClause) => {
      newFilter = newFilter.setClause(deltaClause);
    });
    return newFilter;
  }

  public getSingleValue(): any {
    var clauses = this.clauses;
    if (clauses.size !== 1) return null;
    var expression = clauses.get(0);
    return expression.actions[0].getLiteralValue();
  }
}
check = Filter;

Filter.EMPTY = new Filter(<List<ChainExpression>>List());
