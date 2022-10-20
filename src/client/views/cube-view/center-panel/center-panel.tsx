/*
 * Copyright 2017-2021 Allegro.pl
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
import { ChartProps } from "../../../../common/models/chart-props/chart-props";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { ClientCustomization } from "../../../../common/models/customization/customization";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { DragPosition } from "../../../../common/models/drag-position/drag-position";
import { Essence } from "../../../../common/models/essence/essence";
import { Series } from "../../../../common/models/series/series";
import { Stage } from "../../../../common/models/stage/stage";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Binary, Omit, Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { DropIndicator } from "../../../components/drop-indicator/drop-indicator";
import { FilterTilesRow } from "../../../components/filter-tile/filter-tiles-row";
import { ManualFallback } from "../../../components/manual-fallback/manual-fallback";
import { SeriesTilesRow } from "../../../components/series-tile/series-tiles-row";
import {
  DefaultSplitTilesRow,
  SplitTilesRow,
  SplitTilesRowBaseProps
} from "../../../components/split-tile/split-tiles-row";
import { VisSelector } from "../../../components/vis-selector/vis-selector";
import VisualizationControlsLayout from "../../../components/visualization-controls-layout/visualization-controls-layout";
import { classNames } from "../../../utils/dom/dom";
import { DataProvider, QueryFactory } from "../../../visualizations/data-provider/data-provider";
import { HighlightController } from "../../../visualizations/highlight-controller/highlight-controller";
import { PartialFilter, PartialSeries } from "../partial-tiles-provider";

export interface VisualizationControlsBaseProps {
  essence: Essence;
  clicker: Clicker;
  stage: Stage;
  timekeeper: Timekeeper;
  customization: ClientCustomization;
  addSeries: Binary<Series, DragPosition, void>;
  addFilter: Binary<Dimension, DragPosition, void>;
  partialSeries: PartialSeries | null;
  partialFilter: PartialFilter | null;
  removeTile: Fn;
}

interface VisualizationControlsProps extends VisualizationControlsBaseProps {
  splitTilesRow: React.ComponentType<SplitTilesRowBaseProps>;
}

export const DefaultVisualizationControls: React.FunctionComponent<VisualizationControlsBaseProps> = props => {
  return <VisualizationControls {...props} splitTilesRow={DefaultSplitTilesRow}/>;
};

export const VisualizationControls: React.FunctionComponent<VisualizationControlsProps> = props => {
  const {
    splitTilesRow: SplitTilesRow,
    addSeries,
    addFilter,
    clicker,
    essence,
    customization,
    timekeeper,
    stage,
    partialSeries,
    partialFilter,
    removeTile
  } = props;
  return <VisualizationControlsLayout
    tiles={
      <>
        <FilterTilesRow
          locale={customization.locale}
          timekeeper={timekeeper}
          menuStage={stage}
          partialFilter={partialFilter}
          removePartialFilter={removeTile}
          addPartialFilter={addFilter}
        />
        <SplitTilesRow
          clicker={clicker}
          essence={essence}
          menuStage={stage}
        />
        <SeriesTilesRow
          removePartialSeries={removeTile}
          partialSeries={partialSeries}
          menuStage={stage}
          addPartialSeries={addSeries}/>
      </>
    }
    selector={
      <VisSelector clicker={clicker} essence={essence}/>}/>;
};

interface ChartPanelProps {
  essence: Essence;
  clicker: Clicker;
  stage: Stage;
  chartComponent: React.ComponentType<ChartProps>;
  queryFactory: QueryFactory;
  timekeeper: Timekeeper;
  lastRefreshRequestTimestamp: number;
  dragEnter: Unary<React.DragEvent<HTMLElement>, void>;
  dragOver: Unary<React.DragEvent<HTMLElement>, void>;
  isDraggedOver: boolean;
  dragLeave: Fn;
  drop: Unary<React.DragEvent<HTMLElement>, void>;
}

export const ChartPanel: React.FunctionComponent<ChartPanelProps> = props => {
  const {
    chartComponent,
    queryFactory,
    essence,
    clicker,
    timekeeper,
    lastRefreshRequestTimestamp,
    stage,
    isDraggedOver,
    dragOver,
    dragEnter,
    dragLeave,
    drop
  } = props;
  return <div
    className="center-main"
    onDragEnter={dragEnter}
  >
    <div className="visualization">
      <ChartWrapper
        chartComponent={chartComponent}
        queryFactory={queryFactory}
        essence={essence}
        clicker={clicker}
        timekeeper={timekeeper}
        lastRefreshRequestTimestamp={lastRefreshRequestTimestamp}
        stage={stage}/>
    </div>
    {isDraggedOver && <React.Fragment>
      <DropIndicator/>
      <div
        className="drag-mask"
        onDragOver={dragOver}
        onDragLeave={dragLeave}
        onDragExit={dragLeave}
        onDrop={drop}
      />
    </React.Fragment>
    }
  </div>;
};

type ChartWrapperProps = Pick<ChartPanelProps,
  "timekeeper" |
  "essence" |
  "clicker" |
  "stage" |
  "lastRefreshRequestTimestamp" |
  "queryFactory" |
  "chartComponent">;

function ChartWrapper(props: ChartWrapperProps) {
  const {
    chartComponent: ChartComponent,
    queryFactory,
    essence,
    clicker,
    timekeeper,
    stage,
    lastRefreshRequestTimestamp
  } = props;
  if (essence.visResolve.isManual()) {
    return <ManualFallback clicker={clicker} essence={essence}/>;
  }

  return <HighlightController essence={essence} clicker={clicker}>
    {highlightProps =>
      <DataProvider
        refreshRequestTimestamp={lastRefreshRequestTimestamp}
        queryFactory={queryFactory}
        essence={essence}
        timekeeper={timekeeper}
        stage={stage}>
        {data => <div className={classNames("visualization-root", essence.visualization.name)}>
          <ChartComponent
            data={data}
            clicker={clicker}
            essence={essence}
            timekeeper={timekeeper}
            stage={stage}
            {...highlightProps} />
        </div>}
      </DataProvider>}
  </HighlightController>;
}

type VisualizationPanelProps = ChartPanelProps & VisualizationControlsBaseProps;
export type VisualizationProps = Omit<VisualizationPanelProps, "chartComponent" | "queryFactory">;
