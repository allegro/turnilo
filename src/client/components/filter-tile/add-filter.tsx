/*
 * Copyright 2017-2021 Allegro.pl
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
import { Dimension } from "../../../common/models/dimension/dimension";
import { allDimensions } from "../../../common/models/dimension/dimensions";
import { Essence } from "../../../common/models/essence/essence";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { AddTile } from "../add-tile/add-tile";

interface AddFilterProps {
  appendFilter: Unary<Dimension, void>;
  menuStage: Stage;
  essence: Essence;
}

export const AddFilter: React.FunctionComponent<AddFilterProps> = props => {
  const { appendFilter, menuStage, essence: { filter, dataCube } } = props;
  const tiles = allDimensions(dataCube.dimensions)
    .filter(dimension => !filter.getClauseForDimension(dimension))
    .map(dimension => {
      return {
        key: dimension.name,
        label: dimension.title,
        value: dimension
      };
    });

  return <AddTile<Dimension>
    tiles={tiles}
    onSelect={appendFilter}
    containerStage={menuStage} />;
};
