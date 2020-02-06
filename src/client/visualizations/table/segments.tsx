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
import { Segment } from "./segment";
import { segmentName } from "./segment-name";
import "./segments.scss";
import { INDENT_WIDTH, ROW_HEIGHT } from "./table";

interface SegmentsProps {
  visibleRows: [number, number];
  essence: Essence;
  data: PseudoDatum[];
  hoverRow?: Datum;
  segmentWidth: number;
  selectedIdx: number | null;
}

export const Segments: React.SFC<SegmentsProps> = props => {
  const { essence, data, selectedIdx, hoverRow, visibleRows, segmentWidth } = props;

  const [start, end] = visibleRows;
  const visibleData = data.slice(start, end);

  return <div className="segment-labels">
    {visibleData.map((data, i) => {
      const idx = start + i;
      const y = idx * ROW_HEIGHT;
      const nest = data.__nest;

      const hovered = data === hoverRow;
      const selected = idx === selectedIdx;
      const otherSelected = !selected && selectedIdx !== null;

      const left = Math.max(0, nest - 1) * INDENT_WIDTH;
      const segmentStyle = { left, width: segmentWidth - left, top: y };

      const highlight = selected || hovered;

      return <Segment
        key={`segment_${idx}`}
        highlight={highlight}
        dimmed={otherSelected}
        style={segmentStyle}>
        {segmentName(data, essence)}
      </Segment>;
    })}
  </div>;
};
