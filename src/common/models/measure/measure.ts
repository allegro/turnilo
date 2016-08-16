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
import { BaseImmutable, isInstanceOf } from 'immutable-class';
import * as numeral from 'numeral';
import { $, Expression, Datum, ApplyAction, AttributeInfo, ChainExpression, deduplicateSort } from 'plywood';
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
  units?: string;
  formula?: string;
  format?: string;
}

export interface MeasureJS {
  name: string;
  title?: string;
  units?: string;
  formula?: string;
  format?: string;
}

export class Measure extends BaseImmutable<MeasureValue, MeasureJS> {
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
    return deduplicateSort(references);
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
    return deduplicateSort(references);
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
    // Back compat
    if (!parameters.formula) {
      var parameterExpression = (parameters as any).expression;
      parameters.formula = (typeof parameterExpression === 'string' ? parameterExpression : $('main').sum($(parameters.name)).toString());
    }

    return new Measure(BaseImmutable.jsToValue(Measure.PROPERTIES, parameters));
  }

  static PROPERTIES = [
    { name: 'name', validate: verifyUrlSafeName },
    { name: 'title', defaultValue: null },
    { name: 'units', defaultValue: null },
    { name: 'formula' },
    { name: 'format', defaultValue: Measure.DEFAULT_FORMAT }
  ];

  public name: string;
  public title: string;
  public units: string;
  public formula: string;
  public expression: Expression;
  public format: string;
  public formatFn: (n: number) => string;

  constructor(parameters: MeasureValue) {
    super(parameters);

    this.title = this.title || makeTitle(this.name);
    this.expression = Expression.parse(this.formula);
    this.formatFn = formatFnFactory(this.getFormat());
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

  public getTitle: () => string;
  public changeTitle: (newTitle: string) => this;

  public getTitleWithUnits(): string {
    if (this.units) {
      return `${this.title} (${this.units})`;
    } else {
      return this.title;
    }
  }

  public getFormula: () => string;
  public changeFormula: (newFormula: string) => this;

  public getFormat: () => string;
  public changeFormat: (newFormat: string) => this;
}
BaseImmutable.finalize(Measure);
