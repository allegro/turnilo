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
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { SeriesSortOn, SortOn } from "../../../common/models/sort-on/sort-on";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { mapTruthy } from "../../../common/utils/functional/functional";
import { STRINGS } from "../../config/constants";
import { PinboardMeasureTile } from "../pinboard-measure-tile/pinboard-measure-tile";
import { PinboardTile } from "../pinboard-tile/pinboard-tile";
import { SvgIcon } from "../svg-icon/svg-icon";

interface PinboardTilesProps {
  hidePlaceholder: boolean;
  essence: Essence;
  clicker: Clicker;
  timekeeper: Timekeeper;
  refreshRequestTimestamp: number;
}

function pinnedSortOn(essence: Essence): SortOn | null {
  const sortSeries = essence.getPinnedSortSeries();
  return sortSeries && new SeriesSortOn(sortSeries);
}

function pinnedDimensions(essence: Essence): Dimension[] {
  const { dataCube, pinnedDimensions } = essence;
  return mapTruthy(pinnedDimensions.toArray(), dimensionName => dataCube.getDimension(dimensionName));
}

export const PinboardTiles: React.SFC<PinboardTilesProps> = props => {
  const { essence, timekeeper, clicker, hidePlaceholder, refreshRequestTimestamp } = props;
  const tileDimensions = pinnedDimensions(essence);
  const sortOn = pinnedSortOn(essence);

  const showPlaceholder = !hidePlaceholder && !tileDimensions.length;
  return <React.Fragment>
    <PinboardMeasureTile
      essence={essence}
      title={STRINGS.pinboard}
      sortOn={sortOn}
      onSelect={sortOn => {
        const series = essence.series.getSeriesWithKey(sortOn.key);
        clicker.changePinnedSortSeries(series);
      }}
    />

    {sortOn && tileDimensions.map(dimension => <PinboardTile
      key={dimension.name}
      essence={essence}
      clicker={clicker}
      dimension={dimension}
      timekeeper={timekeeper}
      refreshRequestTimestamp={refreshRequestTimestamp}
      sortOn={sortOn} />)}

    {showPlaceholder && <div className="placeholder">
      <SvgIcon svg={require("../../icons/preview-pin.svg")} />
      <div className="placeholder-message">{STRINGS.pinboardPlaceholder}</div>
    </div>}
  </React.Fragment>;
};
