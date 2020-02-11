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

import { PseudoDatum } from "plywood";
import { Essence } from "../../../../../common/models/essence/essence";
import { formatSegment } from "../../../../../common/utils/formatter/formatter";

export function nestedSplitName(data: PseudoDatum, { timezone, splits: { splits } }: Essence): string {
  const nest = data.__nest;
  if (nest === 0) return "Total";
  const split = splits.get(nest - 1);
  const segmentValue = data[split.reference];
  return formatSegment(segmentValue, timezone);
}
