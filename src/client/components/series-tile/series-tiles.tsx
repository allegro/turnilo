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
import { ReactElement } from "react";
import { Essence } from "../../../common/models/essence/essence";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { insert } from "../../../common/utils/array/array";
import { Binary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { transformStyle } from "../../utils/dom/dom";
import { SECTION_WIDTH } from "../../utils/pill-tile/pill-tile";
import { TileOverflowContainer } from "../tile-overflow-container/tile-overflow-container";
import { PlaceholderSeriesTile } from "./placeholder-series";
import { SeriesTile } from "./series-tile";
import { Placeholder } from "./series-tiles-row";

export const SERIES_CLASS_NAME = "series";

interface SeriesTilesProps {
  menuStage: Stage;
  maxItems: number;
  essence: Essence;
  removeSeries: Unary<Series, void>;
  updateSeries: Binary<Series, Series, void>;
  openedSeriesMenu?: Series;
  openSeriesMenu: Unary<Series, void>;
  closeSeriesMenu: Fn;
  dragStart: Ternary<string, Series, React.DragEvent<HTMLElement>, void>;
  placeholderSeries?: Placeholder;
  removePlaceholderSeries: Fn;
  savePlaceholderSeries: Unary<Series, void>;
  overflowOpen: boolean;
  closeOverflowMenu: Fn;
  openOverflowMenu: Fn;
}

export const SeriesTiles: React.SFC<SeriesTilesProps> = props => {
  const {
    openedSeriesMenu,
    menuStage,
    removeSeries,
    dragStart,
    closeSeriesMenu,
    updateSeries,
    removePlaceholderSeries,
    savePlaceholderSeries,
    openOverflowMenu,
    closeOverflowMenu,
    essence,
    openSeriesMenu,
    overflowOpen,
    placeholderSeries,
    maxItems
  } = props;

  const series = essence.getConcreteSeries().toArray();

  const seriesTiles = series.map(item => <SeriesTile
    seriesList={essence.series}
    measures={essence.dataCube.measures}
    key={item.definition.key()}
    item={item}
    open={item.definition.equals(openedSeriesMenu)}
    closeSeriesMenu={closeSeriesMenu}
    removeSeries={removeSeries}
    dragStart={dragStart}
    containerStage={menuStage}
    openSeriesMenu={openSeriesMenu}
    updateSeries={updateSeries} />);

  function insertPlaceholder<T>(tiles: Array<ReactElement<T>>): Array<ReactElement<T>> {
    if (!placeholderSeries) return tiles;
    const { series, index } = placeholderSeries;
    const measure = essence.dataCube.getMeasure(series.reference);

    const placeholderTile = <PlaceholderSeriesTile
      key="placeholder-series-tile"
      measure={measure}
      seriesList={essence.series}
      measures={essence.dataCube.measures}
      series={series}
      containerStage={menuStage}
      saveSeries={savePlaceholderSeries}
      closeItem={removePlaceholderSeries} />;

    return insert(tiles, index, placeholderTile);
  }

  const tilesWithPlaceholder = insertPlaceholder(seriesTiles);

  const visibleItems = tilesWithPlaceholder
    .slice(0, maxItems)
    .map((element, idx) => React.cloneElement(element, { style: transformStyle(idx * SECTION_WIDTH, 0) }));
  const overflowItems = tilesWithPlaceholder.slice(maxItems);

  if (overflowItems.length <= 0) return <React.Fragment>{visibleItems}</React.Fragment>;

  const anyOverflowItemOpen = series.slice(maxItems).some(({ definition }) => definition.equals(openedSeriesMenu));
  const isDummySeriesInOverflow = overflowItems.some(element => element.type === PlaceholderSeriesTile);
  const overflowOpened = overflowOpen || anyOverflowItemOpen || isDummySeriesInOverflow;

  const seriesItemOverflow = <TileOverflowContainer
    key="overflow-menu"
    items={overflowItems}
    open={overflowOpened}
    openOverflowMenu={openOverflowMenu}
    x={visibleItems.length * SECTION_WIDTH}
    closeOverflowMenu={closeOverflowMenu}
    className="measure" />;

  return <React.Fragment>
    {[...visibleItems, seriesItemOverflow]}
  </React.Fragment>;
};
