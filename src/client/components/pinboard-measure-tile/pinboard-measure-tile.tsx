/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { DimensionSortOn, SortOn } from "../../../common/models/sort-on/sort-on";
import { concatTruthy } from "../../../common/utils/functional/functional";
import { Dropdown } from "../dropdown/dropdown";
import "./pinboard-measure-tile.scss";

export interface PinboardMeasureTileProps {
  essence: Essence;
  title: string;
  dimension?: Dimension;
  sortOn?: SortOn;
  onSelect: (sel: SortOn) => void;
}

const renderSelectedItem = (item: SortOn) => item ? SortOn.getTitle(item) : "---";

export const PinboardMeasureTile: React.FunctionComponent<PinboardMeasureTileProps> = props => {
  const { essence, title, dimension, sortOn, onSelect } = props;

  const sortOns = concatTruthy(
    dimension && new DimensionSortOn(dimension),
    ...essence.seriesSortOns(false).toArray()
  );

  return <div className="pinboard-measure-tile">
    <div className="title">{title}</div>
    <Dropdown<SortOn>
      items={sortOns}
      selectedItem={sortOn}
      equal={SortOn.equals}
      renderItem={SortOn.getTitle}
      renderSelectedItem={renderSelectedItem}
      keyItem={SortOn.getKey}
      onSelect={onSelect} />
    {!sortOn && <div className="pinboard-sort-error">No measure selected.</div>}
  </div>;
};
