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

import * as d3 from "d3";
import { Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { VisibleRows } from "../../utils/visible-rows";
import { MeasureRow } from "./measure-row";

interface MeasureRowsProps {
  visibleRowsIndexRange: [number, number];
  essence: Essence;
  highlightedRowIndex: number | null;
  scales: Array<d3.scale.Linear<number, number>>;
  data: PseudoDatum[];
  hoverRow?: Datum;
  cellWidth: number;
  rowWidth: number;
}

export const MeasureRows: React.SFC<MeasureRowsProps> = props => {
  const { rowWidth, essence, cellWidth, hoverRow, scales, data, visibleRowsIndexRange, highlightedRowIndex } = props;

  return <VisibleRows
    visibleRowsIndexRange={visibleRowsIndexRange}
    highlightedRowIndex={highlightedRowIndex}
    hoveredRowDatum={hoverRow}
    rowsData={data}
    renderRow={props => {
      const { index, top, datum, highlight, dimmed } = props;
      const rowStyle: React.CSSProperties = { top, width: rowWidth };

      return <MeasureRow
        key={`row_${index}`}
        essence={essence}
        highlight={highlight}
        dimmed={dimmed}
        style={rowStyle}
        datum={datum}
        cellWidth={cellWidth}
        scales={scales} />;
    }} />;
};
