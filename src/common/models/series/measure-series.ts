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
import { RequireOnly } from "../../utils/functional/functional";
import { Measure } from "../measure/measure";
import { getNameWithDerivation, SeriesDerivation } from "./concrete-series";
import { BasicSeriesValue, SeriesBehaviours } from "./series";
import { DEFAULT_FORMAT, SeriesFormat } from "./series-format";
import { SeriesType } from "./series-type";

interface MeasureSeriesValue extends BasicSeriesValue {
  type: SeriesType.MEASURE;
  reference: string;
  format: SeriesFormat;
}

const defaultMeasureSeries: MeasureSeriesValue = {
  reference: null,
  format: DEFAULT_FORMAT,
  type: SeriesType.MEASURE
};

export class MeasureSeries extends Record<MeasureSeriesValue>(defaultMeasureSeries) implements SeriesBehaviours {
  static fromMeasure(measure: Measure) {
    return new MeasureSeries({ reference: measure.name });
  }

  static fromJS({ reference, format, type }: any) {
    return new MeasureSeries({ reference, type, format: SeriesFormat.fromJS(format) });
  }

  constructor(params: RequireOnly<MeasureSeriesValue, "reference">) {
    super(params);
  }

  key() {
    return this.reference;
  }

  plywoodKey(derivation = SeriesDerivation.CURRENT): string {
    return getNameWithDerivation(this.reference, derivation);
  }
}
