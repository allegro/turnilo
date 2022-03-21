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
import React from "react";
import { SPACE_LEFT } from "../dimensions";
import { VisibleRows } from "../visible-rows/visible-rows";
import "./flattened-splits.scss";
import { SplitValue } from "./split-value";

export interface SplitLabelProps {
  datum: Datum;
}

interface FlattenedSplitsProps {
  visibleRowsIndexRange: [number, number];
  data: PseudoDatum[];
  hoverRow?: Datum;
  segmentWidth: number;
  highlightedRowIndex: number | null;
  splitLabel: React.ComponentType<SplitLabelProps>;
}

export const FlattenedSplits: React.FunctionComponent<FlattenedSplitsProps> = props => {
  const { splitLabel: SplitLabel, data, highlightedRowIndex, hoverRow, visibleRowsIndexRange, segmentWidth } = props;

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
          <SplitLabel datum={datum} />
        </SplitValue>;
      }} />
  </div>;
};
