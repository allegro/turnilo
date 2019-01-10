/*
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

import { $, ApplyExpression, Datum, Expression, RefExpression } from "plywood";
import { seriesFormatter } from "../../utils/formatter/formatter";
import { Measure } from "../measure/measure";
import { SeriesDerivation } from "../series/series-definition";
import { SeriesFormat } from "../series/series-format";
import { plywoodExpressionKey, title } from "./data-series-names";

export interface Period {
  derivation: SeriesDerivation;
  filter: Expression;
}

export class PreviousPeriod implements Period {
  derivation = SeriesDerivation.PREVIOUS;

  constructor(public filter: Expression) {
  }
}

export class CurrentPeriod implements Period {
  derivation = SeriesDerivation.CURRENT;

  constructor(public filter: Expression) {
  }
}

export interface Transformation {
  expressionName(reference: string, derivation: SeriesDerivation): string;

  title(baseTitle: string, derivation: SeriesDerivation): string;

  applyExpression(reference: string, derivation: SeriesDerivation, expression: Expression, nestingLevel: number): ApplyExpression;
}

class IdTransformation implements Transformation {
  expressionName(reference: string, derivation: SeriesDerivation): string {
    return plywoodExpressionKey(reference, derivation);
  }

  applyExpression(reference: string, derivation: SeriesDerivation, expression: Expression): ApplyExpression {
    const name = this.expressionName(reference, derivation);
    return new ApplyExpression({ name, expression });
  }

  title(baseTitle: string, derivation: SeriesDerivation): string {
    return title(baseTitle, derivation);
  }
}

export enum PercentOf { TOTAL = "__total_", PARENT = "__parent_" }

export class PercentageTransformation implements Transformation {

  constructor(private readonly percentOf: PercentOf) {
  }

  expressionName(reference: string, derivation: SeriesDerivation): string {
    return `${plywoodExpressionKey(reference, derivation)}${this.percentOf}`;
  }

  private relativeNesting(nestingLevel: number): number {
    switch (this.percentOf) {
      case PercentOf.TOTAL:
        return nestingLevel;
      case PercentOf.PARENT:
        return Math.min(nestingLevel, 1);
    }
  }

  applyExpression(reference: string, derivation: SeriesDerivation, expression: Expression, nestingLevel: number): ApplyExpression {
    const relativeNesting = this.relativeNesting(nestingLevel);
    const name = this.expressionName(reference, derivation);
    const formulaName = `__formula_${name}`;
    if (relativeNesting > 0) {
      return new ApplyExpression({
        name,
        operand: new ApplyExpression({ expression, name: formulaName }),
        expression: $(formulaName).divide($(formulaName, relativeNesting))
      });
    }
    if (relativeNesting === 0) {
      return new ApplyExpression({ name: formulaName, expression });
    }
    throw new Error(`wrong nesting level: ${relativeNesting}`);
  }

  private percentTitle(): string {
    switch (this.percentOf) {
      case PercentOf.TOTAL:
        return " (% of Total)";
      case PercentOf.PARENT:
        return " (% of Parent)";
    }
  }

  title(baseTitle: string, derivation: SeriesDerivation): string {
    return `${title(baseTitle, derivation)}${this.percentTitle()}`;
  }
}

export class DataSeries {

  constructor(public readonly measure: Measure,
              public readonly format: SeriesFormat,
              public readonly transformation: Transformation = new IdTransformation()) {
  }

  equals(other: any): boolean {
    return other instanceof DataSeries &&
      this.measure.equals(other.measure) &&
      // this.transformation.equals(other.transformation) &&
      this.format.equals(other.format);
  }

  public plywoodExpressionName(derivation = SeriesDerivation.CURRENT): string {
    return this.transformation.expressionName(this.measure.name, derivation);
  }

  private filterMainRefs(exp: Expression, filter: Expression): Expression {
    return exp.substitute(e => {
      if (e instanceof RefExpression && e.name === "main") {
        return $("main").filter(filter);
      }
      return null;
    });
  }

  private applyPeriod(period: Period): Expression {
    if (!period) return this.measure.expression;
    return this.filterMainRefs(this.measure.expression, period.filter);
  }

  private toApplyExpression(expression: Expression, currentNesting: number, derivation: SeriesDerivation): ApplyExpression {
    return this.transformation.applyExpression(this.measure.name, derivation, expression, currentNesting);
  }

  public toExpression(nestingLevel: number, period?: Period): ApplyExpression {
    const expWithPeriodFilter = this.applyPeriod(period);
    return this.toApplyExpression(expWithPeriodFilter, nestingLevel, period && period.derivation);
  }

  public title(derivation = SeriesDerivation.CURRENT): string {
    return this.transformation.title(this.measure.title, derivation);
  }

  public selectValue(datum: Datum, derivation = SeriesDerivation.CURRENT) {
    switch (derivation) {
      case SeriesDerivation.CURRENT:
      case SeriesDerivation.PREVIOUS:
        return datum[this.plywoodExpressionName(derivation)] as number;
      case SeriesDerivation.DELTA: {
        const current = datum[this.plywoodExpressionName(SeriesDerivation.CURRENT)] as number;
        const previous = datum[this.plywoodExpressionName(SeriesDerivation.PREVIOUS)] as number;
        return Math.abs(current - previous);
      }
    }
  }

  /**
   * @deprecated
   */
  public formatter() {
    return seriesFormatter(this.format, this.measure);
  }

  public formatValue(datum: Datum, derivation = SeriesDerivation.CURRENT): string {
    const formatter = this.formatter();
    const data = this.selectValue(datum, derivation);
    return formatter(data);
  }
}
