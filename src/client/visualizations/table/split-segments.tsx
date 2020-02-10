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
import { ROW_HEIGHT } from "./table";

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

  const [start, end] = visibleRows;
  const visibleData = data.slice(start, end);

  return <div className="split-segment-labels">
    {visibleData.map((data, i) => {
      const idx = start + i;
      const y = idx * ROW_HEIGHT;

      const hovered = data === hoverRow;
      const selected = idx === selectedIdx;
      const dimmed = !selected && selectedIdx !== null;
      const highlight = selected || hovered;

      const segmentStyle = { width: segmentWidth, top: y };

      return <div key={`segment_${idx}`}
        className={classNames("segments-row", { highlight, dimmed })}
        style={segmentStyle}>
        {splits.map(split => {
          const { reference } = split;
          const value = data[reference];
          return <div key={reference} className="segment-value">{String(value)}</div>;
        })}
      </div>;
    })}
  </div>;
};
