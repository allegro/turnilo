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
import { BooleanFilterClause, FilterClause, FilterTypes, FixedTimeFilterClause, NumberFilterClause, StringFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Unary } from "../../../../common/utils/functional/functional";
import { Highlight } from "../../base-visualization/highlight";
import { nestedDataset } from "./nested-dataset";

function clausePredicate(clause: FilterClause): Unary<Datum, boolean> {
  switch (clause.type) {
    case FilterTypes.BOOLEAN:
      return datum => datum[clause.reference] === (clause as BooleanFilterClause).values.first();
    case FilterTypes.NUMBER:
      return datum => (clause as NumberFilterClause).values.first().equals(datum[clause.reference]);
    case FilterTypes.STRING:
      return datum => String(datum[clause.reference]) === (clause as StringFilterClause).values.first();
    case FilterTypes.FIXED_TIME:
      return datum => (clause as FixedTimeFilterClause).values.first().equals(datum[clause.reference]);
    case FilterTypes.RELATIVE_TIME:
      throw new Error("Unsupported filter type for highlights");
  }
}

function findDatumIndexByClause(data: Datum[], clause: FilterClause): number {
  return data.findIndex(clausePredicate(clause));
}

export interface HighlightPosition {
  row: number | null;
  column: number | null;
}

export default function getHighlightPosition(
  highlight: Highlight,
  essence: Essence,
  dataset: Datum[]
): HighlightPosition {
  if (!highlight) return null;
  const { splits: { splits } } = essence;
  const { clauses } = highlight;

  const firstSplit = splits.get(0);
  const secondSplit = splits.get(1);
  const columnSplitReference = secondSplit.reference;
  const rowSplitReference = firstSplit.reference;
  const columnClause = clauses.find(({ reference }) => reference === columnSplitReference);
  const rowClause = clauses.find(({ reference }) => reference === rowSplitReference);
  const row = rowClause ? findDatumIndexByClause(dataset, rowClause) : null;
  const column = columnClause ? findDatumIndexByClause(nestedDataset(dataset[row || 0]), columnClause) : null;

  return {
    row,
    column
  };
}
