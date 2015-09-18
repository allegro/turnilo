'use strict';

import { Class, Instance, isInstanceOf } from 'immutable-class';
import { $, Expression, ExpressionJS } from 'plywood';
import { makeTitle } from '../../utils/general/general';

export interface MeasureValue {
  name: string;
  title: string;
  expression: Expression;
  format: string;
}

export interface MeasureJS {
  name: string;
  title?: string;
  expression?: ExpressionJS;
  format?: string;
}

var check: Class<MeasureValue, MeasureJS>;
export class Measure implements Instance<MeasureValue, MeasureJS> {
  static DEFAULT_FORMAT = '0,0.0 a';
  static INTEGER_FORMAT = '0,0 a';

  static isMeasure(candidate: any): boolean {
    return isInstanceOf(candidate, Measure);
  }

  static fromJS(parameters: MeasureJS): Measure {
    return new Measure({
      name: parameters.name,
      title: parameters.title,
      expression: parameters.expression ? Expression.fromJSLoose(parameters.expression) : null,
      format: parameters.format
    });
  }


  public name: string;
  public title: string;
  public expression: Expression;
  public format: string;

  constructor(parameters: MeasureValue) {
    var name = parameters.name;
    this.name = name;
    this.title = parameters.title || makeTitle(name);
    this.expression = parameters.expression || $('main').sum($(name));
    var format = parameters.format || Measure.DEFAULT_FORMAT;
    if (format[0] === '(') throw new Error('can not have format that uses ( )');
    this.format = format;
  }

  public valueOf(): MeasureValue {
    return {
      name: this.name,
      title: this.title,
      expression: this.expression,
      format: this.format
    };
  }

  public toJS(): MeasureJS {
    var js: MeasureJS = {
      name: this.name,
      title: this.title,
      expression: this.expression.toJS()
    };
    if (this.format !== Measure.DEFAULT_FORMAT) js.format = this.format;
    return js;
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
      this.expression.equals(other.expression) &&
      this.format === other.format;
  }
}
check = Measure;
