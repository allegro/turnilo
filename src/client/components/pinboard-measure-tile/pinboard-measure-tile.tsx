/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { Dimension, Essence, SortOn } from "../../../common/models/index";
import { Dropdown } from "../dropdown/dropdown";
import "./pinboard-measure-tile.scss";

export interface PinboardMeasureTileProps {
  essence: Essence;
  title: string;
  dimension?: Dimension;
  sortOn: SortOn;
  onSelect: (sel: SortOn) => void;
}

export interface PinboardMeasureTileState {
}

export class PinboardMeasureTile extends React.Component<PinboardMeasureTileProps, PinboardMeasureTileState> {

  render() {
    var { essence, title, dimension, sortOn, onSelect } = this.props;

    var sortOns = (dimension ? [SortOn.fromDimension(dimension)] : []).concat(
      essence.dataCube.measures.mapMeasures(SortOn.fromMeasure)
    );

    return <div className="pinboard-measure-tile">
      <div className="title">{title}</div>
      <Dropdown<SortOn>
        items={sortOns}
        selectedItem={sortOn}
        equal={SortOn.equal}
        renderItem={SortOn.getTitle}
        keyItem={SortOn.getName}
        onSelect={onSelect}
      />
    </div>;
  }
}
