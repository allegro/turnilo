/*
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

import { Set } from "immutable";
import { Dataset } from "plywood";
import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { FilterMode } from "../../../common/models/filter/filter";
import { Binary } from "../../../common/utils/functional/functional";
import { StringValue } from "./string-value";
import "./string-values-list.scss";

function filterRows<T>(rows: T[], searchText: string): T[] {
  if (!searchText) return rows;
  const searchTextLower = searchText.toLowerCase();
  return rows.filter(d => String(d).toLowerCase().indexOf(searchTextLower) !== -1);
}

interface RowsListProps {
  dimension: Dimension;
  dataset: Dataset;
  searchText: string;
  limit: number;
  selectedValues: Set<unknown>;
  promotedValues: Set<unknown>;
  filterMode: FilterMode;
  onRowSelect: Binary<unknown, boolean, void>;
}

function sortRows<T>(rows: T[], promoted: Set<T>): T[] {
  return rows.sort((a, b) => {
    if (promoted.has(a) && !promoted.has(b)) return -1;
    if (!promoted.has(a) && promoted.has(b)) return 1;
    return 0;
  });
}

export const StringValuesList: React.SFC<RowsListProps> = props => {
  const { onRowSelect, filterMode, dataset, dimension, searchText, limit, promotedValues, selectedValues } = props;
  const rows = dataset.data.slice(0, limit).map(d => d[dimension.name] as string);
  const matchingRows = filterRows(rows, searchText);
  if (searchText && matchingRows.length === 0) {
    return <div className="no-string-values">{`No results for "${searchText}"`}</div>;
  }
  const sortedRows = sortRows(matchingRows, promotedValues);
  const checkboxStyle = filterMode === FilterMode.EXCLUDE ? "cross" : "check";
  return <React.Fragment>
    {sortedRows.map(value => (
      <StringValue
        key={String(value)}
        value={value}
        onRowSelect={onRowSelect}
        selected={selectedValues && selectedValues.contains(value)}
        checkboxStyle={checkboxStyle}
        highlight={searchText} />))}
  </React.Fragment>;
};
