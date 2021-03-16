/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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
import { $, AttributeInfo, CountDistinctExpression, deduplicateSort, Expression, QuantileExpression, RefExpression } from "plywood";
import { makeTitle, makeUrlSafeName, verifyUrlSafeName } from "../../utils/general/general";
import some from "../../utils/plywood/some";
import { formatFnFactory, measureDefaultFormat } from "../series/series-format";
import { MeasureOrGroupVisitor } from "./measure-group";

export interface MeasureValue {
  name: string;
  title?: string;
  units?: string;
  formula?: string;
  format?: {} | string;
  transformation?: string;
  description?: string;
  lowerIsBetter?: boolean;
}

export interface MeasureJS {
  name: string;
  title?: string;
  units?: string;
  formula?: string;
  format?: {} | string;
  transformation?: string;
  description?: string;
  lowerIsBetter?: boolean;
}

export class Measure extends BaseImmutable<MeasureValue, MeasureJS> {
  static DEFAULT_FORMAT = measureDefaultFormat;
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

  static getReferences(ex: Expression): string[] {
    let references: string[] = [];
    ex.forEach((sub: Expression) => {
      if (sub instanceof RefExpression && sub.name !== "main") {
        references = references.concat(sub.name);
      }
    });
    return deduplicateSort(references);
  }

  static hasCountDistinctReferences(ex: Expression): boolean {
    return some(ex, e => e instanceof CountDistinctExpression);
  }

  static hasQuantileReferences(ex: Expression): boolean {
    return some(ex, e => e instanceof QuantileExpression);
  }

  static measuresFromAttributeInfo(attribute: AttributeInfo): Measure[] {
    const { name, nativeType } = attribute;
    const $main = $("main");
    const ref = $(name);

    if (nativeType) {
      if (nativeType === "hyperUnique" || nativeType === "thetaSketch" || nativeType === "HLLSketch") {
        return [
          new Measure({
            name: makeUrlSafeName(name),
            formula: $main.countDistinct(ref).toString()
          })
        ];
      } else if (nativeType === "approximateHistogram" || nativeType === "quantilesDoublesSketch") {
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
    { name: "lowerIsBetter", defaultValue: false },
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
  public format: {} | string;
  public formatFn: (n: number) => string;
  public transformation: string;
  public lowerIsBetter: boolean;
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

  public getTitleWithUnits(): string {
    if (this.units) {
      return `${this.title} (${this.units})`;
    } else {
      return this.title;
    }
  }

  public isApproximate(): boolean {
    return Measure.hasCountDistinctReferences(this.expression) || Measure.hasQuantileReferences(this.expression);
  }

  public isQuantile() {
    return this.expression instanceof QuantileExpression;
  }

  // Default getter from ImmutableValue
  public getFormat: () => {} | string;

}

BaseImmutable.finalize(Measure);
