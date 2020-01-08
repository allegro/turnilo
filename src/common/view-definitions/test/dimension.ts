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

import { Dimension, DimensionKind, DimensionValue } from "../../models/dimension/dimension";
import { Omit } from "../../utils/functional/functional";

export type DimensionRefs = "string_a" | "string_b" | "time" | "numeric" | "boolean";

export const timeDimension = dimension("time", "time");

export const dimensions: Dimension[] = [
  timeDimension,
  dimension("numeric", "number"),
  dimension("string_a", "string"),
  dimension("string_b", "string"),
  dimension("boolean", "boolean")
];

function dimension(name: DimensionRefs, kind: DimensionKind, opts: Omit<DimensionValue, "name" | "kind"> = {}) {
  return new Dimension({
    name,
    kind,
    ...opts
  });
}
