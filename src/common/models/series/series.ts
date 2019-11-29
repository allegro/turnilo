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

import { QuantileExpression } from "plywood";
import { isTruthy } from "../../utils/general/general";
import { Measure } from "../measure/measure";
import { SeriesDerivation } from "./concrete-series";
import { ExpressionSeries } from "./expression-series";
import { MeasureSeries } from "./measure-series";
import { QuantileSeries } from "./quantile-series";
import { SeriesType } from "./series-type";

export interface BasicSeriesValue {
  type: SeriesType;
}

export interface SeriesBehaviours {
  key: () => string;
  plywoodKey: (period?: SeriesDerivation) => string;
}

export type Series = MeasureSeries | ExpressionSeries | QuantileSeries;

export function fromMeasure(measure: Measure): MeasureSeries | QuantileSeries {
  if (measure.expression instanceof QuantileExpression) {
    return QuantileSeries.fromQuantileMeasure(measure);
  }
  return MeasureSeries.fromMeasure(measure);
}

function inferTypeAndConstruct({ expression }: Measure, params: any): MeasureSeries | QuantileSeries {
  if (expression instanceof QuantileExpression) {
    return QuantileSeries.fromJS({ ...params, type: SeriesType.QUANTILE });
  }
  return MeasureSeries.fromJS({ ...params, type: SeriesType.MEASURE });
}

export function fromJS(params: any, measure: Measure): Series {
  const { type } = params;
  if (!isTruthy(type)) return inferTypeAndConstruct(measure, params);
  switch (type as SeriesType) {
    case SeriesType.MEASURE:
      return inferTypeAndConstruct(measure, params);
    case SeriesType.EXPRESSION:
      return ExpressionSeries.fromJS(params);
    case SeriesType.QUANTILE:
      return QuantileSeries.fromJS(params);
  }
}
