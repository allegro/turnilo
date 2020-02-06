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
import { Essence } from "../../../common/models/essence/essence";
import { MeasureRow } from "./measure-row";
import { ROW_HEIGHT } from "./table";

interface MeasureRowsProps {
  visibleRows: [number, number];
  essence: Essence;
  selectedIdx: number | null;
  scales: Array<d3.scale.Linear<number, number>>;
  data: PseudoDatum[];
  hoverRow?: Datum;
  cellWidth: number;
  rowWidth: number;
}

export const MeasureRows: React.SFC<MeasureRowsProps> = props => {
  const { rowWidth, essence, cellWidth, hoverRow, scales, data, visibleRows, selectedIdx } = props;

  const [start, end] = visibleRows;
  const visibleData = data.slice(start, end);

  return <React.Fragment>
    {visibleData.map((data, i) => {
      const idx = start + i;
      const top = idx * ROW_HEIGHT;
      const selected = idx === selectedIdx;
      const otherSelected = !selected && selectedIdx !== null;
      const hovered = data === hoverRow;

      const highlight = selected || hovered;
      const rowStyle: React.CSSProperties = { top, width: rowWidth };

      return <MeasureRow
        cellWidth={cellWidth}
        key={`row_${idx}`}
        essence={essence}
        highlight={highlight}
        dimmed={otherSelected}
        style={rowStyle}
        datum={data}
        scales={scales} />;
    })}
  </React.Fragment>;
};
