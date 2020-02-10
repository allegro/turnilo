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

import { Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import { ROW_HEIGHT } from "./table";

interface RowProps {
  highlight: boolean;
  dimmed: boolean;
  top: number;
  index: number;
  datum: PseudoDatum;
}

interface VisibleRowsProps {
  visibleRowsIndexes: [number, number];
  selectedRowIndex: number | null;
  rowsData: PseudoDatum[];
  hoveredRowDatum?: Datum;
  renderRow: Unary<RowProps, JSX.Element>;
}

export const VisibleRows: React.SFC<VisibleRowsProps> = props => {
  const { renderRow, hoveredRowDatum, rowsData, visibleRowsIndexes, selectedRowIndex } = props;

  const [start, end] = visibleRowsIndexes;
  const visibleData = rowsData.slice(start, end);

  return <React.Fragment>
    {visibleData.map((datum, i) => {
      const index = start + i;
      const top = index * ROW_HEIGHT;
      const selected = index === selectedRowIndex;
      const dimmed = !selected && selectedRowIndex !== null;
      const hovered = datum === hoveredRowDatum;

      const highlight = selected || hovered;

      const rowProps: RowProps = {
        highlight,
        dimmed,
        top,
        index,
        datum
      };

      return renderRow(rowProps);
    })}
  </React.Fragment>;
};
