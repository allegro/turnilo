'use strict';

import { ImmutableClass, ImmutableInstance, isInstanceOf } from 'higher-object';
import { $, Expression, ExpressionJS } from 'plywood';

export interface DimensionValue {
  name: string;
  title: string;
  expression: Expression;
  type: string;
}

export interface DimensionJS {
  name: string;
  title: string;
  expression: ExpressionJS;
  type: string;
}

var check: ImmutableClass<DimensionValue, DimensionJS>;
export class Dimension implements ImmutableInstance<DimensionValue, DimensionJS> {
  public name: string;
  public title: string;
  public expression: Expression;
  public type: string;

  static isDimension(candidate: any): boolean {
    return isInstanceOf(candidate, Dimension);
  }

  static fromJS(parameters: DimensionJS): Dimension {
    return new Dimension({
      name: parameters.name,
      title: parameters.title,
      expression: Expression.fromJS(parameters.expression),
      type: parameters.type
    });
  }

  constructor(parameters: DimensionValue) {
    this.name = parameters.name;
    this.title = parameters.title;
    this.expression = parameters.expression;
    this.type = parameters.type;
  }

  public valueOf(): DimensionValue {
    return {
      name: this.name,
      title: this.title,
      expression: this.expression,
      type: this.type
    };
  }

  public toJS(): DimensionJS {
    return {
      name: this.name,
      title: this.title,
      expression: this.expression.toJS(),
      type: this.type
    };
  }

  public toJSON(): DimensionJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Dimension: ${this.name}]`;
  }

  public equals(other: Dimension): boolean {
    return Dimension.isDimension(other) &&
      this.name === other.name &&
      this.title === other.title &&
      this.expression.equals(other.expression) &&
      this.type === other.type;
  }
}
check = Dimension;
