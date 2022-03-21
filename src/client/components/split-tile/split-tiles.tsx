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

import React from "react";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { Essence } from "../../../common/models/essence/essence";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Binary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { transformStyle } from "../../utils/dom/dom";
import { SECTION_WIDTH } from "../../utils/pill-tile/pill-tile";
import { TileOverflowContainer } from "../tile-overflow-container/tile-overflow-container";
import { SplitTileBaseProps } from "./split-tile";

interface SplitTilesProps {
  essence: Essence;
  openedSplit: Split;
  removeSplit: Unary<Split, void>;
  updateSplit: Binary<Split, Split, void>;
  openMenu: Unary<Split, void>;
  closeMenu: Fn;
  dragStart: Ternary<string, Split, React.DragEvent<HTMLElement>, void>;
  menuStage: Stage;
  maxItems: number;
  overflowOpen: boolean;
  closeOverflowMenu: Fn;
  openOverflowMenu: Fn;
  splitTileComponent: React.ComponentType<SplitTileBaseProps>;
}

export const SplitTiles: React.FunctionComponent<SplitTilesProps> = props => {
  const {
    splitTileComponent: SplitTile,
    overflowOpen,
    closeOverflowMenu,
    openOverflowMenu,
    essence,
    maxItems,
    removeSplit,
    updateSplit,
    openedSplit,
    openMenu,
    closeMenu,
    dragStart,
    menuStage
  } = props;

  const splits = essence.splits.splits.toArray();

  const splitTiles = splits.map(split => {
    const dimension = findDimensionByName(essence.dataCube.dimensions, split.reference);
    return <SplitTile
      key={split.toKey()}
      split={split}
      dimension={dimension}
      removeSplit={removeSplit}
      updateSplit={updateSplit}
      open={split.equals(openedSplit)}
      openMenu={openMenu}
      closeMenu={closeMenu}
      dragStart={dragStart}
      containerStage={menuStage}
      essence={essence} />;
  });

  const visibleSplits = splitTiles
    .slice(0, maxItems)
    .map((el, idx) => React.cloneElement(el, { style: transformStyle(idx * SECTION_WIDTH, 0) }));

  const overflowSplits = splitTiles.slice(maxItems);

  if (overflowSplits.length <= 0) {
    return <React.Fragment>{visibleSplits}</React.Fragment>;
  }

  const anyOverflowTileOpen = splits.slice(maxItems).some(split => split.equals(openedSplit));
  const overflowOpened = overflowOpen || anyOverflowTileOpen;

  const splitOverflow = <TileOverflowContainer
    className="dimension"
    key="overflow-menu"
    items={overflowSplits}
    open={overflowOpened}
    openOverflowMenu={openOverflowMenu}
    closeOverflowMenu={closeOverflowMenu}
    x={visibleSplits.length * SECTION_WIDTH} />;

  return <React.Fragment>
    {[...visibleSplits, splitOverflow]}
  </React.Fragment>;
};
