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
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Stage } from "../../../../../common/models/stage/stage";
import { VerticalAxis } from "../../../../components/vertical-axis/vertical-axis";
import { LinearScale } from "../../../../utils/scales/scales";
import { pickTicks } from "../../../../utils/ticks/ticks";

interface SingleYAxisProps {
  series: ConcreteSeries;
  scale: LinearScale;
  stage: Stage;
}

export const TICKS_COUNT = 5;

export const SingleYAxis: React.SFC<SingleYAxisProps> = props => {
  const { scale, series, stage } = props;
  return <div>
    <svg viewBox={stage.getViewBox()}>
      <VerticalAxis
        stage={stage}
        ticks={pickTicks(scale, TICKS_COUNT)}
        tickSize={10}
        scale={scale}
        formatter={series.formatter()} />
    </svg>
  </div>;
};
