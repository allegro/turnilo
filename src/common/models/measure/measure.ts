/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { List } from 'immutable';
import { Class, Instance, isInstanceOf } from 'immutable-class';
import * as numeral from 'numeral';
import { $, Expression, ExpressionJS, Datum, ApplyAction, AttributeInfo, ChainExpression, helper } from 'plywood';
import { verifyUrlSafeName, makeTitle, makeUrlSafeName } from '../../utils/general/general';

function formatFnFactory(format: string): (n: number) => string {
  return (n: number) => {
    if (isNaN(n) || !isFinite(n)) return '-';
    return numeral(n).format(format);
  };
}

export interface MeasureValue {
  name: string;
  title?: string;
  formula?: string;
  format?: string;
}

export interface MeasureJS {
  name: string;
  title?: string;
  formula?: string;
  format?: string;
}

var check: Class<MeasureValue, MeasureJS>;
export class Measure implements Instance<MeasureValue, MeasureJS> {
  static DEFAULT_FORMAT = '0,0.0 a';
  static INTEGER_FORMAT = '0,0 a';

  static isMeasure(candidate: any): candidate is Measure {
    return isInstanceOf(candidate, Measure);
  }

  static getMeasure(measures: List<Measure>, measureName: string): Measure {
    if (!measureName) return null;
    measureName = measureName.toLowerCase(); // Case insensitive
    return measures.find(measure => measure.name.toLowerCase() === measureName);
  }

  /**
   * Look for all instances of aggregateAction($blah) and return the blahs
   * @param ex
   * @returns {string[]}
   */
  static getAggregateReferences(ex: Expression): string[] {
    var references: string[] = [];
    ex.forEach((ex: Expression) => {
      if (ex instanceof ChainExpression) {
        var actions = ex.actions;
        for (var action of actions) {
          if (action.isAggregate()) {
            references = references.concat(action.getFreeReferences());
          }
        }
      }
    });
    return helper.deduplicateSort(references);
  }

  /**
   * Look for all instances of countDistinct($blah) and return the blahs
   * @param ex
   * @returns {string[]}
   */
  static getCountDistinctReferences(ex: Expression): string[] {
    var references: string[] = [];
    ex.forEach((ex: Expression) => {
      if (ex instanceof ChainExpression) {
        var actions = ex.actions;
        for (var action of actions) {
          if (action.action === 'countDistinct') {
            references = references.concat(action.getFreeReferences());
          }
        }
      }
    });
    return helper.deduplicateSort(references);
  }

  static measuresFromAttributeInfo(attribute: AttributeInfo): Measure[] {
    var { name, special } = attribute;
    var $main = $('main');
    var ref = $(name);

    if (special) {
      if (special === 'unique' || special === 'theta') {
        return [
          new Measure({
            name: makeUrlSafeName(name),
            formula: $main.countDistinct(ref).toString()
          })
        ];
      } else if (special === 'histogram') {
        return [
          new Measure({
            name: makeUrlSafeName(name + '_p98'),
            formula: $main.quantile(ref, 0.98).toString()
          })
        ];
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

    return [new Measure({
      name: makeUrlSafeName(name),
      formula: expression.toString()
    })];
  }

  static fromJS(parameters: MeasureJS): Measure {
    var name = parameters.name;
    var parameterExpression = (parameters as any).expression; // Back compat
    return new Measure({
      name,
      title: parameters.title,
      formula: parameters.formula || (typeof parameterExpression === 'string' ? parameterExpression : null) || $('main').sum($(name)).toString(),
      format: parameters.format
    });
  }


  public name: string;
  public title: string;
  public formula: string;
  public expression: Expression;
  public format: string;
  public formatFn: (n: number) => string;

  constructor(parameters: MeasureValue) {
    var name = parameters.name;
    verifyUrlSafeName(name);
    this.name = name;
    this.title = parameters.title || makeTitle(name);

    var formula = parameters.formula;
    if (!formula) throw new Error('measure must have formula');
    this.formula = formula;
    this.expression = Expression.parse(formula);

    var format = parameters.format || Measure.DEFAULT_FORMAT;
    if (format[0] === '(') throw new Error('can not have format that uses ( )');
    this.format = format;
    this.formatFn = formatFnFactory(format);
  }

  public valueOf(): MeasureValue {
    return {
      name: this.name,
      title: this.title,
      formula: this.formula,
      format: this.format
    };
  }

  public toJS(): MeasureJS {
    var js: MeasureJS = {
      name: this.name,
      title: this.title,
      formula: this.formula
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
      this.formula === other.formula &&
      this.format === other.format;
  }

  public toApplyAction(): ApplyAction {
    var { name, expression } = this;
    return new ApplyAction({
      name: name,
      expression: expression
    });
  }

  public formatDatum(datum: Datum): string {
    return this.formatFn(datum[this.name] as number);
  }

  public change(propertyName: string, newValue: any): Measure {
    var v = this.valueOf();

    if (!v.hasOwnProperty(propertyName)) {
      throw new Error(`Unknown property : ${propertyName}`);
    }

    (v as any)[propertyName] = newValue;
    return new Measure(v);
  }

  public changeTitle(newTitle: string): Measure {
    return this.change('title', newTitle);
  }

  public changeFormula(newFormula: string): Measure {
    return this.change('formula', newFormula);
  }

}
check = Measure;
