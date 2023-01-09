/*
 * Copyright 2017-2022 Allegro.pl
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

import { SerializedDataCube } from "../../../common/models/data-cube/data-cube";

const PAGE_SIZE = 1000;

interface DataCubesSlice {
  dataCubes: SerializedDataCube[];
  next?: number;
}

export function getDataCubesPage(dataCubes: SerializedDataCube[], page: number): DataCubesSlice {
  const sliceStart = page * PAGE_SIZE;
  const sliceEnd = sliceStart + PAGE_SIZE;
  const next = sliceEnd < dataCubes.length ? page + 1 : undefined;
  return {
    dataCubes: dataCubes.slice(sliceStart, sliceEnd),
    next
  };
}

export function getPageNumber(page: unknown): number {
  if (typeof page === "string") return parseInt(page, 10);
  return 0;
}
