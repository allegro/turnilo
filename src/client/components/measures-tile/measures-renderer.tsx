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

import * as React from "react";
import { SearchableFolder } from "../searchable-tile/searchable-folder";
import { MeasureItem } from "./measure-item";
import { MeasureForViewType, MeasureGroupForView, MeasureOrGroupForView, MeasureForView } from "./measures-converter";
import { MeasureClickHandler } from "./measures-tile";

export class MeasuresRenderer {
  constructor(
    private readonly measureClick: MeasureClickHandler,
    private readonly multiMeasureMode: boolean,
    private readonly searchText: string
  ) {
  }

  render(children: MeasureOrGroupForView[]): JSX.Element[] {
    const { searchText } = this;
    return children
      .filter(child => !searchText || child.hasSearchText || child.type === MeasureForViewType.group)
      .map(child => {
        if (child.type === MeasureForViewType.group)
          return this.renderFolder(child);
        else
          return this.renderMeasure(child);
      });
  }

  renderFolder(groupView: MeasureGroupForView): JSX.Element {
    const { searchText } = this;
    const { name, title, hasSearchText, hasSelectedMeasures, children } = groupView;

    return <SearchableFolder
      key={name}
      name={name}
      title={title}
      inSearchMode={!!searchText}
      hasItemsWithSearchText={hasSearchText}
      shouldBeOpened={hasSelectedMeasures}
    >
      {this.render(children)}
    </SearchableFolder>;
  }

  renderMeasure(measureView: MeasureForView): JSX.Element {
    const { measureClick, multiMeasureMode, searchText } = this;
    const { name, title, hasSelectedMeasures } = measureView;

    return <MeasureItem
      key={name}
      name={name}
      title={title}
      selected={hasSelectedMeasures}
      measureClick={measureClick}
      multiMeasureMode={multiMeasureMode}
      searchText={searchText}
    />;
  }
}
