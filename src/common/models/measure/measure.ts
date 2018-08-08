/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import { List } from "immutable";
import { BaseImmutable, Property } from "immutable-class";

import * as numeral from "numeral";
import {
  $,
  ApplyExpression,
  AttributeInfo,
  ChainableExpression,
  CountDistinctExpression,
  Datum,
  deduplicateSort,
  Expression, QuantileExpression,
  RefExpression
} from "plywood";
import { makeTitle, makeUrlSafeName, verifyUrlSafeName } from "../../utils/general/general";
import { MeasureOrGroupVisitor } from "./measure-group";

function formatFnFactory(format: string): (n: number) => string {
  return (n: number) => {
    if (isNaN(n) || !isFinite(n)) return "-";
    return numeral(n).format(format);
  };
}

export interface MeasureValue {
  name: string;
  title?: string;
  units?: string;
  formula?: string;
  format?: string;
  transformation?: string;
  description?: string;
}

export interface MeasureJS {
  name: string;
  title?: string;
  units?: string;
  formula?: string;
  format?: string;
  transformation?: string;
  description?: string;
}

export enum MeasureDerivation { CURRENT = "", PREVIOUS = "_previous__", DELTA = "_delta__" }

export interface DerivationFilter {
  derivation: MeasureDerivation;
  filter: Expression;
}

export class PreviousFilter implements DerivationFilter {
  derivation = MeasureDerivation.PREVIOUS;

  constructor(public filter: Expression) {
  }
}

export class CurrentFilter implements DerivationFilter {
  derivation = MeasureDerivation.CURRENT;

  constructor(public filter: Expression) {
  }
}

export class Measure extends BaseImmutable<MeasureValue, MeasureJS> {
  static DEFAULT_FORMAT = "0,0.0 a";
  static INTEGER_FORMAT = "0,0 a";
  static DEFAULT_TRANSFORMATION = "none";
  static TRANSFORMATIONS = ["none", "percent-of-parent", "percent-of-total"];

  static isMeasure(candidate: any): candidate is Measure {
    return candidate instanceof Measure;
  }

  static getMeasure(measures: List<Measure>, measureName: string): Measure {
    if (!measureName) return null;
    measureName = measureName.toLowerCase(); // Case insensitive
    return measures.find(measure => measure.name.toLowerCase() === measureName);
  }

  static derivedName(name: string, derivation: MeasureDerivation): string {
    return `${derivation}${name}`;
  }

  static nominalName(name: string): { name: string, derivation: MeasureDerivation } {
    if (name.startsWith(MeasureDerivation.DELTA)) {
      return {
        name: name.substr(MeasureDerivation.DELTA.length),
        derivation: MeasureDerivation.DELTA
      };
    }
    if (name.startsWith(MeasureDerivation.PREVIOUS)) {
      return {
        name: name.substr(MeasureDerivation.PREVIOUS.length),
        derivation: MeasureDerivation.PREVIOUS
      };
    }
    return {
      derivation: MeasureDerivation.CURRENT,
      name
    };
  }

  /**
   * Look for all instances of aggregateAction($blah) and return the blahs
   * @param ex
   * @returns {string[]}
   */
  static getAggregateReferences(ex: Expression): string[] {
    let references: string[] = [];
    ex.forEach((ex: Expression) => {
      if (ex instanceof ChainableExpression) {
        const actions = ex.getArgumentExpressions();
        for (let action of actions) {
          if (action.isAggregate()) {
            references = references.concat(action.getFreeReferences());
          }
        }
      }
    });
    return deduplicateSort(references);
  }

  static getReferences(ex: Expression): string[] {
    let references: string[] = [];
    ex.forEach((sub: Expression) => {
      if (sub instanceof RefExpression && sub.name !== "main") {
        references = references.concat(sub.name);
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
    let references: string[] = [];
    ex.forEach((ex: Expression) => {
      if (ex instanceof CountDistinctExpression) {
        references = references.concat(this.getReferences(ex));
      }
    });
    return deduplicateSort(references);
  }

  static measuresFromAttributeInfo(attribute: AttributeInfo): Measure[] {
    const { name, nativeType } = attribute;
    const $main = $("main");
    const ref = $(name);

    if (nativeType) {
      if (nativeType === "hyperUnique" || nativeType === "thetaSketch") {
        return [
          new Measure({
            name: makeUrlSafeName(name),
            formula: $main.countDistinct(ref).toString()
          })
        ];
      } else if (nativeType === "approximateHistogram") {
        return [
          new Measure({
            name: makeUrlSafeName(name + "_p98"),
            formula: $main.quantile(ref, 0.98).toString()
          })
        ];
      }
    }

    let expression: Expression = $main.sum(ref);
    const makerAction = attribute.maker;
    if (makerAction) {
      switch (makerAction.op) {
        case "min":
          expression = $main.min(ref);
          break;

        case "max":
          expression = $main.max(ref);
          break;

        // default: // sum, count
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
      let parameterExpression = (parameters as any).expression;
      parameters.formula = (typeof parameterExpression === "string" ? parameterExpression : $("main").sum($(parameters.name)).toString());
    }

    return new Measure(BaseImmutable.jsToValue(Measure.PROPERTIES, parameters));
  }

  static PROPERTIES: Property[] = [
    { name: "name", validate: verifyUrlSafeName },
    { name: "title", defaultValue: null },
    { name: "units", defaultValue: null },
    { name: "formula" },
    { name: "description", defaultValue: undefined },
    { name: "format", defaultValue: Measure.DEFAULT_FORMAT },
    { name: "transformation", defaultValue: Measure.DEFAULT_TRANSFORMATION, possibleValues: Measure.TRANSFORMATIONS }
  ];

  public name: string;
  public title: string;
  public description?: string;
  public units: string;
  public formula: string;
  public expression: Expression;
  public format: string;
  public formatFn: (n: number) => string;
  public transformation: string;
  public readonly type = "measure";

  constructor(parameters: MeasureValue) {
    super(parameters);

    this.title = this.title || makeTitle(this.name);
    this.expression = Expression.parse(this.formula);
    this.formatFn = formatFnFactory(this.getFormat());
  }

  accept<R>(visitor: MeasureOrGroupVisitor<R>): R {
    return visitor.visitMeasure(this);
  }

  equals(other: any): boolean {
    return this === other || Measure.isMeasure(other) && super.equals(other);
  }

  public getDerivedName(derivation: MeasureDerivation): string {
    return Measure.derivedName(this.name, derivation);
  }

  private filterMainRefs(exp: Expression, filter: Expression): Expression {
    return exp.substitute(e => {
      if (e instanceof RefExpression && e.name === "main") {
        return $("main").filter(filter);
      }
      return null;
    });
  }

  public toApplyExpression(nestingLevel: number, derivationFilter?: DerivationFilter): ApplyExpression {
    switch (this.transformation) {
      case "percent-of-parent":
        const referencedLevelDelta = Math.min(nestingLevel, 1);
        return this.percentOfParentExpression(referencedLevelDelta, derivationFilter);
      case "percent-of-total":
        return this.percentOfParentExpression(nestingLevel, derivationFilter);
      default:
        return this.withDerivationFilter(derivationFilter);
    }
  }

  private withDerivationFilter(derivationFilter?: DerivationFilter) {
    const { expression } = this;
    if (!derivationFilter) {
      return new ApplyExpression({ name: this.name, expression });
    }
    const { derivation, filter } = derivationFilter;
    return new ApplyExpression({
      name: this.getDerivedName(derivation),
      expression: this.filterMainRefs(expression, filter)
    });
  }

  private percentOfParentExpression(nestingLevel: number, derivationFilter?: DerivationFilter): ApplyExpression {
    const formulaApplyExp = this.withDerivationFilter(derivationFilter);
    const formulaName = `__formula_${formulaApplyExp.name}`;
    const formula = formulaApplyExp.changeName(formulaName);

    if (nestingLevel > 0) {
      const name = derivationFilter ? this.getDerivedName(derivationFilter.derivation) : this.name;
      return new ApplyExpression({
        name,
        operand: formula,
        expression: $(formulaName).divide($(formulaName, nestingLevel)).multiply(100)
      });
    } else if (nestingLevel === 0) {
      return formula;
    } else {
      throw new Error(`wrong nesting level: ${nestingLevel}`);
    }
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

  public isApproximate(): boolean {
    // Expression.some is bugged
    let isApproximate = false;
    this.expression.forEach((exp: Expression) => {
      if (exp instanceof CountDistinctExpression || exp instanceof QuantileExpression) {
        isApproximate = true;
      }
    });
    return isApproximate;
  }

  public getFormula: () => string;
  public changeFormula: (newFormula: string) => this;

  public getFormat: () => string;
  public changeFormat: (newFormat: string) => this;

}

BaseImmutable.finalize(Measure);
