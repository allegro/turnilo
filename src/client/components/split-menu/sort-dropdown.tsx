/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as React from "react";
import { SortOn } from "../../../common/models/sort-on/sort-on";
import { Sort, SortDirection } from "../../../common/models/sort/sort";
import { Unary } from "../../../common/utils/functional/functional";
import { STRINGS } from "../../config/constants";
import { Dropdown } from "../dropdown/dropdown";
import { SvgIcon } from "../svg-icon/svg-icon";

export interface SortDropdownProps {
  direction: SortDirection;
  selected: SortOn;
  options: SortOn[];
  onChange: Unary<Sort, void>;
}

export const SortDropdown: React.SFC<SortDropdownProps> = ({ direction, options, selected, onChange }) => {

  function toggleDirection() {
    const newDirection = direction === SortDirection.descending ? SortDirection.ascending : SortDirection.descending;
    onChange(selected.toSort(newDirection));
  }

  function selectSort(sortOn: SortOn) {
    onChange(sortOn.toSort(direction));
  }

  return <div className="sort-direction">
    <Dropdown<SortOn>
      label={STRINGS.sortBy}
      items={options}
      selectedItem={selected}
      equal={SortOn.equals}
      renderItem={SortOn.getTitle}
      keyItem={SortOn.getKey}
      onSelect={selectSort}
    />
    <div className={"direction " + direction} onClick={toggleDirection}>
      <SvgIcon svg={require("../../icons/sort-arrow.svg")} />
    </div>
  </div>;
};
