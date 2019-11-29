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

import { ApplyExpression, Expression as PlywoodExpression } from "plywood";
import { ConcreteExpression } from "../expression/expression";
import { Measure } from "../measure/measure";
import { Measures } from "../measure/measures";
import { ConcreteSeries, SeriesDerivation } from "./concrete-series";
import { ExpressionSeries } from "./expression-series";

export class ExpressionConcreteSeries extends ConcreteSeries<ExpressionSeries> {

  private expression: ConcreteExpression;

  constructor(series: ExpressionSeries, measure: Measure, measures: Measures) {
    super(series, measure);
    this.expression = this.definition.expression.toConcreteExpression(measures);
  }

  reactKey(derivation?: SeriesDerivation): string {
    return `${super.reactKey(derivation)}-${this.definition.expression.key()}`;
  }

  title(derivation?: SeriesDerivation): string {
    return `${super.title(derivation)} ${this.expression.title()}`;
  }

  protected applyExpression(expression: PlywoodExpression, name: string, nestingLevel: number): ApplyExpression {
    return this.expression.toExpression(expression, name, nestingLevel);
  }
}
