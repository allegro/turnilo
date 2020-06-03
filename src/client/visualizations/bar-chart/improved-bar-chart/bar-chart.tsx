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

import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../../common/models/essence/essence";
import { Stage } from "../../../../common/models/stage/stage";
import { Scroller } from "../../../components/scroller/scroller";
import { BarCharts } from "./bar-charts/bar-charts";
import { Spacer } from "./spacer/spacer";
import { calculateLayout } from "./utils/layout";
import { getXDomain } from "./utils/x-domain";
import { calculateXScale } from "./utils/x-scale";
import { XAxis } from "./x-axis/x-axis";
import { YAxis } from "./y-axis/y-axis";

interface BarChartProps {
  essence: Essence;
  stage: Stage;
  dataset: Dataset;
}
export const BarChart: React.SFC<BarChartProps> = props => {
  const { dataset, essence, stage } = props;
  const seriesCount = essence.series.count();
  const domain = getXDomain(essence, dataset);
  const { scroller, segment } = calculateLayout(stage, domain.length, seriesCount);
  const xScale = calculateXScale(domain, segment.width);

  return <Scroller
    layout={scroller}
    leftGutter={<Spacer />}
    body={<BarCharts
      dataset={dataset}
      stage={segment}
      essence={essence}
      xScale={xScale} />}
    rightGutter={<YAxis
      essence={essence}
      dataset={dataset}
      stage={Stage.fromSize(scroller.right, segment.height)}/>}
    bottomGutter={<XAxis
      essence={essence}
      scale={xScale}
      domain={domain}
      stage={Stage.fromSize(segment.width, scroller.bottom)}
    />} />;
};
