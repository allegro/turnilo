'use strict';

import { Class, Instance, isInstanceOf } from 'immutable-class';
import * as numeral from 'numeral';
import { $, Expression, ExpressionJS, Action, ApplyAction, AttributeInfo } from 'plywood';
import { makeTitle } from '../../utils/general/general';

function formatFnFactory(format: string): (n: number) => string {
  return (n: number) => {
    if (isNaN(n) || !isFinite(n)) return '-';
    return numeral(n).format(format);
  };
}

export interface MeasureValue {
  name: string;
  title?: string;
  expression?: Expression;
  format?: string;
}

export interface MeasureJS {
  name: string;
  title?: string;
  expression?: ExpressionJS | string;
  format?: string;
}

var check: Class<MeasureValue, MeasureJS>;
export class Measure implements Instance<MeasureValue, MeasureJS> {
  static DEFAULT_FORMAT = '0,0.0 a';
  static INTEGER_FORMAT = '0,0 a';

  static isMeasure(candidate: any): boolean {
    return isInstanceOf(candidate, Measure);
  }

  static measuresFromAttributeInfo(attribute: AttributeInfo): Measure[] {
    var name = attribute.name;
    var $main = $('main');
    var ref = $(name);

    if (attribute.special) {
      if (attribute.special === 'unique') {
        return [
          new Measure({
            name,
            expression: $main.countDistinct(ref)
          })
        ];
      } else { // ToDo: handle: 'histogram'
        return [];
      }
    }

    var expression = $main.sum(ref);
    var makerAction = attribute.makerAction;
    if (makerAction) {
      switch (makerAction.action) {
        case 'min':
          expression = $main.min(ref);
          break;

        case 'max':
          expression = $main.max(ref);
          break;

        //default: // sum, count
      }
    }

    return [new Measure({ name, expression })];
  }

  static fromJS(parameters: MeasureJS): Measure {
    var name = parameters.name;
    return new Measure({
      name,
      title: parameters.title,
      expression: parameters.expression ? Expression.fromJSLoose(parameters.expression) : $('main').sum($(name)),
      format: parameters.format
    });
  }


  public name: string;
  public title: string;
  public expression: Expression;
  public format: string;
  public formatFn: (n: number) => string;

  constructor(parameters: MeasureValue) {
    var name = parameters.name;
    this.name = name;
    this.title = parameters.title || makeTitle(name);

    var expression = parameters.expression;
    if (!expression) throw new Error('measure must have expression');
    this.expression = expression;

    var format = parameters.format || Measure.DEFAULT_FORMAT;
    if (format[0] === '(') throw new Error('can not have format that uses ( )');
    this.format = format;
    this.formatFn = formatFnFactory(format);
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

  public toApplyAction(): ApplyAction {
    var { name, expression } = this;
    return new ApplyAction({
      name: name,
      expression: expression
    });
  }
}
check = Measure;
