'use strict';

import { List } from 'immutable';
import { ImmutableClass, ImmutableInstance, isInstanceOf } from 'higher-object';
import { $, Expression, LiteralExpression, ChainExpression, InAction, Set, TimeRange } from 'plywood';
import { listsEqual } from '../../utils/general';

export class Filter {
  public operands: List<ChainExpression>;

  static isFilter(candidate: any): boolean {
    return isInstanceOf(candidate, Filter);
  }

  constructor(operands?: List<ChainExpression>) {
    if (!operands) {
      operands = <List<ChainExpression>>List();
    }
    this.operands = operands;
  }

  public toString() {
    return this.operands.map(operand => operand.toString()).join(' and ');
  }

  public toExpression(): Expression {
    var operands = this.operands;
    switch (operands.size) {
      case 0:  return Expression.TRUE;
      case 1:  return operands.first();
      default: return operands.reduce((red: ChainExpression, next: ChainExpression) => red.and(next));
    }
  }

  public equals(other: Filter): boolean {
    return Filter.isFilter(other) &&
      listsEqual(this.operands, other.operands);
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
      return new Filter(<List<ChainExpression>>operands.concat(newOperand));
    } else {
      return new Filter(<List<ChainExpression>>operands.splice(index, 1, newOperand));
    }
  }

  public setTimeRange(attribute: Expression, timeRange: TimeRange): Filter {
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    var newOperand = attribute.in(timeRange);
    if (index === -1) {
      return new Filter(<List<ChainExpression>>operands.concat(newOperand));
    } else {
      return new Filter(<List<ChainExpression>>operands.splice(index, 1, newOperand));
    }
  }

  public remove(attribute: Expression): Filter {
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    if (index === -1) return this;
    return new Filter(operands.delete(index));
  }
}
