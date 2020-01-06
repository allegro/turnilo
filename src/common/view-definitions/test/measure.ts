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

import { $, Expression } from "plywood";
import { Measure, MeasureValue } from "../../models/measure/measure";
import { Measures } from "../../models/measure/measures";
import { Omit } from "../../utils/functional/functional";

export type MeasureRefs = "count" | "sum" | "average" | "quantile" | "complex";

export const count = measure("count", $("main").count());
export const sum = measure("sum", $("main").sum($("row")));
export const avg = measure("average", $("main").average($("row")));
export const quantile = measure("quantile", $("main").quantile($("histogram"), 0.95, "tuning"));
export const complex = measure("complex", $("main").sum($("a")).divide($("b").multiply(100)));

export const measures: Measure[] = [
  count,
  sum,
  avg,
  quantile,
  complex
];

export const measuresCollection: Measures = Measures.fromMeasures(measures);

export function measure(name: MeasureRefs, expression: Expression, opts: Omit<MeasureValue, "name" | "formula"> = {}) {
  return new Measure({
    name,
    formula: expression.toString(),
    ...opts
  });
}
