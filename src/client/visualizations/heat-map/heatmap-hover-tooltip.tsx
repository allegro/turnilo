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

import { TooltipWithBounds } from "@visx/tooltip";
import { Datum } from "plywood";
import React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { SegmentBubbleContent } from "../../components/segment-bubble/segment-bubble";
import { SeriesBubbleContent } from "../../components/series-bubble-content/series-bubble-content";
import datumByPosition from "./utils/datum-by-position";
import { HoverPosition } from "./utils/get-hover-position";
import { modalTitle } from "./utils/modal-title";

interface HeatmapHoverTooltip {
  dataset: Datum[];
  position: HoverPosition;
  essence: Essence;
  scroll: { left: number, top: number };
}

export const HeatmapHoverTooltip: React.FunctionComponent<HeatmapHoverTooltip> = props => {
  const { dataset, essence, scroll, position: { column, row, top, left } } = props;
  const [, datum] = datumByPosition(dataset, { row, column });
  if (!datum) return null;

  const series = essence.getConcreteSeries().first();
  return <TooltipWithBounds
    key={`${row}-${column}`}
    top={top - scroll.top}
    left={left - scroll.left}>
    <SegmentBubbleContent
      title={modalTitle({ row, column }, dataset, essence)}
      content={<SeriesBubbleContent
        datum={datum}
        showPrevious={essence.hasComparison()}
        series={series} />}
    />
  </TooltipWithBounds>;
};
