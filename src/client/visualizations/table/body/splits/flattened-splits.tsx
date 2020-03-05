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
import { SPACE_LEFT } from "../../table";
import { VisibleRows } from "../../utils/visible-rows";
import { FlattenedSplitColumns } from "./flattened-split-columns";
import "./flattened-splits.scss";
import { SplitValue } from "./split-value";

interface FlattenedSplitsProps {
  visibleRowsIndexRange: [number, number];
  essence: Essence;
  data: PseudoDatum[];
  hoverRow?: Datum;
  segmentWidth: number;
  highlightedRowIndex: number | null;
}

export const FlattenedSplits: React.SFC<FlattenedSplitsProps> = props => {
  const { essence, data, highlightedRowIndex, hoverRow, visibleRowsIndexRange, segmentWidth } = props;
  const { splits: { splits }, timezone } = essence;

  return <div className="flattened-splits-rows">
    <VisibleRows
      visibleRowsIndexRange={visibleRowsIndexRange}
      highlightedRowIndex={highlightedRowIndex}
      rowsData={data}
      hoveredRowDatum={hoverRow}
      renderRow={props => {
        const { index, top, datum, highlight, dimmed } = props;
        const segmentStyle = { width: segmentWidth - SPACE_LEFT, top };

        return <SplitValue
          key={`splits_${index}`}
          className="flattened-splits-row"
          style={segmentStyle}
          dimmed={dimmed}
          highlight={highlight}>
          <FlattenedSplitColumns splits={splits} datum={datum} timezone={timezone} />
        </SplitValue>;
      }} />
  </div>;
};
