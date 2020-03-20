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
import { Essence } from "../../../../common/models/essence/essence";
import { formatSegment } from "../../../../common/utils/formatter/formatter";
import { zip } from "../../../../common/utils/functional/functional";
import datumByPosition from "./datum-by-position";
import { HighlightPosition } from "./get-highlight-position";
import { HoverPosition } from "./get-hover-position";

export function modalTitle(position: HighlightPosition | HoverPosition, dataset: Datum[], essence: Essence): string {
  const { timezone, splits: { splits } } = essence;
  const datums = datumByPosition(dataset, position);
  const references = splits.toArray().map(split => split.reference);
  const segments = zip(datums, references);

  return segments
    .filter(([datum]) => datum)
    .map(([datum, split]) => formatSegment(datum[split], timezone))
    .join(" - ");
}
