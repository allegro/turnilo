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
import { ChartProps } from "../../../common/models/chart-props/chart-props";
import { Unary } from "../../../common/utils/functional/functional";
import { MIN_DIMENSION_WIDTH, SEGMENT_WIDTH } from "../../components/tabular-scroller/dimensions";
import { withProps } from "../../utils/react/with-props";
import { ChartPanel, VisualizationProps } from "../../views/cube-view/center-panel/center-panel";
import "./grid.scss";
import { InteractionController } from "./interaction-controller";
import { ScrolledGrid } from "./scrolled-grid";
import { GridVisualizationControls } from "./visualization-controls";

interface GridProps extends ChartProps {
  setSegmentWidth: Unary<number, void>;
  segmentWidth: number;
}

const Grid: React.FunctionComponent<GridProps> = props => {
  const { essence, segmentWidth, setSegmentWidth, stage, clicker, data } = props;
  const availableWidth = stage.width - MIN_DIMENSION_WIDTH;

  return <div className="grid-container">
    <InteractionController
      essence={essence}
      clicker={clicker}
      stage={stage}
      segmentWidth={segmentWidth}
    >
      {({
          columnWidth,
          scrollTop,
          setScrollTop,
          handleClick
        }) =>
        <ScrolledGrid
          essence={essence}
          data={data}
          stage={stage}
          handleClick={handleClick}
          setScrollTop={setScrollTop}
          setSegmentWidth={setSegmentWidth}
          availableWidth={availableWidth}
          columnWidth={columnWidth}
          segmentWidth={segmentWidth}
          scrollTop={scrollTop}/>}
    </InteractionController>
  </div>;
};

interface GridVisualizationState {
  segmentWidth: number;
}

export default class GridVisualization extends React.Component<VisualizationProps, GridVisualizationState> {
  state: GridVisualizationState = {
    segmentWidth: SEGMENT_WIDTH
  };

  setSegmentWidth = (segmentWidth: number) => {
    this.setState({ segmentWidth });
  }

  render() {
    const { segmentWidth } = this.state;
    return <React.Fragment>
      <GridVisualizationControls {...this.props} />
      <ChartPanel {...this.props}
                  chartComponent={withProps(Grid, { segmentWidth, setSegmentWidth: this.setSegmentWidth })}/>
    </React.Fragment>;
  }
}
