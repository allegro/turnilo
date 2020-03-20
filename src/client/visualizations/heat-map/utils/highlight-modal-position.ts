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

import { HeatmapHighlightModalProps } from "../heatmap-highlight-modal";
import { TILE_GAP, TILE_SIZE } from "../labeled-heatmap";

export type CoordinatesProps = Pick<HeatmapHighlightModalProps, "position" | "layout" | "stage" | "scroll">;

export function calculateLeft(props: CoordinatesProps): number {
  const { position: { column }, layout, stage, scroll } = props;
  if (column !== null) {
    return column * TILE_SIZE + TILE_GAP + layout.left + 20 + stage.x - scroll.left;
  }
  return stage.x + Math.min(stage.width / 2, layout.left + (layout.bodyWidth / 2));
}

export function calculateTop(props: CoordinatesProps): number {
  const { position: { row }, layout, stage, scroll } = props;
  if (row !== null) {
    return row * TILE_SIZE + layout.top + stage.y - 5 - scroll.top;
  }
  return stage.y + Math.min(stage.height / 2, layout.top + (layout.bodyHeight / 2));
}
