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
import * as React from "react";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { ImmutableRecord } from "../../../common/utils/immutable-utils/immutable-utils";
import { TableSettings } from "../../../common/visualization-manifests/table/settings";
import { CenterPanel, CenterProps } from "../../views/cube-view/center-panel/center-panel";
import { InteractionController } from "./interactions/interaction-controller";
import { ScrolledTable } from "./scrolled-table/scrolled-table";
import "./table.scss";

export function Table(props: CenterProps) {
  return <CenterPanel {...props} visualizationComponent={TableComponent} />;
}

const MIN_DIMENSION_WIDTH = 100;

class TableComponent extends React.Component<VisualizationProps> {
  private innerTableRef = React.createRef<HTMLDivElement>();

  availableWidth(): number | undefined {
    if (!this.innerTableRef.current) return undefined;
    return this.innerTableRef.current.clientWidth - MIN_DIMENSION_WIDTH;
  }

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
    const { essence, clicker, stage, acceptHighlight, saveHighlight, highlight, dropHighlight } = this.props;
    const flatData = this.flattenData();
    const collapseRows = this.shouldCollapseRows();

    return <div className="table-container" ref={this.innerTableRef}>
      <InteractionController
        essence={essence}
        clicker={clicker}
        stage={stage}
        flatData={flatData}
        dropHighlight={dropHighlight}
        acceptHighlight={acceptHighlight}
        highlight={highlight}
        saveHighlight={saveHighlight}>
        {({
            setSegmentWidth,
            setScrollTop,
            setHoverRow,
            resetHover,
            handleClick,
            columnWidth,
            segmentWidth,
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
            availableWidth={this.availableWidth()}
          />}
      </InteractionController>
    </div>;
  }
}
