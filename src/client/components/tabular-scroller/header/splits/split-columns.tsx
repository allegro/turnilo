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
import { DimensionSort, Sort, SortDirection } from "../../../../../common/models/sort/sort";
import { Split } from "../../../../../common/models/split/split";
import { Splits } from "../../../../../common/models/splits/splits";
import { Corner } from "../../corner/corner";
import { SortIcon } from "../../sort-icon/sort-icon";
import "./split-columns.scss";

interface SplitColumnsHeader {
  dataCube: ClientDataCube;
  sort?: Sort;
  splits: Splits;
}

function sortDirection(split: Split, sort: Sort): SortDirection | null {
  const isCurrentSort = sort instanceof DimensionSort && split.reference === sort.reference;
  return isCurrentSort ? sort.direction : null;
}

export const SplitColumnsHeader: React.FunctionComponent<SplitColumnsHeader> = ({ sort, splits, dataCube }) => {
  return <Corner>
    <div className="header-split-columns">
      {splits.splits.toArray().map(split => {
        const { reference } = split;
        const title = findDimensionByName(dataCube.dimensions, reference).title;
        const direction = sortDirection(split, sort);
        return <div className="header-split-column" key={reference}>
          <div className="header-split-column-title">{title}</div>
          {direction && <div className="header-split-column-sort-icon">
            <SortIcon direction={direction} />
          </div>}
        </div>;
      })}
    </div>
  </Corner>;
};
