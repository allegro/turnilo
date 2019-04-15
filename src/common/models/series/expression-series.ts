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
import { RequireOnly } from "../../utils/functional/functional";
import { Expression, fromJS } from "../expression/expression";
import { Measure } from "../measure/measure";
import { getNameWithDerivation, SeriesDerivation } from "./concrete-series";
import { BasicSeriesValue, SeriesBehaviours } from "./series";
import { DEFAULT_FORMAT, SeriesFormat } from "./series-format";
import { SeriesType } from "./series-type";

interface ExpressionSeriesValue extends BasicSeriesValue {
  type: SeriesType.EXPRESSION;
  reference: string;
  expression: Expression;
  format: SeriesFormat;
}

const defaultSeries: ExpressionSeriesValue = {
  reference: null,
  format: DEFAULT_FORMAT,
  type: SeriesType.EXPRESSION,
  expression: null
};

export class ExpressionSeries extends Record<ExpressionSeriesValue>(defaultSeries) implements SeriesBehaviours {

  static fromMeasure({ name }: Measure) {
    return new ExpressionSeries({ reference: name, expression: null });
  }

  static fromJS(params: any) {
    const expression = fromJS(params.expression);
    return new ExpressionSeries({ ...params, expression });
  }

  constructor(params: RequireOnly<ExpressionSeriesValue, "reference" | "expression">) {
    super(params);
  }

  key() {
    return `${this.reference}__${this.expression.key()}`;
  }

  plywoodKey(period = SeriesDerivation.CURRENT): string {
    return getNameWithDerivation(this.key(), period);
  }
}
