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
import { Unary } from "../../utils/functional/functional";
import { Measure } from "../measure/measure";
import { Series } from "./series";
import { seriesFormatter } from "./series-format";

export enum SeriesDerivation { CURRENT = "", PREVIOUS = "_previous__", DELTA = "_delta__" }

export interface DerivationFilter {
  derivation: SeriesDerivation;
  filter: Expression;
}

export class PreviousFilter implements DerivationFilter {
  derivation = SeriesDerivation.PREVIOUS;

  constructor(public filter: Expression) {
  }
}

export class CurrentFilter implements DerivationFilter {
  derivation = SeriesDerivation.CURRENT;

  constructor(public filter: Expression) {
  }
}
export abstract class ConcreteSeries<T extends Series = Series> {

  protected constructor(public readonly series: T, public readonly measure: Measure) {
  }

  public abstract plywoodExpression(nestingLevel: number, derivationFilter?: DerivationFilter): ApplyExpression;

  public key(derivation = SeriesDerivation.CURRENT): string {
    switch (derivation) {
      case SeriesDerivation.CURRENT:
        return this.measure.name;
      case SeriesDerivation.PREVIOUS:
        return `${this.measure.name}-previous`;
      case SeriesDerivation.DELTA:
        return `${this.measure.name}-delta`;
    }
  }

  protected plywoodKey(derivation = SeriesDerivation.CURRENT): string {
    const derivationStr = derivation === SeriesDerivation.CURRENT ? "" : `_${derivation}__`;
    return `${derivationStr}${this.measure.name}`;
  }

  private filterMainRefs(exp: Expression, filter: Expression): Expression {
    return exp.substitute(e => {
      if (e instanceof RefExpression && e.name === "main") {
        return $("main").filter(filter);
      }
      return null;
    });
  }

  protected applyPeriod(derivationFilter?: DerivationFilter): Expression {
    if (!derivationFilter) return this.measure.expression;
    return this.filterMainRefs(this.measure.expression, derivationFilter.filter);
  }

  public selectValue(datum: Datum, period = SeriesDerivation.CURRENT): number {
    switch (period) {
      case SeriesDerivation.CURRENT:
      case SeriesDerivation.PREVIOUS:
        return datum[this.plywoodKey(period)] as number;
      case SeriesDerivation.DELTA: {
        const current = datum[this.plywoodKey(SeriesDerivation.CURRENT)] as number;
        const previous = datum[this.plywoodKey(SeriesDerivation.PREVIOUS)] as number;
        return Math.abs(current - previous);
      }
    }
  }

  /**
   * @deprecated
   */
  public formatter(): Unary<number, string> {
    return seriesFormatter(this.series.format, this.measure);
  }

  public formatValue(datum: Datum, period = SeriesDerivation.CURRENT): string {
    const value = this.selectValue(datum, period);
    const formatter = seriesFormatter(this.series.format, this.measure);
    return formatter(value);
  }

  public title(derivation = SeriesDerivation.CURRENT): string {
    return `${titleWithDerivation(this.measure, derivation)}${this.measure.title}`;
  }
}

export function titleWithDerivation({ title }: Measure, derivation: SeriesDerivation): string {
  switch (derivation) {
    case SeriesDerivation.CURRENT:
      return title;
    case SeriesDerivation.PREVIOUS:
      return `Previous ${title}`;
    case SeriesDerivation.DELTA:
      return `Difference ${title}`;
    default:
      return title;
  }
}

