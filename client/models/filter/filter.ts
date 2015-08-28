'use strict';

import { List } from 'immutable';
import { ImmutableClass, ImmutableInstance, isInstanceOf } from 'higher-object';
import { $, Expression, LiteralExpression, ChainExpression, ExpressionJS, InAction, Set, TimeRange } from 'plywood';
import { listsEqual } from '../../utils/general';

export type FilterValue = List<ChainExpression>;
export type FilterJS = ExpressionJS[];

var check: ImmutableClass<FilterValue, FilterJS>;
export class Filter implements ImmutableInstance<FilterValue, FilterJS> {
  static EMPTY: Filter;

  public operands: List<ChainExpression>;

  static isFilter(candidate: any): boolean {
    return isInstanceOf(candidate, Filter);
  }

  static fromJS(parameters: FilterJS): Filter {
    return new Filter(List(parameters.map(operand => ChainExpression.fromJS(operand))));
  }

  constructor(parameters: FilterValue) {
    this.operands = parameters;
  }

  public valueOf(): FilterValue {
    return this.operands;
  }

  public toJS(): FilterJS {
    return this.operands.toArray().map(operand => operand.toJS());
  }

  public toJSON(): FilterJS {
    return this.toJS();
  }

  public toString() {
    return this.operands.map(operand => operand.toString()).join(' and ');
  }

  public equals(other: Filter): boolean {
    return Filter.isFilter(other) &&
      listsEqual(this.operands, other.operands);
  }

  public toExpression(): Expression {
    var operands = this.operands;
    switch (operands.size) {
      case 0:  return Expression.TRUE;
      case 1:  return operands.first();
      default: return operands.reduce((red: ChainExpression, next: ChainExpression) => red.and(next));
    }
  }

  private indexOfOperand(attribute: Expression): number {
    return this.operands.findIndex(operand => operand.expression.equals(attribute));
  }

  public filteredOn(attribute: Expression): boolean {
    return this.indexOfOperand(attribute) !== -1;
  }

  public add(attribute: Expression, value: any): Filter {
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    if (index === -1) {
      return new Filter(<List<ChainExpression>>operands.concat(attribute.in([value])));
    } else {
      var operand = operands.get(index);
      var action = operand.actions[0];
      if (action instanceof InAction) {
        var newSet = (<Set>(<LiteralExpression>action.expression).value).add(value);
        operand = attribute.in(newSet);
      } else {
        throw new Error('invalid operand');
      }
      return new Filter(<List<ChainExpression>>operands.splice(index, 1, operand));
    }
  }

  public setValues(attribute: Expression, values: any[]): Filter {
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    var newOperand = attribute.in(values);
    if (index === -1) {
      operands = <List<ChainExpression>>operands.concat(newOperand);
    } else {
      operands = <List<ChainExpression>>operands.splice(index, 1, newOperand);
    }
    return new Filter(operands);
  }

  public getValues(attribute: Expression): any[] {
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    if (index === -1) return null;
    return operands.get(index).actions[0].getLiteralValue().elements;
  }

  public setTimeRange(attribute: Expression, timeRange: TimeRange): Filter {
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    var newOperand = attribute.in(timeRange);
    if (index === -1) {
      operands = <List<ChainExpression>>operands.concat(newOperand);
    } else {
      operands = <List<ChainExpression>>operands.splice(index, 1, newOperand);
    }
    return new Filter(operands);
  }

  public getTimeRange(attribute: Expression): TimeRange {
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    if (index === -1) return null;
    return operands.get(index).actions[0].getLiteralValue();
  }

  public remove(attribute: Expression): Filter {
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    if (index === -1) return this;
    return new Filter(operands.delete(index));
  }
}
check = Filter;

Filter.EMPTY = new Filter(<List<ChainExpression>>List());
