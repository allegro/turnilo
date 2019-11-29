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

import { ApplyExpression, Expression as PlywoodExpression, QuantileExpression } from "plywood";
import { Measure } from "../measure/measure";
import { ConcreteSeries, SeriesDerivation } from "./concrete-series";
import { QuantileSeries } from "./quantile-series";

export class QuantileConcreteSeries extends ConcreteSeries<QuantileSeries> {

  constructor(series: QuantileSeries, measure: Measure) {
    super(series, measure);
  }

  title(derivation?: SeriesDerivation): string {
    return `${super.title(derivation)} p${this.definition.formattedPercentile()}`;
  }

  protected applyExpression(quantileExpression: PlywoodExpression, name: string, nestingLevel: number): ApplyExpression {
    if (!(quantileExpression instanceof QuantileExpression)) throw new Error(`Expected QuantileExpression, got ${quantileExpression}`);
    const expression = new QuantileExpression({ ...quantileExpression.valueOf(), value: this.definition.percentile / 100 });
    return new ApplyExpression({ name, expression });
  }
}
