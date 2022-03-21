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

import React from "react";
import { SearchableFolder } from "../searchable-tile/searchable-folder";
import { DimensionClickHandler, DimensionItem } from "./dimension-item";
import { DimensionForView, DimensionForViewType, DimensionGroupForView, DimensionOrGroupForView } from "./dimensions-converter";

export class DimensionsRenderer {
  constructor(
    private readonly dimensionClick: DimensionClickHandler,
    private readonly dimensionDragStart: DimensionClickHandler,
    private readonly searchText: string
  ) {
  }

  render(children: DimensionOrGroupForView[]): JSX.Element[] {
    const { searchText } = this;
    return children
      .filter(child => !searchText || child.hasSearchText || child.type === DimensionForViewType.group)
      .map(child => {
        if (child.type === DimensionForViewType.group) {
          return this.renderFolder(child);
        } else {
          return this.renderDimension(child);
        }
      });
  }

  private renderFolder(groupView: DimensionGroupForView): JSX.Element {
    const { searchText } = this;
    const { name, title, description, hasSearchText, isFilteredOrSplit, children } = groupView;

    return <SearchableFolder
      key={name}
      name={name}
      title={title}
      description={description}
      inSearchMode={!!searchText}
      hasItemsWithSearchText={hasSearchText}
      shouldBeOpened={isFilteredOrSplit}
    >
      {this.render(children)}
    </SearchableFolder>;
  }

  private renderDimension(dimensionView: DimensionForView): JSX.Element {
    const { dimensionClick, dimensionDragStart, searchText } = this;
    const { name, title, description, kind, selected } = dimensionView;

    return <DimensionItem
      key={name}
      name={name}
      title={title}
      description={description}
      selected={selected}
      kind={kind}
      dimensionClick={dimensionClick}
      dimensionDragStart={dimensionDragStart}
      searchText={searchText}
    />;
  }
}
