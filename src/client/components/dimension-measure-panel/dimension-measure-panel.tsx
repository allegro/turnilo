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
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { clamp } from "../../utils/dom/dom";
import { DimensionListTile } from "../dimension-list-tile/dimension-list-tile";
import { MeasuresTile } from "../measures-tile/measures-tile";
import { Direction, ResizeHandle } from "../resize-handle/resize-handle";
import "./dimension-measure-panel.scss";

const MIN_PANEL_SIZE = 100;
// TODO: extract this somehow from _constants.scss
const HEADER_HEIGHT = 42;

export interface DimensionMeasurePanelProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  triggerFilterMenu: Fn;
  triggerSplitMenu: Fn;
  style?: React.CSSProperties;
}

export interface DimensionMeasurePanelState {
  dividerPosition: number;
  maxDividerPosition: number;
  minDividerPosition: number;
}

function getDimensions() {
  const height = window.innerHeight - HEADER_HEIGHT;
  const max = Math.max(height - MIN_PANEL_SIZE, 0);
  const min = Math.min(MIN_PANEL_SIZE, height);
  return { height, max, min };
}

export class DimensionMeasurePanel extends React.Component<DimensionMeasurePanelProps, DimensionMeasurePanelState> {

  state: DimensionMeasurePanelState = this.initialState();

  saveDividerPosition = (dividerPosition: number) => this.setState({ dividerPosition });

  initialState(): DimensionMeasurePanelState {
    const { essence: { dataCube } } = this.props;
    const { height, max: maxDividerPosition, min: minDividerPosition } = getDimensions();
    const dimensionsCount = dataCube.dimensions.size();
    const measuresCount = dataCube.measures.size();
    const ratio = dimensionsCount / (measuresCount + dimensionsCount);
    const dividerPosition = clamp(height * ratio, minDividerPosition, maxDividerPosition);

    return { dividerPosition, maxDividerPosition, minDividerPosition };
  }

  onResize = () => {
    const { max: maxDividerPosition, min: minDividerPosition } = getDimensions();
    this.setState({ maxDividerPosition, minDividerPosition });
  }

  componentDidMount() {
    window.addEventListener("resize", this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
  }

  render() {
    const { clicker, essence, menuStage, triggerFilterMenu, triggerSplitMenu, style } = this.props;
    const { dividerPosition, minDividerPosition, maxDividerPosition } = this.state;

    const dimensionListStyle: React.CSSProperties = {
      height: dividerPosition
    };

    const measureListStyle: React.CSSProperties = {
      height: window.innerHeight - dividerPosition - HEADER_HEIGHT
    };

    return <div className="dimension-measure-panel" style={style}>
      <DimensionListTile
        clicker={clicker}
        essence={essence}
        menuStage={menuStage}
        triggerFilterMenu={triggerFilterMenu}
        triggerSplitMenu={triggerSplitMenu}
        style={dimensionListStyle}
      />
      <ResizeHandle
        onResize={this.saveDividerPosition}
        direction={Direction.TOP}
        min={minDividerPosition}
        max={maxDividerPosition}
        initialValue={dividerPosition} />
      <MeasuresTile
        style={measureListStyle}
        clicker={clicker}
        essence={essence}
      />
    </div>;
  }
}
