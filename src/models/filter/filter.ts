'use strict';

import { $, Expression, LiteralExpression, ChainExpression, InAction, Set } from 'plywood';

export class Filter {
  public operands: ChainExpression[];

  constructor(operands: ChainExpression[] = []) {
    this.operands = operands;
  }

  public toString() {
    return this.operands.map(operand => operand.toString()).join(' and ');
  }

  public toExpression() {
    var operands = this.operands;
    switch (operands.length) {
      case 0: return Expression.TRUE;
      case 1: return operands[0];
      default :
        var ret: Expression = operands[0];
        for (var i = 1; i < operands.length; i++) ret = ret.and(operands[i]);
        return ret;
    }
  }

  private indexOfOperand(attribute: Expression): number {
    var operands = this.operands;
    for (let i = 0; i < operands.length; i++) {
      var operand = operands[i];
      if (operand.expression.equals(attribute)) return i;
    }
    return -1;
  }

  public add(attribute: Expression, value: any): Filter {
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    if (index === -1) {
      return new Filter(operands.concat(attribute.in([value])));
    } else {
      var operand = operands[index];
      var action = operand.actions[0];
      if (action instanceof InAction) {
        var newSet = (<Set>(<LiteralExpression>action.expression).value).add(value);
        operand = attribute.in(newSet);
      } else {
        throw new Error('invalid operand');
      }
      operands = operands.slice();
      operands.splice(index, 1, operand);
      return new Filter(operands);
    }
  }

  public setValues(attribute: Expression, values: any[]): Filter {
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    var operand = attribute.in(values);
    if (index === -1) {
      return new Filter(operands.concat(operand));
    } else {
      operands = operands.slice();
      operands.splice(index, 1, operand);
      return new Filter(operands);
    }
  }

  public remove(attribute: Expression): Filter {
    console.log('attribute', attribute);
    var operands = this.operands;
    var index = this.indexOfOperand(attribute);
    console.log('index', index);
    if (index === -1) return this;
    operands = operands.slice();
    operands.splice(index, 1);
    return new Filter(operands);
  }
}
