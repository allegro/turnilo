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
import { Omit, Unary } from "../../../common/utils/functional/functional";
import { SelectableRows } from "./selectable-rows";
import { TextRows } from "./text-rows";
import { EditState, InEditMode, ReadyToEditMode, RowMode, RowModeId } from "./utils/row-mode";

interface DataRowsProps {
  rowMode: RowMode;
  data: Datum[];
  searchText: string;
  dimension: Dimension;
  formatter: Unary<Datum, string>;
}

type EditableRowsProps = { rowMode: ReadyToEditMode | InEditMode } & Omit<DataRowsProps, "mode">;

// This component is for guiding typescript through nested tagged union. Probably it could be inlined on ts 3.7
const EditableRows: React.FunctionComponent<EditableRowsProps> = props => {
  const { rowMode, ...commonProps } = props;
  switch (rowMode.state) {
    case EditState.READY:
      return <TextRows
        {...commonProps}
        onClick={rowMode.createClause} />;
    case EditState.IN_EDIT:
      return <SelectableRows
        {...commonProps}
        clause={rowMode.clause}
        onSelect={rowMode.toggleValue} />;
  }
};

export const DataRows: React.FunctionComponent<DataRowsProps> = ({ rowMode, ...commonProps }) => {
  switch (rowMode.mode) {
    case RowModeId.READONLY:
      return <TextRows {...commonProps} />;
    case RowModeId.EDITABLE:
      return <EditableRows {...commonProps} rowMode={rowMode}/>;
  }
};
