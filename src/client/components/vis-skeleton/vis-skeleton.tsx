/*
 * Copyright 2017-2022 Allegro.pl
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
import { ClientCustomization } from "../../../common/models/customization/customization";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { Essence } from "../../../common/models/essence/essence";
import { isTimeFilter } from "../../../common/models/filter-clause/filter-clause";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { STRINGS } from "../../config/constants";
import { classNames, transformStyle } from "../../utils/dom/dom";
import { getMaxItems, SECTION_WIDTH } from "../../utils/pill-tile/pill-tile";
import { FilterClauseLabel } from "../filter-tile/filter-clause-label";
import { Loader } from "../loader/loader";
import { VisSelectorItem } from "../vis-selector/vis-selector-item";
import VisualizationControlsLayout from "../visualization-controls-layout/visualization-controls-layout";

function VisualizationSkeleton() {
  return <div className="center-main">
    <div className="visualization">
      <Loader/>
    </div>
  </div>;
}

interface MoreTilesProps {
  className: string;
  max: number;
  count: number;
}

function MoreTiles({ className, max, count }: MoreTilesProps) {
  if (max >= count) return null;
  const x = max * SECTION_WIDTH;
  const left = count - max;
  return <div
    className={classNames("disabled", "overflow", className)}
    style={transformStyle(x, 0)}>
    <div className="count">{"+" + left}</div>
  </div>;
}

interface TilesProps {
  essence: Essence;
  stage?: Stage;
}

function FilterTiles({ essence, stage }: TilesProps) {
  if (!stage) return null;
  const { filter, dataCube } = essence;
  const count = filter.length();
  const maxItems = getMaxItems(stage.width, count);
  return <>
    {filter.clauses.take(maxItems).map((clause, idx) => {
      const dimension = findDimensionByName(dataCube.dimensions, clause.reference);
      const excluded = clause && !isTimeFilter(clause) && clause.not;
      return <div key={clause.reference}
                  style={transformStyle(idx * SECTION_WIDTH, 0)}
                  className={classNames("tile dimension disabled", { excluded, included: !excluded })}>
        <FilterClauseLabel dimension={dimension} clause={clause} essence={essence}/>
      </div>;
    })}
    <MoreTiles className="dimension" max={maxItems} count={filter.length()}/>
  </>;
}

function SplitTiles({ stage, essence }: TilesProps) {
  if (!stage) return null;
  const { splits, dataCube } = essence;
  const maxItems = getMaxItems(stage.width, splits.length());
  return <>
    {splits.splits.take(maxItems).map((split, idx) => {
      const dimension = findDimensionByName(dataCube.dimensions, split.reference);
      return <div key={split.toKey()}
                  style={transformStyle(idx * SECTION_WIDTH, 0)}
                  className={"tile dimension disabled"}>
        <div className="reading">{split.getTitle(dimension)}</div>
      </div>;
    })
    }
    <MoreTiles className="dimension" max={maxItems} count={splits.length()}/>
  </>;
}

function SeriesTiles({ stage, essence }: TilesProps) {
  if (!stage) return null;
  const seriesList = essence.getConcreteSeries();
  const maxItems = getMaxItems(stage.width, seriesList.count());
  return <>
    {seriesList.take(maxItems).map((series, idx) => {
      return <div key={series.definition.key()}
                  style={transformStyle(idx * SECTION_WIDTH, 0)}
                  className={"tile measure disabled"}>
        <div className="reading">{series.title()}</div>
      </div>;
    })
    }
    <MoreTiles className="measure" max={maxItems} count={seriesList.count()}/>
  </>;
}

interface VisSkeletonProps {
  essence: Essence;
  stage?: Stage;
  timekeeper: Timekeeper;
  customization: ClientCustomization;
}

function VisualizationControlsSkeleton({ essence, stage }: VisSkeletonProps) {
  return <VisualizationControlsLayout
    className="fallback"
    tiles={
      <>
        <div className="tile-row filter-tile-row">
          <div className="title">{STRINGS.filter}</div>
          <div className="items">
            <FilterTiles stage={stage} essence={essence}/>
          </div>
        </div>
        <div className="tile-row split-tile-row">
          <div className="title">{STRINGS.split}</div>
          <div className="items">
            <SplitTiles stage={stage} essence={essence}/>
          </div>
        </div>
        <div className="tile-row series-tile-row">
          <div className="title">{STRINGS.series}</div>
          <div className="items">
            <SeriesTiles stage={stage} essence={essence}/>
          </div>
        </div>
      </>
    }
    selector={
      <div className="vis-selector">
        <VisSelectorItem visualization={essence.visualization} selected={true}/>
      </div>
    }/>;
}

export const VisSkeleton: React.FunctionComponent<VisSkeletonProps> = props => {
  return <>
    <VisualizationControlsSkeleton {...props}/>
    <VisualizationSkeleton/>
  </>;
};
