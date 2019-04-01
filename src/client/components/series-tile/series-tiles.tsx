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
import { Essence } from "../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Binary, concatTruthy, Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { transformStyle } from "../../utils/dom/dom";
import { SECTION_WIDTH } from "../../utils/pill-tile/pill-tile";
import { PlaceholderSeriesTile } from "./placeholder-series";
import { SeriesItemOverflow } from "./series-item-overflow";
import { SeriesTile } from "./series-tile";

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
  placeholderSeries?: Series;
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

  function placeholderTile() {
    if (!placeholderSeries) return null;
    const measure = essence.dataCube.getMeasure(placeholderSeries.reference);

    return <PlaceholderSeriesTile
      key="placeholder-series-tile"
      measure={measure}
      series={placeholderSeries}
      containerStage={menuStage}
      saveSeries={savePlaceholderSeries}
      closeItem={removePlaceholderSeries} />;
  }

  const series: ConcreteSeries[] = essence.getConcreteSeries().toArray();

  const seriesElements = concatTruthy(
    ...series.map(item => <SeriesTile
      key={item.series.key()}
      item={item}
      open={item.series.equals(openedSeriesMenu)}
      closeSeriesMenu={closeSeriesMenu}
      removeSeries={removeSeries}
      dragStart={dragStart}
      containerStage={menuStage}
      openSeriesMenu={openSeriesMenu}
      updateSeries={updateSeries} />),
    placeholderTile()
  );

  const visibleItems = seriesElements
    .slice(0, maxItems)
    .map((element, idx) => React.cloneElement(element, { style: transformStyle(idx * SECTION_WIDTH, 0) }));

  const overflowItems = seriesElements.slice(maxItems);
  if (overflowItems.length <= 0) return <React.Fragment>{visibleItems}</React.Fragment>;

  const anyOverflowItemOpen = series.slice(maxItems).some(({ series }) => series.equals(openSeriesMenu));
  const isDummySeriesInOverflow = overflowItems.some(element => element.type === PlaceholderSeriesTile);
  const overflowOpened = overflowOpen || anyOverflowItemOpen || isDummySeriesInOverflow;

  const seriesItemOverflow = <SeriesItemOverflow
    key="overflow-menu"
    items={overflowItems}
    open={overflowOpened}
    openOverflowMenu={openOverflowMenu}
    x={visibleItems.length * SECTION_WIDTH}
    closeOverflowMenu={closeOverflowMenu} />;

  return <React.Fragment>
    {[...visibleItems, seriesItemOverflow]}
  </React.Fragment>;
};
