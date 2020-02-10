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
import { Essence } from "../../../common/models/essence/essence";
import { classNames } from "../../utils/dom/dom";
import "./split-segments.scss";
import { VisibleRows } from "./visible-rows";

interface SplitSegmentsProps {
  visibleRows: [number, number];
  essence: Essence;
  data: PseudoDatum[];
  hoverRow?: Datum;
  segmentWidth: number;
  selectedIdx: number | null;
}

export const SplitSegments: React.SFC<SplitSegmentsProps> = props => {
  const { essence, data, selectedIdx, hoverRow, visibleRows, segmentWidth } = props;
  const { splits: { splits } } = essence;

  return <div className="split-segment-labels">
    <VisibleRows
      visibleRowsIndexes={visibleRows}
      selectedRowIndex={selectedIdx}
      rowsData={data}
      hoveredRowDatum={hoverRow}
      renderRow={props => {
        const { index, top, datum, highlight, dimmed } = props;
        const segmentStyle = { width: segmentWidth, top };

        return <div key={`segment_${index}`}
                    className={classNames("segments-row", { highlight, dimmed })}
                    style={segmentStyle}>
          {splits.map(split => {
            const { reference } = split;
            const value = datum[reference];
            return <div key={reference} className="segment-value">{String(value)}</div>;
          })}
        </div>;
      }} />
  </div>;
};
