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

import { Record } from "immutable";
import { $, ApplyExpression, Datum, Expression, RefExpression } from "plywood";
import { seriesFormatter } from "../../utils/formatter/formatter";
import { Measure } from "../measure/measure";
import { DEFAULT_FORMAT, SeriesDerivation, SeriesFormat } from "../series/series";
import { fullName } from "./data-series-names";

interface DataSeriesValue {
  measure: Measure;
  percentOf: DataSeriesPercentOf;
  format: SeriesFormat;
}

const defaultDataSeries: DataSeriesValue = {
  measure: null,
  percentOf: null,
  format: DEFAULT_FORMAT
};

export enum DataSeriesPercentOf { PARENT = "of_parent", TOTAL = "of_total" }

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

export class DataSeries extends Record<DataSeriesValue>(defaultDataSeries) {

  private static derivationTitle(derivation: SeriesDerivation): string {
    switch (derivation) {
      case SeriesDerivation.CURRENT:
        return "";
      case SeriesDerivation.PREVIOUS:
        return "Previous ";
      case SeriesDerivation.DELTA:
        return "Difference ";
    }
  }

  public fullName(derivation = SeriesDerivation.CURRENT): string {
    const percentOf = this.percentOf;
    return fullName(this.measure.name, derivation, percentOf);
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

  private relativeNesting(nestingLevel: number): number {
    switch (this.percentOf) {
      case DataSeriesPercentOf.TOTAL:
        return nestingLevel;
      case DataSeriesPercentOf.PARENT:
        return Math.min(nestingLevel, 1);
    }
  }

  private percentOfExpression(expression: Expression, nestingLevel: number, derivation = SeriesDerivation.CURRENT): ApplyExpression {
    const name = this.fullName(derivation);
    const formulaName = `__formula_${name}`;
    if (nestingLevel > 0) {
      return new ApplyExpression({
        name,
        operand: new ApplyExpression({ expression, name: formulaName }),
        expression: $(formulaName).divide($(formulaName, nestingLevel))
      });
    } else if (nestingLevel === 0) {
      return new ApplyExpression({ name: formulaName, expression });
    } else {
      throw new Error(`wrong nesting level: ${nestingLevel}`);
    }
  }

  private toApplyExpression(expression: Expression, currentNesting: number, derivation: SeriesDerivation): ApplyExpression {
    if (!this.percentOf) return new ApplyExpression({ name: this.fullName(derivation), expression });
    return this.percentOfExpression(expression, this.relativeNesting(currentNesting), derivation);
  }

  public toExpression(nestingLevel: number, period?: Period): ApplyExpression {
    const expWithPeriodFilter = this.applyPeriod(period);
    return this.toApplyExpression(expWithPeriodFilter, nestingLevel, period && period.derivation);
  }

  private percentTitle(): string {
    if (!this.percentOf) return "";
    switch (this.percentOf) {
      case DataSeriesPercentOf.TOTAL:
        return " (% of Total)";
      case DataSeriesPercentOf.PARENT:
        return " (% of Parent)";
    }
  }

  public title(derivation = SeriesDerivation.CURRENT): string {
    const derivationStr = DataSeries.derivationTitle(derivation);
    const percentStr = this.percentTitle();
    return `${derivationStr}${this.measure.title}${percentStr}`;
  }

  public getDatum(datum: Datum, derivation = SeriesDerivation.CURRENT) {
    switch (derivation) {
      case SeriesDerivation.CURRENT:
      case SeriesDerivation.PREVIOUS:
        return datum[this.fullName(derivation)] as number;
      case SeriesDerivation.DELTA: {
        const current = datum[this.fullName(SeriesDerivation.CURRENT)] as number;
        const previous = datum[this.fullName(SeriesDerivation.PREVIOUS)] as number;
        return Math.abs(current - previous);
      }
    }
  }

  public formatter() {
    return seriesFormatter(this.format, this.measure);
  }

  public formatDatum(datum: Datum, derivaion = SeriesDerivation.CURRENT): string {
    const formatter = this.datumFormatter();
    return formatter(datum, derivaion);
  }

  public datumFormatter() {
    const formatter = this.formatter();
    return (datum: Datum, derivation = SeriesDerivation.CURRENT) => {
      switch (derivation) {
        case SeriesDerivation.CURRENT:
        case SeriesDerivation.PREVIOUS:
          return formatter(datum[this.fullName(derivation)] as number);
        case SeriesDerivation.DELTA: {
          const current = datum[this.fullName(SeriesDerivation.CURRENT)] as number;
          const previous = datum[this.fullName(SeriesDerivation.PREVIOUS)] as number;
          return formatter(Math.abs(current - previous));
        }
      }
    };
  }
}
