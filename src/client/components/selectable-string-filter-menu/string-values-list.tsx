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
import React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { FilterMode } from "../../../common/models/filter/filter";
import { Binary } from "../../../common/utils/functional/functional";
import { StringValue } from "./string-value";
import "./string-values-list.scss";

function filterRows(rows: unknown[], searchText: string): unknown[] {
  if (!searchText) return rows;
  const searchTextLower = searchText.toLowerCase();
  return rows.filter(d => String(d).toLowerCase().indexOf(searchTextLower) !== -1);
}

function prependPromotedValues(rows: unknown[], promoted: Set<unknown>): unknown[] {
  return [
    ...promoted,
    ...rows.filter(value => !promoted.contains(value))
    ];
}

interface RowsListProps {
  dimension: Dimension;
  dataset: Dataset;
  searchText: string;
  selectedValues: Set<unknown>;
  promotedValues: Set<unknown>;
  filterMode: FilterMode;
  onRowSelect: Binary<unknown, boolean, void>;
}

export const StringValuesList: React.FunctionComponent<RowsListProps> = props => {
  const { onRowSelect, filterMode, dataset, dimension, searchText, promotedValues, selectedValues } = props;
  const rowValues: unknown[] = dataset.data.map(d => d[dimension.name]);
  const values = prependPromotedValues(rowValues, promotedValues);
  const matchingValues = filterRows(values, searchText);
  if (searchText && matchingValues.length === 0) {
    return <div className="no-string-values">{`No results for "${searchText}"`}</div>;
  }
  const checkboxStyle = filterMode === FilterMode.EXCLUDE ? "cross" : "check";
  return <React.Fragment>
    {matchingValues.map(value => (
      <StringValue
        key={String(value)}
        value={value}
        onRowSelect={onRowSelect}
        selected={selectedValues && selectedValues.contains(value)}
        checkboxStyle={checkboxStyle}
        highlight={searchText} />))}
  </React.Fragment>;
};
