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
import { Clicker, Dimension, DragPosition, Essence, Stage, Timekeeper } from "../../../common/models/index";
import { Fn } from "../../../common/utils/general/general";
import { NumberFilterMenu } from "../number-filter-menu/number-filter-menu";
import { StringFilterMenu } from "../string-filter-menu/string-filter-menu";
import { TimeFilterMenu } from "../time-filter-menu/time-filter-menu";
import "./filter-menu.scss";

export interface FilterMenuProps {
  essence: Essence;
  timekeeper: Timekeeper;
  clicker: Clicker;
  containerStage?: Stage;
  openOn: Element;
  dimension: Dimension;
  changePosition: DragPosition;
  onClose: Fn;
  inside?: Element;
}

export const FilterMenu: React.SFC<FilterMenuProps> = ({ clicker, essence, timekeeper, changePosition, containerStage, openOn, dimension, onClose, inside }) => {
  if (!dimension) return null;
  if (dimension.kind === "time") {
    return <TimeFilterMenu
      essence={essence}
      timekeeper={timekeeper}
      clicker={clicker}
      dimension={dimension}
      onClose={onClose}
      containerStage={containerStage}
      openOn={openOn}
      inside={inside}
    />;
  } else if (dimension.kind === "number") {
    return <NumberFilterMenu
      essence={essence}
      timekeeper={timekeeper}
      clicker={clicker}
      dimension={dimension}
      onClose={onClose}
      containerStage={containerStage}
      openOn={openOn}
      inside={inside}
    />;
  } else {
    return <StringFilterMenu
      essence={essence}
      timekeeper={timekeeper}
      clicker={clicker}
      dimension={dimension}
      changePosition={changePosition}
      onClose={onClose}
      containerStage={containerStage}
      openOn={openOn}
      inside={inside}
    />;
  }
};
