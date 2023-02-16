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

import { $ } from "plywood";
import { createDimension } from "../../models/dimension/dimension";
import { Dimensions } from "../../models/dimension/dimensions";
import { DimensionsFixtures } from "../../models/dimension/dimensions.fixtures";

export const timeDimension = createDimension("time", "time", $("time"));

export const dimensions: Dimensions = DimensionsFixtures.fromDimensions([
  timeDimension,
  createDimension("number", "numeric", $("numeric")),
  createDimension("string", "string_a", $("string_a")),
  createDimension("string", "string_b", $("string_b")),
  createDimension("boolean", "boolean", $("boolean"))
]);
