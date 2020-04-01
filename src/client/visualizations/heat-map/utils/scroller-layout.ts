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

import { Datum } from "plywood";
import { ScrollerLayout } from "../../../components/scroller/scroller";
import { clamp } from "../../../utils/dom/dom";
import { MAX_LEFT_LABELS_WIDTH, MAX_TOP_LABELS_HEIGHT, MIN_LEFT_LABELS_WIDTH, MIN_TOP_LABELS_HEIGHT, TILE_SIZE } from "../labeled-heatmap";
import { nestedDataset } from "./nested-dataset";

export default function scrollerLayout(dataset: Datum[], topLabelsHeight: number, leftLabelsWidth: number): ScrollerLayout {
  const top =  clamp(topLabelsHeight, MIN_TOP_LABELS_HEIGHT, MAX_TOP_LABELS_HEIGHT);
  const left =  clamp(leftLabelsWidth, MIN_LEFT_LABELS_WIDTH, MAX_LEFT_LABELS_WIDTH);
  const height = dataset.length * TILE_SIZE;
  const width = nestedDataset(dataset[0]).length * TILE_SIZE;

  return {
    bodyHeight: height,
    bodyWidth: width,
    top,
    left,
    right: 0,
    bottom: 0
  };
}
