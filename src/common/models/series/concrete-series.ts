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
import { Measure, MeasureDerivation } from "../measure/measure";
import { TimeShiftEnv } from "../time-shift/time-shift-env";
import { Series } from "./series";
import { seriesFormatter } from "./series-format";

export class ConcreteSeries {

  constructor(public readonly series: Series, public readonly measure: Measure) {
  }

  public key(derivation = MeasureDerivation.CURRENT): string {
    return this.plywoodKey(derivation);
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

  public title(derivation = MeasureDerivation.CURRENT): string {
    function derivationTitle(derivation: MeasureDerivation): string {
      switch (derivation) {
        case MeasureDerivation.CURRENT:
          return "";
        case MeasureDerivation.PREVIOUS:
          return "Previous ";
        case MeasureDerivation.DELTA:
          return "Difference ";
      }
    }

    return `${derivationTitle(derivation)}${this.measure.title}`;
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

  private filterMainRefs(exp: Expression, filter: Expression): Expression {
    return exp.substitute(e => {
      if (e instanceof RefExpression && e.name === "main") {
        return $("main").filter(filter);
      }
      return null;
    });
  }

  private applyPeriod(derivation: MeasureDerivation, timeShiftEnv: TimeShiftEnv): Expression {
    if (derivation === MeasureDerivation.CURRENT) return this.measure.expression;
    return this.filterMainRefs(this.measure.expression, timeShiftEnv.currentFilter);
  }

  public plywoodExpression(nestingLevel: number, derivation: MeasureDerivation, timeShiftEnv: TimeShiftEnv): ApplyExpression {
    const expression = this.applyPeriod(derivation, timeShiftEnv);
    const name = this.plywoodKey(derivation);
    return new ApplyExpression({ name, expression });
  }

  private plywoodKey(derivation = MeasureDerivation.CURRENT): string {
    const derivationStr = derivation === MeasureDerivation.CURRENT ? "" : `_${derivation}__`;
    return `${derivationStr}${this.measure.name}`;
  }
}
