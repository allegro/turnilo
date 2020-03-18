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

import { List, Set } from "immutable";
import { Dataset, Datum } from "plywood";
import { DateRange } from "../../../../common/models/date-range/date-range";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import {
  BooleanFilterClause,
  FilterClause,
  FixedTimeFilterClause,
  NumberFilterClause,
  NumberRange,
  StringFilterAction,
  StringFilterClause
} from "../../../../common/models/filter-clause/filter-clause";
import { Booleanish } from "../../../components/filter-menu/boolean-filter-menu/boolean-filter-menu";
import { ScrollerPart } from "../../../components/scroller/scroller";
import { SPLIT } from "../../../config/constants";
import { TILE_SIZE } from "../labeled-heatmap";

interface SplitSelection {
  value: unknown;
  dimension: Dimension;
}

function firstSplitSelection(topOffset: number, essence: Essence, dataset: Datum[]): SplitSelection {
  const { dataCube, splits: { splits } } = essence;
  const dimensionName = splits.get(0).reference;
  const dimension = dataCube.getDimension(dimensionName);
  const labelIndex = Math.floor(topOffset / TILE_SIZE);
  const value = dataset[labelIndex][dimensionName];
  return { value, dimension };
}

function secondSplitSelection(leftOffset: number, essence: Essence, dataset: Datum[]): SplitSelection {
  const { dataCube, splits: { splits } } = essence;
  const dimensionName = splits.get(1).reference;
  const dimension = dataCube.getDimension(dimensionName);
  const labelIndex = Math.floor(leftOffset / TILE_SIZE);
  const value = (dataset[0][SPLIT] as Dataset).data[labelIndex][dimensionName];
  return { value, dimension };
}

function splitSelectionToClause({ value, dimension: { kind, name: reference } }: SplitSelection): FilterClause {
  switch (kind) {
    case "string":
      return new StringFilterClause({ reference, action: StringFilterAction.IN, values: Set.of(String(value)) });
    case "boolean":
      return new BooleanFilterClause({ reference, values: Set.of(value as Booleanish) });
    case "time":
      return new FixedTimeFilterClause({ reference, values: List.of(value as DateRange) });
    case "number":
      return new NumberFilterClause({ reference, values: List.of(value as NumberRange) });
  }
}

type ClickablePart = "body" | "top-gutter" | "left-gutter";

export function isClickablePart(part: ScrollerPart): part is ClickablePart {
  return part === "body" || part === "top-gutter" || part === "left-gutter";
}

interface Position {
  part: ClickablePart;
  x: number;
  y: number;
}

export default function createHighlightClauses({ x, y, part }: Position, essence: Essence, dataset: Datum[]): FilterClause[] {
  switch (part) {
    case "top-gutter":
      return [splitSelectionToClause(secondSplitSelection(x, essence, dataset))];
    case "left-gutter":
      return [splitSelectionToClause(firstSplitSelection(y, essence, dataset))];
    case "body":
      return [firstSplitSelection(y, essence, dataset), secondSplitSelection(x, essence, dataset)].map(splitSelectionToClause);
  }
}
