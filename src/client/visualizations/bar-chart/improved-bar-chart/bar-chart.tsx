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

import { List } from "immutable";
import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../../common/models/essence/essence";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Stage } from "../../../../common/models/stage/stage";
import { Binary, Nullary } from "../../../../common/utils/functional/functional";
import { Scroller } from "../../../components/scroller/scroller";
import { Highlight } from "../../base-visualization/highlight";
import { BarCharts } from "./bar-charts/bar-charts";
import { InteractionController } from "./interactions/interaction-controller";
import { Spacer } from "./spacer/spacer";
import { calculateLayout } from "./utils/layout";
import { getXDomain } from "./utils/x-domain";
import { createXScale } from "./utils/x-scale";
import { XAxis } from "./x-axis/x-axis";
import { YAxis } from "./y-axis/y-axis";

interface BarChartProps {
  essence: Essence;
  stage: Stage;
  dataset: Dataset;
  highlight?: Highlight;
  saveHighlight: Binary<List<FilterClause>, string, void>;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
}

export const BarChart: React.SFC<BarChartProps> = props => {
  const { dataset, essence, stage, highlight, acceptHighlight, dropHighlight, saveHighlight } = props;
  const seriesCount = essence.series.count();
  const domain = getXDomain(essence, dataset);
  const barChartLayout = calculateLayout(stage, domain.length, seriesCount);
  const { scroller, segment } = barChartLayout;
  const xScale = createXScale(domain, segment.width);

  return <InteractionController
    xScale={xScale}
    essence={essence}
    dataset={dataset}
    layout={barChartLayout}
    saveHighlight={saveHighlight}
    highlight={highlight}>
    {({
        onClick,
        onScroll,
        onMouseLeave,
        onMouseMove,
        interaction,
        scrollLeft
      }) => <Scroller
      layout={scroller}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onScroll={onScroll}
      onMouseMove={onMouseMove}
      leftGutter={<Spacer />}
      bottomLeftCorner={<Spacer />}
      bottomRightCorner={<Spacer />}
      body={<BarCharts
        interaction={interaction}
        dataset={dataset}
        stage={segment}
        scrollLeft={scrollLeft}
        essence={essence}
        xScale={xScale}
        acceptHighlight={acceptHighlight}
        dropHighlight={dropHighlight} />}
      rightGutter={<YAxis
        essence={essence}
        dataset={dataset}
        stage={Stage.fromSize(scroller.right, segment.height)} />}
      bottomGutter={<XAxis
        essence={essence}
        scale={xScale}
        stage={Stage.fromSize(segment.width, scroller.bottom)}
      />} />}
  </InteractionController>;
};
