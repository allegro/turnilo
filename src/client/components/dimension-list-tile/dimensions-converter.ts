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

import { Dimension } from "../../../common/models";
import { DimensionGroup, DimensionOrGroupVisitor } from "../../../common/models/dimension/dimension-group";

export type DimensionOrGroupForView = DimensionForView | DimensionGroupForView;

export interface DimensionForView {
  name: string;
  title: string;
  classSuffix: string;
  hasSearchText: boolean;
  isFilteredOrSplit: boolean;
  selected: boolean;
  type: DimensionForViewType.dimension;
}

export interface DimensionGroupForView {
  name: string;
  title: string;
  hasSearchText: boolean;
  isFilteredOrSplit: boolean;
  children: DimensionOrGroupForView[];
  type: DimensionForViewType.group;
}

export enum DimensionForViewType {
  dimension = "dimension",
  group = "group"
}

export class DimensionsConverter implements DimensionOrGroupVisitor<DimensionOrGroupForView> {
  constructor(
    private readonly hasSearchTextPredicate: (dimension: Dimension) => boolean,
    private readonly isFilteredOrSplitPredicate: (dimension: Dimension) => boolean,
    private readonly selectedDimension: Dimension
  ) {
  }

  visitDimension(dimension: Dimension): DimensionOrGroupForView {
    const { hasSearchTextPredicate, isFilteredOrSplitPredicate } = this;
    const { name, title, className } = dimension;

    return {
      name,
      title,
      classSuffix: className,
      isFilteredOrSplit: isFilteredOrSplitPredicate(dimension),
      hasSearchText: hasSearchTextPredicate(dimension),
      selected: dimension === this.selectedDimension,
      type: DimensionForViewType.dimension
    };
  }

  visitDimensionGroup(dimensionGroup: DimensionGroup): DimensionOrGroupForView {
    const { name, title, dimensions } = dimensionGroup;
    const dimensionsForView = dimensions.map(item => item.accept(this));

    return {
      name,
      title,
      hasSearchText: dimensionsForView.some(item => item.hasSearchText),
      isFilteredOrSplit: dimensionsForView.some(item => item.isFilteredOrSplit),
      children: dimensionsForView,
      type: DimensionForViewType.group
    };
  }
}
