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
import { nestedDataset } from "./nested-dataset";

interface Position {
  row: number | null;
  column: number | null;
}

function getDataColumn(dataset: Datum, column: number): Datum {
  const dataColumn = nestedDataset(dataset)[column];
  return dataColumn ? dataColumn : null;
}

export default function datumByPosition(dataset: Datum[], position: Position): [Datum, Datum] {
  const { column, row } = position;
  const dataRow = dataset[row];
  if (!dataRow) return [null, getDataColumn(dataset[0], column)];
  return [dataRow, getDataColumn(dataRow, column)];
}
