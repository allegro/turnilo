/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./filter-menu.css');

import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import { Stage, Clicker, Essence, Dimension, DragPosition } from "../../../common/models/index";
import { StringFilterMenu } from "../string-filter-menu/string-filter-menu";
import { TimeFilterMenu } from "../time-filter-menu/time-filter-menu";
import { NumberFilterMenu } from "../number-filter-menu/number-filter-menu";

export interface FilterMenuProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  containerStage?: Stage;
  openOn: Element;
  dimension: Dimension;
  changePosition: DragPosition;
  onClose: Fn;
  inside?: Element;
}

export interface FilterMenuState {
}

export class FilterMenu extends React.Component<FilterMenuProps, FilterMenuState> {

  constructor() {
    super();
  }

  render() {
    var { clicker, essence, changePosition, containerStage, openOn, dimension, onClose, inside } = this.props;
    if (!dimension) return null;
    if (dimension.kind === 'time') {
      return <TimeFilterMenu
        clicker={clicker}
        dimension={dimension}
        essence={essence}
        onClose={onClose}
        containerStage={containerStage}
        openOn={openOn}
        inside={inside}
      />;
    } else if (dimension.kind === 'number') {
      return <NumberFilterMenu
        clicker={clicker}
        dimension={dimension}
        essence={essence}
        onClose={onClose}
        containerStage={containerStage}
        openOn={openOn}
        inside={inside}
      />;
    } else {
      return <StringFilterMenu
        clicker={clicker}
        dimension={dimension}
        essence={essence}
        changePosition={changePosition}
        onClose={onClose}
        containerStage={containerStage}
        openOn={openOn}
        inside={inside}
      />;
    }
  }
}
