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

import { $, ApplyExpression } from "plywood";
import { Measure, MeasureDerivation } from "../measure/measure";
import { TimeShiftEnv } from "../time-shift/time-shift-env";
import { ConcreteSeries } from "./concrete-series";
import { ExpressionSeries, ExpressionSeriesOperation } from "./expression-series";

export class ExpressionConcreteSeries extends ConcreteSeries<ExpressionSeries> {
  constructor(series: ExpressionSeries, measure: Measure, private readonly operand?: Measure) {
    super(series, measure);
  }

  key(derivation?: MeasureDerivation): string {
    return `${super.key(derivation)}-${this.series.operation}`;
  }

  private relativeNesting(nestingLevel: number): number {
    switch (this.series.operation) {
      case ExpressionSeriesOperation.PERCENT_OF_TOTAL:
        return nestingLevel;
      case ExpressionSeriesOperation.PERCENT_OF_PARENT:
        return Math.min(nestingLevel, 1);
    }
  }

  plywoodExpression(nestingLevel: number, derivation: MeasureDerivation, timeShiftEnv: TimeShiftEnv): ApplyExpression {
    const expression = this.applyPeriod(derivation, timeShiftEnv);
    const relativeNesting = this.relativeNesting(nestingLevel);
    const name = this.plywoodKey(derivation);
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

  protected plywoodKey(derivation: MeasureDerivation): string {
    return `${super.plywoodKey(derivation)}__${this.series.operation}_`;
  }

  title(derivation?: MeasureDerivation): string {
    return `${super.title(derivation)} ${this.operationTitle()}`;
  }

  private operationTitle(): string {
    switch (this.series.operation) {
      case ExpressionSeriesOperation.PERCENT_OF_PARENT:
        return "(% of Parent)";
      case ExpressionSeriesOperation.PERCENT_OF_TOTAL:
        return "(% of Total)";
    }
  }
}
