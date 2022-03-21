/*
 * Copyright 2017-2021 Allegro.pl
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
import { ReactElement } from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Locale } from "../../../common/models/locale/locale";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { insert } from "../../../common/utils/array/array";
import { Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { transformStyle } from "../../utils/dom/dom";
import { SECTION_WIDTH } from "../../utils/pill-tile/pill-tile";
import { PartialFilter } from "../../views/cube-view/partial-tiles-provider";
import { TileOverflowContainer } from "../tile-overflow-container/tile-overflow-container";
import { FilterTile } from "./filter-tile";
import { PartialFilterTile } from "./partial-filter-tile";

interface FilterTilesProps {
  menuStage: Stage;
  maxItems: number;
  essence: Essence;
  clicker: Clicker;
  timekeeper: Timekeeper;
  locale: Locale;
  removeFilter: Unary<FilterClause, void>;
  openedFilterMenu?: FilterClause;
  openFilterMenu: Unary<FilterClause, void>;
  closeFilterMenu: Fn;
  dragStart: Ternary<Dimension, FilterClause, React.DragEvent<HTMLElement>, void>;
  partialFilter?: PartialFilter;
  removePartialFilter: Fn;
  overflowOpen: boolean;
  closeOverflowMenu: Fn;
  openOverflowMenu: Fn;
}

export const FilterTiles: React.FunctionComponent<FilterTilesProps> = props => {
  const {
    menuStage,
    maxItems,
    essence,
    clicker,
    timekeeper,
    locale,
    removeFilter,
    openedFilterMenu,
    openFilterMenu,
    closeFilterMenu,
    dragStart,
    partialFilter,
    removePartialFilter,
    overflowOpen,
    closeOverflowMenu,
    openOverflowMenu
  } = props;

  const clauses = essence.filter.clauses.toArray();
  const dimensions = essence.dataCube.dimensions;

  function updateClause(clause: FilterClause) {
    clicker.changeFilter(essence.filter.setClause(clause));
  }

  function insertClause(clause: FilterClause, position: DragPosition) {
    const { filter } = essence;
    const newFilter = position.isInsert()
      ? filter.insertByIndex(position.insert, clause)
      : filter.replaceByIndex(position.replace, clause);
    clicker.changeFilter(newFilter);
  }

  const filterTiles = clauses.map(clause => {
    const dimension = findDimensionByName(dimensions, clause.reference);
    const isTimeClause = dimension.name === essence.getTimeDimension().name;
    return <FilterTile
      key={clause.reference}
      stage={menuStage}
      essence={essence}
      timekeeper={timekeeper}
      clicker={clicker}
      locale={locale}
      clause={clause}
      open={clause.equals(openedFilterMenu)}
      dimension={dimension}
      removeClause={isTimeClause ? undefined : removeFilter}
      saveClause={updateClause}
      openFilterMenu={openFilterMenu}

      closeFilterMenu={closeFilterMenu}
      dragStart={dragStart} />;
  });

  function insertPartialTile<T>(tiles: Array<ReactElement<T>>): Array<ReactElement<T>> {
    if (!partialFilter) return tiles;
    const { dimension, position } = partialFilter;
    const partialTile = <PartialFilterTile
      key="partial-filter-tile"
      dimension={dimension}
      essence={essence}
      timekeeper={timekeeper}
      locale={locale}
      clicker={clicker}
      saveClause={clause => insertClause(clause, partialFilter.position)}
      stage={menuStage}
      closeItem={removePartialFilter}/>;

    return insert(tiles, position.getIndex(), partialTile);
  }

  const tilesWithPlaceholder = insertPartialTile(filterTiles);

  const visibleItems = tilesWithPlaceholder
      .slice(0, maxItems)
      .map((el, idx) => React.cloneElement(el, { style: transformStyle(idx * SECTION_WIDTH, 0) }));
  const overflowItems = tilesWithPlaceholder.slice(maxItems);

  if (overflowItems.length <= 0) return <React.Fragment>{visibleItems}</React.Fragment>;

  const overflowClauses = clauses.slice(maxItems);

  const anyOverflowItemOpen = overflowClauses.some(clause => clause.equals(openedFilterMenu));
  const isPartialFilterInOverflow = overflowItems.some(element => element.type  === PartialFilterTile);
  const overflowOpened = overflowOpen || anyOverflowItemOpen || isPartialFilterInOverflow;

  const filterItemOverflow = <TileOverflowContainer
    key="overflow-menu"
    className="dimension"
    x={visibleItems.length * SECTION_WIDTH}
    items={overflowItems}
    open={overflowOpened}
    openOverflowMenu={openOverflowMenu}
    closeOverflowMenu={closeOverflowMenu} />;

  return <React.Fragment>
    {[...visibleItems, filterItemOverflow]}
  </React.Fragment>;
};
