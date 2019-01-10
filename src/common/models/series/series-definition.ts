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
import { PercentageTransformation, PercentOf } from "../data-series/data-series";
import { Measure } from "../measure/measure";
import { DEFAULT_FORMAT, SeriesFormat } from "./series-format";

interface Keyed {
  key: () => string;
}

export enum SeriesDerivation { CURRENT = "", PREVIOUS = "previous", DELTA = "delta" }

export enum SeriesType { MEASURE = "measure", QUANTILE = "quantile", EXPRESSION = "expression" }

interface MeasureSeriesDefinitionValue {
  reference: string;
  type: SeriesType.MEASURE;
  format: SeriesFormat;
}

const defaultMeasureSeriesDef: MeasureSeriesDefinitionValue = {
  reference: null,
  type: SeriesType.MEASURE,
  format: DEFAULT_FORMAT
};

export class MeasureSeriesDefinition extends Record<MeasureSeriesDefinitionValue>(defaultMeasureSeriesDef) implements Keyed {
  static fromMeasure(measure: Measure) {
    return new MeasureSeriesDefinition({ reference: measure.name });
  }

  key() {
    return this.reference;
  }
}

export enum SeriesExpression { PERCENT_OF_PARENT = "percent_of_parent", PERCENT_OF_TOTAL = "percent_of_total" }

interface ExpressionSeriesDefinitionValue {
  reference: string;
  type: SeriesType.EXPRESSION;
  expression: SeriesExpression;
  format: SeriesFormat;
  operandReference?: string;
}

const defaultExpressionSeriesDef: ExpressionSeriesDefinitionValue = {
  reference: null,
  operandReference: null,
  type: SeriesType.EXPRESSION,
  expression: null,
  format: DEFAULT_FORMAT
};

export class ExpressionSeriesDefinition extends Record<ExpressionSeriesDefinitionValue>(defaultExpressionSeriesDef) implements Keyed {
  key() {
    const prefix = `expression-${this.reference}-${this.expression}`;
    if (this.operandReference) return `${prefix}-${this.operandReference}`;
    return prefix;
  }
}

export const createExpression = (measure: Measure) =>
  new ExpressionSeriesDefinition({ reference: measure.name });

export function transformationFromSeriesExpression(expression: SeriesExpression) {
  switch (expression) {
    case SeriesExpression.PERCENT_OF_TOTAL:
      return new PercentageTransformation(PercentOf.TOTAL);
    case SeriesExpression.PERCENT_OF_PARENT:
      return new PercentageTransformation(PercentOf.PARENT);
  }
}

interface QuantileSeriesDefinitionValue {
  reference: string;
  type: SeriesType.QUANTILE;
  format: SeriesFormat;
  percentile: number;
}

const defaultQuantileSeriesDef: QuantileSeriesDefinitionValue = {
  reference: null,
  type: SeriesType.QUANTILE,
  format: DEFAULT_FORMAT,
  percentile: null
};

export class QuantileSeriesDefinition extends Record<QuantileSeriesDefinitionValue>(defaultQuantileSeriesDef) implements Keyed {
  static fromMeasure(measure: Measure) {
    return new MeasureSeriesDefinition({ reference: measure.name });
  }

  key() {
    return `quantile-${this.reference}-${this.percentile}`;
  }
}

export type SeriesDefinition = MeasureSeriesDefinition | QuantileSeriesDefinition | ExpressionSeriesDefinition;

export function fromMeasure(measure: Measure): SeriesDefinition {
  return measure.isQuantile() ? new QuantileSeriesDefinition({ reference: measure.name }) : new MeasureSeriesDefinition({ reference: measure.name });
}

export function fromJS(params: any): SeriesDefinition {
  switch (params.type) {
    case SeriesType.MEASURE: {
      const { format, reference } = params as MeasureSeriesDefinitionValue;
      return new MeasureSeriesDefinition({ reference, format: new SeriesFormat(format) });
    }
    case SeriesType.QUANTILE: {
      const { percentile, format, reference } = params as QuantileSeriesDefinitionValue;
      return new QuantileSeriesDefinition({ percentile, reference, format: new SeriesFormat(format) });
    }
    case SeriesType.EXPRESSION: {
      const { expression, operandReference, format, reference } = params as ExpressionSeriesDefinitionValue;
      return new ExpressionSeriesDefinition({ reference, expression, operandReference, format: new SeriesFormat(format) });
    }
  }
  throw new Error(`Unrecognized Series Definition type: ${params.type}`);
}
