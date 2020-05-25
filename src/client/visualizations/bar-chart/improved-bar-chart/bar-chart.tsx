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
import { calculateChartWidth } from "./utils/chart-width";
import { calculateLayout } from "./utils/scroller-layout";
import { getXDomain } from "./utils/x-domain";
import { calculateXScale } from "./utils/x-scale";
import { XAxis } from "./x-axis/x-axis";
import { YAxis } from "./y-axis/y-axis";

interface BarChartProps {
  essence: Essence;
  stage: Stage;
  dataset: Dataset;
}

const Y_AXIS_WIDTH = 60;
const X_AXIS_HEIGHT = 40;

export const BarChart: React.SFC<BarChartProps> = props => {
  const { dataset, essence, stage } = props;
  const domain = getXDomain(essence, dataset);
  const width = calculateChartWidth(domain.length, stage.width - Y_AXIS_WIDTH);
  const xScale = calculateXScale(domain, width);
  const layout = calculateLayout(stage, width, { right: Y_AXIS_WIDTH, bottom: X_AXIS_HEIGHT });

  return <Scroller
    layout={layout}
    body={<BarCharts
      dataset={dataset}
      essence={essence}
      xScale={xScale} />}
    rightGutter={<YAxis />}
    bottomGutter={<XAxis />} />;
};
