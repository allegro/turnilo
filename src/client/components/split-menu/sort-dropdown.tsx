/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as React from "react";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Dimension } from "../../../common/models/dimension/dimension";
import { SortOn } from "../../../common/models/sort-on/sort-on";
import { createSort, Sort } from "../../../common/models/split/split";
import { Unary } from "../../../common/utils/functional/functional";
import { SortDirection } from "../../../common/view-definitions/version-3/split-definition";
import { STRINGS } from "../../config/constants";
import { Dropdown } from "../dropdown/dropdown";
import { SvgIcon } from "../svg-icon/svg-icon";

export interface SortDropdownProps {
  sort: Sort;
  dimension: Dimension;
  dataCube: DataCube;
  onChange: Unary<Sort, void>;
}

export const SortDropdown: React.SFC<SortDropdownProps> = ({ dataCube, dimension, sort, onChange }) => {
  const selectedRef = dataCube.getDimension(sort.reference) || dataCube.getMeasure(sort.reference);
  const selected = new SortOn(selectedRef);
  const options = [SortOn.fromDimension(dimension)].concat(dataCube.measures.mapMeasures(SortOn.fromMeasure));

  function toggleDirection() {
    const reference = sort.reference;
    const direction = sort.direction === SortDirection.descending ? SortDirection.ascending : SortDirection.descending;
    onChange(createSort({ reference, direction }));
  }

  function selectSort(sortOn: SortOn) {
    const reference = sortOn.getName();
    const direction = sort ? sort.direction : SortDirection.descending;
    onChange(createSort({ reference, direction }));
  }

  return <div className="sort-direction">
    <Dropdown<SortOn>
      label={STRINGS.sortBy}
      items={options}
      selectedItem={selected}
      equal={SortOn.equal}
      renderItem={SortOn.getTitle}
      keyItem={SortOn.getName}
      onSelect={selectSort}
    />
    <div className={"direction " + sort.direction} onClick={toggleDirection}>
      <SvgIcon svg={require("../../icons/sort-arrow.svg")}/>
    </div>
  </div>;
};
