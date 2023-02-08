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

import { FlattenOptions, PseudoDatum } from "plywood";
import React from "react";
import { ChartProps } from "../../../common/models/chart-props/chart-props";
import { Unary } from "../../../common/utils/functional/functional";
import { ImmutableRecord } from "../../../common/utils/immutable-utils/immutable-utils";
import { TableSettings } from "../../../common/visualization-manifests/table/settings";
import { SEGMENT_WIDTH } from "../../components/tabular-scroller/dimensions";
import { withProps } from "../../utils/react/with-props";
import {
  ChartPanel,
  DefaultVisualizationControls,
  VisualizationProps
} from "../../views/cube-view/center-panel/center-panel";
import { InteractionController } from "./interactions/interaction-controller";
import { ScrolledTable } from "./scrolled-table/scrolled-table";
import "./table.scss";

interface TableVisualizationState {
  segmentWidth: number;
}

export default class TableVisualization extends React.Component<VisualizationProps, TableVisualizationState> {
  state: TableVisualizationState = {
    segmentWidth: SEGMENT_WIDTH
  };

  setSegmentWidth = (segmentWidth: number) => {
    this.setState({ segmentWidth });
  }

  render() {
    const { segmentWidth } = this.state;
    return <React.Fragment>
      <DefaultVisualizationControls {...this.props} />
      <ChartPanel
        {...this.props}
        chartComponent={withProps(Table, { segmentWidth, setSegmentWidth: this.setSegmentWidth })}/>
    </React.Fragment>;
  }
}

const MIN_DIMENSION_WIDTH = 100;

interface TableProps extends ChartProps {
  setSegmentWidth: Unary<number, void>;
  segmentWidth: number;
}

class Table extends React.Component<TableProps> {

  private shouldCollapseRows(): boolean {
    const { essence: { visualizationSettings } } = this.props;
    const { collapseRows } = visualizationSettings as ImmutableRecord<TableSettings>;
    return collapseRows;
  }

  private flattenOptions(): FlattenOptions {
    if (this.shouldCollapseRows()) {
      return { order: "inline", nestingName: "__nest" };
    }
    return { order: "preorder", nestingName: "__nest" };
  }

  private flattenData(): PseudoDatum[] {
    const { essence: { splits }, data } = this.props;
    if (splits.length() === 0) return [];
    const flatDataset = data.flatten(this.flattenOptions());
    return flatDataset.data;
  }

  render() {
    const { essence, clicker, stage, acceptHighlight, saveHighlight, highlight, dropHighlight, setSegmentWidth, segmentWidth } = this.props;
    const flatData = this.flattenData();
    const collapseRows = this.shouldCollapseRows();
    const availableWidth = stage.width - MIN_DIMENSION_WIDTH;

    return <div className="table-container">
      <InteractionController
        essence={essence}
        clicker={clicker}
        stage={stage}
        flatData={flatData}
        dropHighlight={dropHighlight}
        acceptHighlight={acceptHighlight}
        highlight={highlight}
        segmentWidth={segmentWidth}
        saveHighlight={saveHighlight}>
        {({
            setScrollTop,
            setHoverRow,
            resetHover,
            handleClick,
            columnWidth,
            hoverRow,
            scrollTop
          }) =>
          <ScrolledTable
            flatData={flatData}
            essence={essence}
            stage={stage}
            dropHighlight={dropHighlight}
            acceptHighlight={acceptHighlight}
            highlight={highlight}
            handleClick={handleClick}
            setHoverRow={setHoverRow}
            resetHover={resetHover}
            setScrollTop={setScrollTop}
            setSegmentWidth={setSegmentWidth}
            columnWidth={columnWidth}
            segmentWidth={segmentWidth}
            scrollTop={scrollTop}
            hoverRow={hoverRow}
            collapseRows={collapseRows}
            availableWidth={availableWidth}
          />}
      </InteractionController>
    </div>;
  }
}
