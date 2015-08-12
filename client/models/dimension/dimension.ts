'use strict';

import { ImmutableClass, ImmutableInstance, isInstanceOf } from 'higher-object';
import { $, Expression, ExpressionJS } from 'plywood';
import { SplitCombine } from '../split-combine/split-combine';

export interface DimensionValue {
  name: string;
  title: string;
  expression: Expression;
  type: string;
  sortOn: string;
}

export interface DimensionJS {
  name: string;
  title: string;
  expression: ExpressionJS;
  type: string;
  sortOn?: string;
}

var check: ImmutableClass<DimensionValue, DimensionJS>;
export class Dimension implements ImmutableInstance<DimensionValue, DimensionJS> {
  public name: string;
  public title: string;
  public expression: Expression;
  public type: string;
  public sortOn: string;

  static isDimension(candidate: any): boolean {
    return isInstanceOf(candidate, Dimension);
  }

  static fromJS(parameters: DimensionJS): Dimension {
    return new Dimension({
      name: parameters.name,
      title: parameters.title,
      expression: Expression.fromJS(parameters.expression),
      type: parameters.type,
      sortOn: parameters.sortOn || null
    });
  }

  constructor(parameters: DimensionValue) {
    this.name = parameters.name;
    this.title = parameters.title;
    this.expression = parameters.expression;
    this.type = parameters.type;
    this.sortOn = parameters.sortOn;
  }

  public valueOf(): DimensionValue {
    return {
      name: this.name,
      title: this.title,
      expression: this.expression,
      type: this.type,
      sortOn: this.sortOn
    };
  }

  public toJS(): DimensionJS {
    var js: DimensionJS = {
      name: this.name,
      title: this.title,
      expression: this.expression.toJS(),
      type: this.type
    };
    if (this.sortOn) js.sortOn = this.sortOn;
    return js;
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
      this.type === other.type &&
      this.sortOn === other.sortOn;
  }

  public getSplitExpression(): Expression {
    var { expression } = this;
    if (this.type === 'TIME') {
      return expression.timeBucket('PT1H', 'Etc/UTC');
    }
    return expression;
  }

  public getSplitCombine(): SplitCombine {
    return new SplitCombine({
      dimension: this.name,
      splitOn: this.getSplitExpression(),
      sortAction: null,
      limitAction: null
    });
  }
}
check = Dimension;
