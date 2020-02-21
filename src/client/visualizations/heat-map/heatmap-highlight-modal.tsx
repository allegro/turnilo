/*
 * Copyright 2017-2019 Allegro.pl
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

import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { HighlightModal } from "../../components/highlight-modal/highlight-modal";
import { ScrollerLayout } from "../../components/scroller/scroller";
import { TILE_GAP, TILE_SIZE } from "./labeled-heatmap";
import { HighlightPosition } from "./utils/get-highlight-position";

interface HeatmapHighlightModalProps {
  title: string;
  stage: Stage;
  layout: ScrollerLayout;
  scroll: { left: number, top: number };
  position: HighlightPosition;
  dropHighlight: Fn;
  acceptHighlight: Fn;
}

function calculateLeft(props: HeatmapHighlightModalProps): number {
  const { position: { column }, layout, stage, scroll } = props;
  if (column === null) return stage.x + (stage.width / 2);
  return column * TILE_SIZE + TILE_GAP + layout.left + 20 + stage.x - scroll.left;
}

function calculateTop(props: HeatmapHighlightModalProps): number {
  const { position: { row }, layout, stage, scroll } = props;
  if (row === null) return stage.y + (stage.height / 2);
  return row * TILE_SIZE + layout.top + stage.y - 5 - scroll.top;
}

export const HeatmapHighlightModal: React.SFC<HeatmapHighlightModalProps> = props => {
  const { title, children, acceptHighlight, dropHighlight } = props;
  return <HighlightModal
    title={title}
    left={calculateLeft(props)}
    top={calculateTop(props)}
    dropHighlight={dropHighlight}
    acceptHighlight={acceptHighlight}>
    {children}
  </HighlightModal>;
};
