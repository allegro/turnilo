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

import { RefExpression } from "plywood";
import { DataCube } from "../../models/data-cube/data-cube";
import { Dimensions } from "../../models/dimension/dimensions";
import { dimensions, timeDimension } from "./dimension";
import { measuresCollection } from "./measure";

export const dataCube = new DataCube({
  clusterName: "druid",
  dimensions: Dimensions.fromDimensions(dimensions),
  measures: measuresCollection,
  name: "fixture",
  source: "custom",
  timeAttribute: timeDimension.expression as RefExpression
});
