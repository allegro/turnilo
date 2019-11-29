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

import * as React from "react";
import { SearchableFolder } from "../searchable-tile/searchable-folder";
import { MeasureItem } from "./measure-item";
import { MeasureForView, MeasureForViewType, MeasureGroupForView, MeasureOrGroupForView } from "./measures-converter";
import { MeasureClickHandler, MeasureDragStartHandler } from "./measures-tile";

export class MeasuresRenderer {
  constructor(
    private readonly measureClick: MeasureClickHandler,
    private readonly measureDragStart: MeasureDragStartHandler,
    private readonly searchText: string
  ) {
  }

  render(children: MeasureOrGroupForView[]): JSX.Element[] {
    const { searchText } = this;

    const notInSearchModeOrHasSearchTextOrIsGroup = (item: MeasureOrGroupForView) => {
      return !searchText || item.hasSearchText || item.type === MeasureForViewType.group;
    };

    return children
      .filter(notInSearchModeOrHasSearchTextOrIsGroup)
      .map(child => {
        if (child.type === MeasureForViewType.group) {
          return this.renderFolder(child);
        } else {
          return this.renderMeasure(child);
        }
      });
  }

  private renderFolder(groupView: MeasureGroupForView): JSX.Element {
    const { searchText } = this;
    const { name, title, description, hasSearchText, hasSelectedMeasures, children } = groupView;

    return <SearchableFolder
      key={name}
      name={name}
      description={description}
      title={title}
      inSearchMode={!!searchText}
      hasItemsWithSearchText={hasSearchText}
      shouldBeOpened={hasSelectedMeasures}
    >
      {this.render(children)}
    </SearchableFolder>;
  }

  private renderMeasure(measureView: MeasureForView): JSX.Element {
    const { measureClick, measureDragStart, searchText } = this;
    const { name, title, approximate, description, hasSelectedMeasures } = measureView;

    return <MeasureItem
      key={name}
      name={name}
      title={title}
      description={description}
      approximate={approximate}
      selected={hasSelectedMeasures}
      measureClick={measureClick}
      measureDragStart={measureDragStart}
      searchText={searchText}
    />;
  }
}
