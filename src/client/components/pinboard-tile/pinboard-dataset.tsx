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

import { Datum } from "plywood";
import React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Unary } from "../../../common/utils/functional/functional";
import { DataRows } from "./data-rows";
import { RowMode } from "./utils/row-mode";

interface PinboardDatasetProps {
  rowMode: RowMode;
  data: Datum[];
  searchText: string;
  dimension: Dimension;
  formatter: Unary<Datum, string>;
}

function noResultsMessage(searchText?: string): string {
  return searchText ? `No results for "${searchText}"` : "No results";
}

export const PinboardDataset: React.FunctionComponent<PinboardDatasetProps> = props => {
  const { data, searchText } = props;
  const noResults = data.length === 0;
  return <div className="rows">
    {noResults ?
      <div className="message">{noResultsMessage(searchText)}</div> :
      <DataRows {...props} />
    }
  </div>;
};
