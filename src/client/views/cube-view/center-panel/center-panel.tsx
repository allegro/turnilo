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

import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { ClientCustomization } from "../../../../common/models/customization/customization";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { DragPosition } from "../../../../common/models/drag-position/drag-position";
import { Essence } from "../../../../common/models/essence/essence";
import { Series } from "../../../../common/models/series/series";
import { Stage } from "../../../../common/models/stage/stage";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Binary, Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { DropIndicator } from "../../../components/drop-indicator/drop-indicator";
import { FilterTilesRow } from "../../../components/filter-tile/filter-tiles-row";
import { ManualFallback } from "../../../components/manual-fallback/manual-fallback";
import { SeriesTilesRow } from "../../../components/series-tile/series-tiles-row";
import { SplitTilesRow } from "../../../components/split-tile/split-tiles-row";
import { VisSelector } from "../../../components/vis-selector/vis-selector";
import { classNames } from "../../../utils/dom/dom";
import { getVisualizationComponent } from "../../../visualizations";
import { DataProvider } from "../../../visualizations/data-provider/data-provider";
import { HighlightController } from "../../../visualizations/highlight-controller/highlight-controller";
import { PartialFilter, PartialSeries } from "../partial-tiles-provider";

interface CenterPanelProps {
  essence: Essence;
  clicker: Clicker;
  timekeeper: Timekeeper;
  customization: ClientCustomization;
  stage: Stage;
  addSeries: Binary<Series, DragPosition, void>;
  addFilter: Binary<Dimension, DragPosition, void>;
  lastRefreshRequestTimestamp: number;
  partialSeries: PartialSeries | null;
  partialFilter: PartialFilter | null;
  removeTile: Fn;
  dragEnter: Unary<React.DragEvent<HTMLElement>, void>;
  dragOver: Unary<React.DragEvent<HTMLElement>, void>;
  isDraggedOver: boolean;
  dragLeave: Fn;
  drop: Unary<React.DragEvent<HTMLElement>, void>;
}

type VisualizationProps = Pick<CenterPanelProps, "timekeeper" | "essence" | "clicker" | "stage" | "lastRefreshRequestTimestamp">;

function Visualization(props: VisualizationProps) {
  const { essence, clicker, timekeeper, stage, lastRefreshRequestTimestamp } = props;
  if (essence.visResolve.isManual()) {
    return <ManualFallback clicker={clicker} essence={essence}/>;
  }
  const { visualization } = essence;
  const VisualizationComponent = getVisualizationComponent(visualization);

  return <HighlightController essence={essence} clicker={clicker}>
    {highlightProps =>
      <DataProvider
        refreshRequestTimestamp={lastRefreshRequestTimestamp}
        essence={essence}
        timekeeper={timekeeper}
        stage={stage}>
        {data => <div className={classNames("visualization-root", visualization.name)}>
          <VisualizationComponent
            data={data}
            essence={essence}
            clicker={clicker}
            timekeeper={timekeeper}
            stage={stage}
            {...highlightProps}
          />
        </div>}
      </DataProvider>}
  </HighlightController>;
}

type CenterPanelType = React.ComponentType<CenterPanelProps & React.ClassAttributes<HTMLDivElement>>;
export const CenterPanel: CenterPanelType = React.forwardRef(
  function CenterPanelInner(props: CenterPanelProps, ref: React.Ref<HTMLDivElement>) {
    const {
      isDraggedOver,
      dragEnter,
      dragLeave,
      dragOver,
      drop,
      addFilter,
      addSeries,
      removeTile,
      partialFilter,
      partialSeries,
      stage,
      customization,
      lastRefreshRequestTimestamp,
      essence,
      clicker,
      timekeeper
    } = props;
    return <React.Fragment>
      <div className="center-top-bar">
        <div className="filter-split-section">
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
        </div>
        <VisSelector clicker={clicker} essence={essence}/>
      </div>
      <div
        className="center-main"
        onDragEnter={dragEnter}
      >
        <div className="visualization" ref={ref}>
          <Visualization
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
      </div>
    </React.Fragment>;
  });
