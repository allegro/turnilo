/*
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

import { Dimension, DimensionKind } from "../../../common/models/dimension/dimension";
import { DimensionOrGroup, Dimensions } from "../../../common/models/dimension/dimensions";

export type DimensionOrGroupForView = DimensionForView | DimensionGroupForView;

export interface DimensionForView {
  name: string;
  title: string;
  description?: string;
  hasSearchText: boolean;
  isFilteredOrSplit: boolean;
  selected: boolean;
  kind: DimensionKind;
  type: DimensionForViewType.dimension;
}

export interface DimensionGroupForView {
  name: string;
  title: string;
  description?: string;
  hasSearchText: boolean;
  isFilteredOrSplit: boolean;
  children: DimensionOrGroupForView[];
  type: DimensionForViewType.group;
}

export enum DimensionForViewType {
  dimension = "dimension",
  group = "group"
}

export function convert(
  dimensions: Dimensions,
  hasSearchTextPredicate: (dimension: Dimension) => boolean,
  isFilteredOrSplitPredicate: (dimension: Dimension) => boolean,
  isSelectedDimensionPredicate: (dimension: Dimension) => boolean): DimensionOrGroupForView[] {

  const { byName, tree } = dimensions;

  function convertElement(el: DimensionOrGroup): DimensionOrGroupForView {
    if (typeof el === "string") {
      const dimension = byName[el];
      const { name, title, kind, description } = dimension;

      return {
        name,
        title,
        description,
        kind,
        isFilteredOrSplit: isFilteredOrSplitPredicate(dimension),
        hasSearchText: hasSearchTextPredicate(dimension),
        selected: isSelectedDimensionPredicate(dimension),
        type: DimensionForViewType.dimension
      };
    } else {
      const { name, description, title, dimensions } = el;
      const dimensionsForView = dimensions.map(item => convertElement(item));

      return {
        name,
        title,
        description,
        hasSearchText: dimensionsForView.some(item => item.hasSearchText),
        isFilteredOrSplit: dimensionsForView.some(item => item.isFilteredOrSplit),
        children: dimensionsForView,
        type: DimensionForViewType.group
      };
    }
  }

  return tree.map(convertElement);
}
