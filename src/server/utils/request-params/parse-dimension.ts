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

import { Request } from "express";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Dimension } from "../../../common/models/dimension/dimension";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { isNil } from "../../../common/utils/general/general";
import { InvalidRequestError } from "../request-errors/request-errors";

export function parseDimension(req: Request, dataCube: DataCube): Dimension {
  const dimensionName = req.body.dimension;

  if (isNil(dimensionName)) {
    throw new InvalidRequestError("Parameter dimension is required");
  }
  if (typeof dimensionName !== "string") {
    throw new InvalidRequestError(`Expected dimension to be a string, got: ${typeof dimensionName}`);
  }

  const dimension = findDimensionByName(dataCube.dimensions, dimensionName);

  if (isNil(dimension)) {
    throw new InvalidRequestError(`Unknown dimension: ${dimensionName}`);
  }

  return dimension;
}
