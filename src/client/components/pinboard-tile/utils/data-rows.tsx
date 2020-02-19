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
import * as React from "react";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Unary } from "../../../../common/utils/functional/functional";
import { SelectableRows } from "../selectable-rows";
import { TextRows } from "../text-rows";
import { EditMode, RowsMode } from "./edit-mode";

interface DataRowsProps {
  editMode: EditMode;
  data: Datum[];
  searchText: string;
  dimension: Dimension;
  formatter: Unary<Datum, string>;
}

export const DataRows: React.SFC<DataRowsProps> = props => {
  const { editMode, data, dimension, searchText, formatter  } = props;

  switch (editMode.id) {
    case RowsMode.EDITABLE:
      return <TextRows
        data={data}
        dimension={dimension}
        formatter={formatter}
        onClick={editMode.createClause}
        searchText={searchText} />;
    case RowsMode.IN_EDIT:
      return <SelectableRows
        data={data}
        dimension={dimension}
        formatter={formatter}
        clause={editMode.clause}
        searchText={searchText}
        onSelect={editMode.toggleValue}/>;
    case RowsMode.NOT_EDITABLE:
      return <TextRows
        data={data}
        dimension={dimension}
        formatter={formatter}
        searchText={searchText} />;
  }
};
