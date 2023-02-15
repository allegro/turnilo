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

import { Record } from "immutable";
import { QuantileExpression } from "plywood";
import { RequireOnly } from "../../utils/functional/functional";
import { Measure } from "../measure/measure";
import { getNameWithDerivation, SeriesDerivation } from "./concrete-series";
import { SeriesBehaviours } from "./series";
import { DEFAULT_FORMAT, SeriesFormat } from "./series-format";
import { SeriesType } from "./series-type";

interface QuantileSeriesValue {
  type: SeriesType.QUANTILE;
  reference: string;
  format: SeriesFormat;
  percentile: number;
}

const defaultQuantileSeries: QuantileSeriesValue = {
  format: DEFAULT_FORMAT,
  percentile: 95,
  reference: null,
  type: SeriesType.QUANTILE
};

export class QuantileSeries extends Record<QuantileSeriesValue>(defaultQuantileSeries) implements SeriesBehaviours {

  static fromJS({ type, reference, percentile, format }: any): QuantileSeries {
    return new QuantileSeries({
      type,
      reference,
      percentile,
      format: SeriesFormat.fromJS(format)
    });
  }

  static fromQuantileMeasure({ name: reference, expression }: Measure) {
    if (!(expression instanceof QuantileExpression)) throw new Error(`Expected QuantileExpression, got ${expression}`);
    return new QuantileSeries({
      reference,
      percentile: expression.value * 100
    });
  }

  constructor(params: RequireOnly<QuantileSeriesValue, "percentile" | "reference">) {
    super(params);
  }

  public formattedPercentile(): string {
    return this.percentile.toString();
  }

  key() {
    return `${this.reference}__p${this.formattedPercentile()}`;
  }

  plywoodKey(derivation = SeriesDerivation.CURRENT): string {
    return getNameWithDerivation(this.key(), derivation);
  }
}
