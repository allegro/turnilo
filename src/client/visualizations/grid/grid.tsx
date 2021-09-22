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

import * as d3 from "d3";
import { Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { Direction, ResizeHandle } from "../../components/resize-handle/resize-handle";
import { Scroller, ScrollerLayout } from "../../components/scroller/scroller";
import {
  HEADER_HEIGHT,
  MEASURE_WIDTH,
  MIN_DIMENSION_WIDTH,
  ROW_HEIGHT,
  SEGMENT_WIDTH,
  SPACE_LEFT,
  SPACE_RIGHT
} from "../../components/tabular-scroller/dimensions";
import { MeasuresHeader } from "../../components/tabular-scroller/header/measures/measures-header";
import { SplitColumnsHeader } from "../../components/tabular-scroller/header/splits/split-columns";
import { FlattenedSplits } from "../../components/tabular-scroller/splits/flattened-splits";
import { measureColumnsCount } from "../../components/tabular-scroller/utils/measure-columns-count";
import { visibleIndexRange } from "../../components/tabular-scroller/visible-rows/visible-index-range";
import { selectFirstSplitDatums } from "../../utils/dataset/selectors/selectors";
import { CenterPanel, CenterProps } from "../../views/cube-view/center-panel/center-panel";
import "./grid.scss";
import { MeasureRows } from "./measure-rows";

interface GridState {
  segmentWidth: number;
  scrollTop: number;
}

export function Grid(props: CenterProps) {
  return <CenterPanel {...props} visualizationComponent={GridComponent}/>;
}

class GridComponent extends React.Component<VisualizationProps, GridState> {
  private innerGridRef = React.createRef<HTMLDivElement>();

  state: GridState = {
    segmentWidth: SEGMENT_WIDTH,
    scrollTop: 0
  };

  setScroll = (scrollTop: number) => this.setState({ scrollTop });

  setSegmentWidth = (segmentWidth: number) => this.setState({ segmentWidth });

  private getIdealColumnWidth(): number {
    const availableWidth = this.props.stage.width - SPACE_LEFT - this.getSegmentWidth();
    const count = measureColumnsCount(this.props.essence);

    return count * MEASURE_WIDTH >= availableWidth ? MEASURE_WIDTH : availableWidth / count;
  }

  private getScalesForColumns(essence: Essence, flatData: PseudoDatum[]): Array<d3.scale.Linear<number, number>> {
    const concreteSeries = essence.getConcreteSeries().toArray();

    return concreteSeries.map(series => {
      const measureValues = flatData
        .map((d: Datum) => series.selectValue(d));

      return d3.scale.linear()
        // Ensure that 0 is in there
        .domain(d3.extent([0, ...measureValues]))
        .range([0, 100]);
    });
  }

  maxSegmentWidth(): number {
    if (this.innerGridRef.current) {
      return this.innerGridRef.current.clientWidth - MIN_DIMENSION_WIDTH;
    }

    return SEGMENT_WIDTH;
  }

  getSegmentWidth(): number {
    const { segmentWidth } = this.state;
    return segmentWidth || SEGMENT_WIDTH;
  }

  render(): JSX.Element {
    const { essence, stage, data } = this.props;
    const { segmentWidth, scrollTop } = this.state;

    const datums = selectFirstSplitDatums(data);

    const columnsCount = measureColumnsCount(essence);
    const columnWidth = this.getIdealColumnWidth();
    const rowsCount = datums.length;
    const visibleRowsRange = visibleIndexRange(rowsCount, stage.height, scrollTop);

    const layout: ScrollerLayout = {
      bodyWidth: columnWidth * columnsCount + SPACE_RIGHT,
      bodyHeight: rowsCount * ROW_HEIGHT,
      bottom: 0,
      left: this.getSegmentWidth(),
      right: 0,
      top: HEADER_HEIGHT
    };

    return <div className="grid-container" ref={this.innerGridRef}>
      <ResizeHandle
        direction={Direction.LEFT}
        onResize={this.setSegmentWidth}
        min={SEGMENT_WIDTH}
        max={this.maxSegmentWidth()}
        value={segmentWidth}
      />
      <Scroller
        layout={layout}
        onScroll={this.setScroll}
        topGutter={<MeasuresHeader
          cellWidth={columnWidth}
          series={essence.getConcreteSeries().toArray()}
          commonSort={essence.getCommonSort()}
          showPrevious={essence.hasComparison()}/>}

        leftGutter={<FlattenedSplits
          visibleRowsIndexRange={visibleRowsRange}
          essence={essence}
          data={datums}
          segmentWidth={segmentWidth}
          highlightedRowIndex={null}/>}

        topLeftCorner={<SplitColumnsHeader essence={essence}/>}

        body={datums && <MeasureRows
          visibleRowsIndexRange={visibleRowsRange}
          essence={essence}
          highlightedRowIndex={null}
          scales={this.getScalesForColumns(essence, datums)}
          data={datums}
          cellWidth={columnWidth}
          rowWidth={columnWidth * columnsCount}/>}
      />
    </div>;
  }
}
