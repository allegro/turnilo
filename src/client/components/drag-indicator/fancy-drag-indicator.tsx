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
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH } from "../../config/constants";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./fancy-drag-indicator.scss";

export interface FancyDragIndicatorProps {
  dragPosition: DragPosition;
}

export interface FancyDragIndicatorState {
}

export class FancyDragIndicator extends React.Component<FancyDragIndicatorProps, FancyDragIndicatorState> {

  render() {
    const { dragPosition } = this.props;
    if (!dragPosition) return null;

    const sectionWidth = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

    let ghostArrowLeft: number;
    let dragGhostElement: JSX.Element = null;
    if (dragPosition.isInsert()) {
      ghostArrowLeft = dragPosition.insert * sectionWidth - CORE_ITEM_GAP / 2;
    } else {
      ghostArrowLeft = dragPosition.replace * sectionWidth + CORE_ITEM_WIDTH / 2;
      const left = dragPosition.replace * sectionWidth;
      dragGhostElement = <div className="drag-ghost-element" style={{ left }} />;
    }

    return <div className="fancy-drag-indicator">
      {dragGhostElement}
      <SvgIcon className="drag-ghost-arrow" svg={require("../../icons/drag-arrow.svg")} style={{ left: ghostArrowLeft }} />
    </div>;
  }
}
