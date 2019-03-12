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

import { ExpressionSeries } from "./expression-series";
import { MeasureSeries } from "./measure-series";
import { SeriesType } from "./series-type";

export interface BasicSeriesValue {
  type: SeriesType;
}

export interface SeriesBehaviours {
  key: () => string;
}

export type Series = MeasureSeries | ExpressionSeries;

export function fromJS(params: any): Series {
  const { type } = params;
  switch (type as SeriesType) {
    case SeriesType.EXPRESSION:
      return new ExpressionSeries(params);
    case SeriesType.MEASURE:
      return new MeasureSeries(params);
  }
}
