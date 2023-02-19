/*
 * Copyright 2017-2022 Allegro.pl
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

import { ExpressionSeriesOperation } from "../expression/expression";
import { ExpressionSeries } from "./expression-series";
import { Series } from "./series";
import { SeriesType } from "./series-type";

function usedMeasuresInExpressionSeries(series: ExpressionSeries): string[] {
  switch (series.expression.operation) {
    case ExpressionSeriesOperation.PERCENT_OF_PARENT:
    case ExpressionSeriesOperation.PERCENT_OF_TOTAL:
      return [series.reference];
    case ExpressionSeriesOperation.ADD:
    case ExpressionSeriesOperation.SUBTRACT:
    case ExpressionSeriesOperation.MULTIPLY:
    case ExpressionSeriesOperation.DIVIDE:
      return [series.reference, series.expression.reference];
  }
}

export function usedMeasures(series: Series): string[] {
  switch (series.type) {
    case SeriesType.MEASURE:
      return [series.reference];
    case SeriesType.EXPRESSION:
      return usedMeasuresInExpressionSeries(series);
    case SeriesType.QUANTILE:
      return [series.reference];
  }
}
