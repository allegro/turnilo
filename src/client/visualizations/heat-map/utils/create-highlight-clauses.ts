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
import { Datum } from "plywood";
import { DataCube } from "../../../../common/models/data-cube/data-cube";
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
import { Split } from "../../../../common/models/split/split";
import { isTruthy } from "../../../../common/utils/general/general";
import { Booleanish } from "../../../components/filter-menu/boolean-filter-menu/boolean-filter-menu";
import { ScrollerPart } from "../../../components/scroller/scroller";
import { TILE_SIZE } from "../labeled-heatmap";
import { nestedDataset } from "./nested-dataset";

interface SplitSelection {
  value: unknown;
  dimension: Dimension;
}

function splitSelection(split: Split, offset: number, dataCube: DataCube, dataset: Datum[]): SplitSelection {
  const dimensionName = split.reference;
  const dimension = dataCube.getDimension(dimensionName);
  const labelIndex = Math.floor(offset / TILE_SIZE);
  if (labelIndex > dataset.length - 1) {
    return null;
  }
  const value = dataset[labelIndex][dimensionName];
  return { value, dimension };
}

function firstSplitSelection(topOffset: number, essence: Essence, dataset: Datum[]): SplitSelection {
  const { dataCube, splits: { splits } } = essence;
  const split = splits.get(0);
  return splitSelection(split, topOffset, dataCube, dataset);
}

function secondSplitSelection(leftOffset: number, essence: Essence, dataset: Datum[]): SplitSelection {
  const { dataCube, splits: { splits } } = essence;
  const split = splits.get(1);
  return splitSelection(split, leftOffset, dataCube, nestedDataset(dataset[0]));
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

function pickSplitSelections({ x, y, part }: Position, essence: Essence, dataset: Datum[]): SplitSelection[] {
  switch (part) {
    case "top-gutter":
      return [secondSplitSelection(x, essence, dataset)];
    case "left-gutter":
      return [firstSplitSelection(y, essence, dataset)];
    case "body":
      return [firstSplitSelection(y, essence, dataset), secondSplitSelection(x, essence, dataset)];
  }
}

export default function createHighlightClauses(position: Position, essence: Essence, dataset: Datum[]): FilterClause[] {
  const selections = pickSplitSelections(position, essence, dataset);
  if (selections.every(isTruthy)) {
    return selections.map(splitSelectionToClause);
  }
  return [];
}
