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
import { ChartProps } from "../../../common/models/chart-props/chart-props";
import { MIN_DIMENSION_WIDTH } from "../../components/tabular-scroller/dimensions";
import { ChartPanel, VisualizationProps } from "../../views/cube-view/center-panel/center-panel";
import "./grid.scss";
import { InteractionController } from "./interaction-controller";
import makeQuery from "./make-query";
import { ScrolledGrid } from "./scrolled-grid";
import { GridVisualizationControls } from "./visualization-controls";

export function GridVisualization(props: VisualizationProps) {
  return <React.Fragment>
    <GridVisualizationControls {...props} />
    <ChartPanel {...props} queryFactory={makeQuery} chartComponent={Grid}/>
  </React.Fragment>;
}

class Grid extends React.Component<ChartProps, {}> {
  private innerGridRef = React.createRef<HTMLDivElement>();

  availableWidth(): number | undefined {
    if (!this.innerGridRef.current) return undefined;
    return this.innerGridRef.current.clientWidth - MIN_DIMENSION_WIDTH;
  }

  render(): JSX.Element {
    const { essence, stage, clicker, data } = this.props;

    return <div className="grid-container" ref={this.innerGridRef}>
      <InteractionController
        essence={essence}
        clicker={clicker}
        stage={stage}
      >
        {({
            segmentWidth,
            columnWidth,
            scrollTop,
            setSegmentWidth,
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
            availableWidth={this.availableWidth()}
            columnWidth={columnWidth}
            segmentWidth={segmentWidth}
            scrollTop={scrollTop}/>}
      </InteractionController>
    </div>;
  }
}
