/*
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

import { $, ApplyExpression, Datum, Expression } from "plywood";
import { Unary } from "../../utils/functional/functional";
import { Measure } from "../measure/measure";
import { TimeShiftEnv, TimeShiftEnvType } from "../time-shift/time-shift-env";
import { Series } from "./series";
import { seriesFormatter } from "./series-format";

export enum SeriesDerivation { CURRENT = "", PREVIOUS = "_previous__", DELTA = "_delta__" }

export interface ExpressionEnv {
  nestingLevel: number;
  periodFilter?: Expression;
}

export abstract class ConcreteSeries<T extends Series = Series> {

  constructor(public readonly definition: T, public readonly measure: Measure) {
  }

  public equals(other: ConcreteSeries): boolean {
    return this.definition.equals(other.definition) && this.measure.equals(other.measure);
  }

  public reactKey(derivation = SeriesDerivation.CURRENT): string {
    switch (derivation) {
      case SeriesDerivation.CURRENT:
        return this.definition.key();
      case SeriesDerivation.PREVIOUS:
        return `${this.definition.key()}-previous`;
      case SeriesDerivation.DELTA:
        return `${this.definition.key()}-delta`;
    }
  }

  protected abstract applyExpression(expression: Expression, name: string, env: ExpressionEnv): ApplyExpression;

  public plywoodKey(period = SeriesDerivation.CURRENT): string {
    return this.definition.plywoodKey(period);
  }

  public plywoodExpression(nestingLevel: number, timeShiftEnv: TimeShiftEnv): Expression {
    const { expression } = this.measure;
    switch (timeShiftEnv.type) {
      case TimeShiftEnvType.CURRENT:
        return this.applyExpression(expression, this.definition.plywoodKey(), { nestingLevel });
      case TimeShiftEnvType.WITH_PREVIOUS: {
        const currentName = this.plywoodKey();
        const previousName = this.plywoodKey(SeriesDerivation.PREVIOUS);
        // NOTE: here we filter only first measure ...
        const current = this.applyExpression(expression, currentName, {
            nestingLevel,
            periodFilter: timeShiftEnv.currentFilter
          });
        const previous = this.applyExpression(expression, previousName, {
            nestingLevel,
            periodFilter: timeShiftEnv.previousFilter
          });
        const delta = new ApplyExpression({
          name: this.plywoodKey(SeriesDerivation.DELTA),
          expression: $(currentName).subtract($(previousName))
        });
        return current.performAction(previous).performAction(delta);
      }
    }
  }

  public selectValue(datum: Datum, period = SeriesDerivation.CURRENT): number {
    const value = datum[this.plywoodKey(period)];
    if (typeof value === "number") return value;
    if (value === "NaN") return NaN;
    if (value === "Infinity") return Infinity;
    if (value === "-Infinity") return -Infinity;
    return NaN;
  }

  /**
   * @deprecated
   */
  public formatter(): Unary<number, string> {
    return seriesFormatter(this.definition.format, this.measure);
  }

  public formatValue(datum: Datum, period = SeriesDerivation.CURRENT): string {
    const value = this.selectValue(datum, period);
    const formatter = seriesFormatter(this.definition.format, this.measure);
    return formatter(value);
  }

  public title(derivation = SeriesDerivation.CURRENT): string {
    return `${titleWithDerivation(this.measure, derivation)}`;
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
  }
}

/**
 * @deprecated
 * @param reference
 * @param derivation
 */
export function getNameWithDerivation(reference: string, derivation: SeriesDerivation) {
  return `${derivation}${reference}`;
}
