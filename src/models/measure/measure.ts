'use strict';

import { ImmutableClass, ImmutableInstance, isInstanceOf } from 'higher-object';
import { $, Expression, ExpressionJS } from 'plywood';

export interface MeasureValue {
  name: string;
  title: string;
  expression: Expression;
}

export interface MeasureJS {
  name: string;
  title: string;
  expression: ExpressionJS;
}

var check: ImmutableClass<MeasureValue, MeasureJS>;
export class Measure implements ImmutableInstance<MeasureValue, MeasureJS> {
  public name: string;
  public title: string;
  public expression: Expression;

  static isMeasure(candidate: any): boolean {
    return isInstanceOf(candidate, Measure);
  }

  static fromJS(parameters: MeasureJS): Measure {
    return new Measure({
      name: parameters.name,
      title: parameters.title,
      expression: Expression.fromJS(parameters.expression)
    });
  }

  constructor(parameters: MeasureValue) {
    this.name = parameters.name;
    this.title = parameters.title;
    this.expression = parameters.expression;
  }

  public valueOf(): MeasureValue {
    return {
      name: this.name,
      title: this.title,
      expression: this.expression
    };
  }

  public toJS(): MeasureJS {
    return {
      name: this.name,
      title: this.title,
      expression: this.expression.toJS()
    };
  }

  public toJSON(): MeasureJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Measure: ${this.name}]`;
  }

  public equals(other: Measure): boolean {
    return Measure.isMeasure(other) &&
      this.name === other.name &&
      this.title === other.title &&
      this.expression.equals(other.expression);
  }
}
check = Measure;
