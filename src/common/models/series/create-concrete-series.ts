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

import { Measure } from "../measure/measure";
import { Measures } from "../measure/measures";
import { ConcreteSeries } from "./concrete-series";
import { ExpressionConcreteSeries } from "./expression-concrete-series";
import { ExpressionSeries } from "./expression-series";
import { MeasureConcreteSeries } from "./measure-concrete-series";
import { MeasureSeries } from "./measure-series";
import { QuantileConcreteSeries } from "./quantile-concrete-series";
import { QuantileSeries } from "./quantile-series";
import { Series } from "./series";
import { SeriesType } from "./series-type";

export default function createConcreteSeries(series: Series, measure: Measure, measures: Measures): ConcreteSeries {
  switch (series.type) {
    case SeriesType.MEASURE: {
      return new MeasureConcreteSeries(series as MeasureSeries, measure);
    }
    case SeriesType.EXPRESSION: {
      return new ExpressionConcreteSeries(series as ExpressionSeries, measure, measures);
    }
    case SeriesType.QUANTILE: {
      return new QuantileConcreteSeries(series as QuantileSeries, measure);
    }
  }
}
