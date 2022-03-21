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

import React from "react";
import { ClientDataCube } from "../../../../../common/models/data-cube/data-cube";
import { findDimensionByName } from "../../../../../common/models/dimension/dimensions";
import { Splits } from "../../../../../common/models/splits/splits";
import { Corner } from "../../../../components/tabular-scroller/corner/corner";

interface CombinedSplitsTitle {
  dataCube: ClientDataCube;
  splits: Splits;
}

export const CombinedSplitsTitle: React.FunctionComponent<CombinedSplitsTitle> = ({ dataCube, splits: { splits } }) => {
  const title = splits.map(split => findDimensionByName(dataCube.dimensions, split.reference).title).join(", ");
  return <Corner>{title}</Corner>;
};
