'use strict';

import { List } from 'immutable';
import { Class, Instance, isInstanceOf } from 'immutable-class';
import { Timezone, Duration } from 'chronoshift';
import { $, r, Expression, LiteralExpression, ExpressionJS, InAction, Set, TimeRange } from 'plywood';
import { listsEqual } from '../../utils/general/general';
import { Dimension } from '../dimension/dimension';
import { FilterClause, FilterClauseJS } from '../filter-clause/filter-clause';

function withholdClause(clauses: List<FilterClause>, clause: FilterClause, allowIndex: number): List<FilterClause> {
  return <List<FilterClause>>clauses.filter((c, i) => {
    return i === allowIndex || !c.equals(clause);
  });
}

function swapClause(clauses: List<FilterClause>, clause: FilterClause, other: FilterClause, allowIndex: number): List<FilterClause> {
  return <List<FilterClause>>clauses.map((c, i) => {
    return (i === allowIndex || !c.equals(clause)) ? c : other;
  });
}

export type FilterValue = List<FilterClause>;
export type FilterJS = ExpressionJS | string;

var check: Class<FilterValue, FilterJS>;
export class Filter implements Instance<FilterValue, FilterJS> {
  static EMPTY: Filter;

  static isFilter(candidate: any): boolean {
    return isInstanceOf(candidate, Filter);
  }

  static fromClause(clause: FilterClause): Filter {
    if (!clause) throw new Error('must have clause');
    return new Filter(List([clause]));
  }

  static fromJS(parameters: FilterJS): Filter {
    var expression = Expression.fromJSLoose(parameters);

    var clauses: FilterClause[] = null;
    if (expression.equals(Expression.TRUE)) {
      clauses = [];
    } else {
      clauses = (expression.getExpressionPattern('and') || [expression]).map(c => FilterClause.fromExpression(c));
    }

    return new Filter(<List<FilterClause>>List(clauses));
  }


  public clauses: List<FilterClause>;

  constructor(parameters: FilterValue) {
    this.clauses = parameters;
  }

  public valueOf(): FilterValue {
    return this.clauses;
  }

  public toJS(): FilterJS {
    return this.toExpression().toJS();
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

  public replaceByIndex(index: number, replace: FilterClause): Filter {
    var { clauses } = this;
    if (clauses.size === index) return this.insertByIndex(index, replace);
    var replacedClause = clauses.get(index);
    clauses = <List<FilterClause>>clauses.map((c, i) => i === index ? replace : c);
    clauses = swapClause(clauses, replace, replacedClause, index);
    return new Filter(clauses);
  }

  public insertByIndex(index: number, insert: FilterClause): Filter {
    var { clauses } = this;
    clauses = <List<FilterClause>>clauses.splice(index, 0, insert);
    clauses = withholdClause(clauses, insert, index);
    return new Filter(clauses);
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
    var clauses = this.clauses.toArray().map(clause => {
      return clause.toExpression();
    });
    switch (clauses.length) {
      case 0:
        return Expression.TRUE;
      case 1:
        return clauses[0];
      default:
        return Expression.and(clauses);
    }
  }

  public isRelative(): boolean {
    return this.clauses.some(clause => clause.relative);
  }

  public getSpecificFilter(now: Date, maxTime: Date, timezone: Timezone): Filter {
    if (!this.isRelative()) return this;
    return new Filter(this.clauses.map(c => c.evaluate(now, maxTime, timezone)) as List<FilterClause>);
  }

  private indexOfClause(attribute: Expression): number {
    return this.clauses.findIndex(clause => clause.expression.equals(attribute));
  }

  public clauseForExpression(attribute: Expression): FilterClause {
    return this.clauses.find(clause => clause.expression.equals(attribute));
  }

  public filteredOn(attribute: Expression): boolean {
    return this.indexOfClause(attribute) !== -1;
  }

  public filteredOnValue(attribute: Expression, value: any): boolean {
    var clauses = this.clauses;
    var index = this.indexOfClause(attribute);
    if (index === -1) return false;
    return clauses.get(index).getValues().contains(value);
  }

  public addValue(attribute: Expression, value: any): Filter {
    var clauses = this.clauses;
    var index = this.indexOfClause(attribute);
    if (index === -1) {
      return new Filter(<List<FilterClause>>clauses.concat(new FilterClause({
        expression: attribute,
        check: r(Set.fromJS([value]))
      })));
    } else {
      var clause = clauses.get(index);
      var newSet = clause.getValues().add(value);
      return new Filter(<List<FilterClause>>clauses.splice(index, 1, clause.changeLiteralSet(newSet)));
    }
  }

  public remove(attribute: Expression): Filter {
    var clauses = this.clauses;
    var index = this.indexOfClause(attribute);
    if (index === -1) return this;
    return new Filter(clauses.delete(index));
  }

  public removeValue(attribute: Expression, value: any): Filter {
    var clauses = this.clauses;
    var index = this.indexOfClause(attribute);
    if (index === -1) return this;
    var clause = clauses.get(index);

    var newSet = clause.getValues().remove(value);
    if (newSet.empty()) {
      return new Filter(clauses.delete(index));
    } else {
      clauses = <List<FilterClause>>clauses.splice(index, 1, clause.changeLiteralSet(newSet));
      return new Filter(clauses);
    }
  }

  public toggleValue(attribute: Expression, value: any): Filter {
    return this.filteredOnValue(attribute, value) ? this.removeValue(attribute, value) : this.addValue(attribute, value);
  }

  public setValues(attribute: Expression, values: Set): Filter {
    var clauses = this.clauses;
    var index = this.indexOfClause(attribute);
    if (values.size()) {
      var newClause = new FilterClause({
        expression: attribute,
        check: r(values)
      });
      if (index === -1) {
        clauses = <List<FilterClause>>clauses.push(newClause);
      } else {
        clauses = <List<FilterClause>>clauses.splice(index, 1, newClause);
      }
    } else {
      return new Filter(clauses.delete(index));
    }
    return new Filter(clauses);
  }

  public getValues(attribute: Expression): Set {
    var clauses = this.clauses;
    var index = this.indexOfClause(attribute);
    if (index === -1) return null;
    return clauses.get(index).getValues();
  }

  public setTimeCheck(attribute: Expression, check: Expression): Filter {
    var clauses = this.clauses;
    var index = this.indexOfClause(attribute);
    var newClause = new FilterClause({
      expression: attribute,
      check
    });
    if (index === -1) {
      clauses = <List<FilterClause>>clauses.push(newClause);
    } else {
      clauses = <List<FilterClause>>clauses.splice(index, 1, newClause);
    }
    return new Filter(clauses);
  }

  public getTimeRange(attribute: Expression): TimeRange {
    var clauses = this.clauses;
    var index = this.indexOfClause(attribute);
    if (index === -1) return null;
    return clauses.get(index).getTimeRange();
  }

  public getCheck(attribute: Expression): Expression {
    var clauses = this.clauses;
    var index = this.indexOfClause(attribute);
    if (index === -1) return null;
    return clauses.get(index).check;
  }

  public setClause(expression: FilterClause): Filter {
    var expressionAttribute = expression.expression;
    var added = false;
    var newOperands = <List<FilterClause>>this.clauses.map((clause) => {
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
    var newFilter: Filter = this;
    var deltaClauses = delta.clauses;
    deltaClauses.forEach((deltaClause) => {
      newFilter = newFilter.setClause(deltaClause);
    });
    return newFilter;
  }

  public getSingleClauseSet(): Set {
    var clauses = this.clauses;
    if (clauses.size !== 1) return null;
    return clauses.get(0).getValues();
  }

  public constrainToDimensions(dimensions: List<Dimension>, timeAttribute: Expression, oldTimeAttribute: Expression = null): Filter {
    var hasChanged = false;
    var clauses: FilterClause[] = [];
    this.clauses.forEach((clause) => {
      var clauseExpression = clause.expression;
      if (Dimension.getDimensionByExpression(dimensions, clauseExpression)) {
        clauses.push(clause);
      } else {
        hasChanged = true;
        // Special handling for time filter
        if (timeAttribute && oldTimeAttribute && oldTimeAttribute.equals(clauseExpression)) {
          clauses.push(new FilterClause({
            expression: timeAttribute,
            check: clause.check
          }));
        }
      }
    });

    return hasChanged ? new Filter(List(clauses)) : this;
  }

  public overQuery(duration: Duration, timezone: Timezone, timeAttribute: Expression): Filter {
    if (!timeAttribute) return this;

    return new Filter(<List<FilterClause>>this.clauses.map((clause) => {
      if (clause.expression.equals(timeAttribute)) {
        var timeRange: TimeRange = clause.getTimeRange();
        var newTimeRange = new TimeRange({
          start: duration.move(timeRange.start, timezone, -1),
          end: duration.move(timeRange.end, timezone, 1)
        });
        return clause.changeLiteralTimeRange(newTimeRange);
      } else {
        return clause;
      }
    }));
  }
}
check = Filter;

Filter.EMPTY = new Filter(<List<FilterClause>>List());
