/*
 * Copyright 2015-2016 Imply Data, Inc.
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

export interface Positioning {
  startIndex: number;
  shownColumns: number;
}

export function getVisibleSegments(segmentWidths: number[], offset: number, visibleSize: number): Positioning {
  let startIndex = 0;
  let shownColumns = 0;

  let curWidth = 0;
  for (const segmentWidth of segmentWidths) {
    const afterWidth = curWidth + segmentWidth;
    if (afterWidth < offset) {
      startIndex++;
    } else if (curWidth < offset + visibleSize) {
      shownColumns++;
    }
    curWidth = afterWidth;
  }

  return {
    startIndex,
    shownColumns
  };
}
