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
import { Essence } from "../../../../../common/models/essence/essence";
import { INDENT_WIDTH } from "../../table";
import { VisibleRows } from "../../utils/visible-rows";
import { nestedSplitName } from "./nested-split-name";
import "./nested-splits.scss";
import { SplitValue } from "./split-value";

interface NestedSplitsProps {
  visibleRowsIndexRange: [number, number];
  essence: Essence;
  data: PseudoDatum[];
  hoverRow?: Datum;
  segmentWidth: number;
  highlightedRowIndex: number | null;
}

export const NestedSplits: React.SFC<NestedSplitsProps> = props => {
  const { essence, data, highlightedRowIndex, hoverRow, visibleRowsIndexRange, segmentWidth } = props;

  return <div className="nested-splits-rows">
    <VisibleRows
      hoveredRowDatum={hoverRow}
      visibleRowsIndexRange={visibleRowsIndexRange}
      highlightedRowIndex={highlightedRowIndex}
      rowsData={data}
      renderRow={props => {
        const { index, top, datum, highlight, dimmed } = props;
        const nest = datum.__nest;
        const left = Math.max(0, nest - 1) * INDENT_WIDTH;
        const segmentStyle = { left, width: segmentWidth - left, top };

        return <SplitValue
          key={`segment_${index}`}
          highlight={highlight}
          dimmed={dimmed}
          style={segmentStyle}>
          {nestedSplitName(datum, essence)}
        </SplitValue>;
      }} />
  </div>;
};
