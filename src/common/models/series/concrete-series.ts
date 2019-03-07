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
import { DerivationFilter, Measure, MeasureDerivation } from "../measure/measure";
import { TimeShiftEnv } from "../time-shift/time-shift-env";
import { Series } from "./series";
import { seriesFormatter } from "./series-format";

export abstract class ConcreteSeries<T extends Series = Series> {

  protected constructor(public readonly series: T, public readonly measure: Measure) {
  }

  public abstract plywoodExpression(nestingLevel: number, derivationFilter?: DerivationFilter): ApplyExpression;

  public key(derivation = MeasureDerivation.CURRENT): string {
    switch (derivation) {
      case MeasureDerivation.CURRENT:
        return this.measure.name;
      case MeasureDerivation.PREVIOUS:
        return `${this.measure.name}-previous`;
      case MeasureDerivation.DELTA:
        return `${this.measure.name}-delta`;
    }
  }

  protected plywoodKey(derivation = MeasureDerivation.CURRENT): string {
    const derivationStr = derivation === MeasureDerivation.CURRENT ? "" : `_${derivation}__`;
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

  public selectValue(datum: Datum, period = MeasureDerivation.CURRENT): number {
    switch (period) {
      case MeasureDerivation.CURRENT:
      case MeasureDerivation.PREVIOUS:
        return datum[this.plywoodKey(period)] as number;
      case MeasureDerivation.DELTA: {
        const current = datum[this.plywoodKey(MeasureDerivation.CURRENT)] as number;
        const previous = datum[this.plywoodKey(MeasureDerivation.PREVIOUS)] as number;
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

  public formatValue(datum: Datum, period = MeasureDerivation.CURRENT): string {
    const value = this.selectValue(datum, period);
    const formatter = seriesFormatter(this.series.format, this.measure);
    return formatter(value);
  }

  private derivationTitle(derivation: MeasureDerivation): string {
    switch (derivation) {
      case MeasureDerivation.CURRENT:
        return "";
      case MeasureDerivation.PREVIOUS:
        return "Previous ";
      case MeasureDerivation.DELTA:
        return "Difference ";
    }
  }

  public title(derivation = MeasureDerivation.CURRENT): string {
    return `${this.derivationTitle(derivation)}${this.measure.title}`;
  }
}
