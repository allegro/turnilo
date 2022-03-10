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

import React from "react";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Stage } from "../../../../../common/models/stage/stage";
import { VerticalAxis } from "../../../../components/vertical-axis/vertical-axis";
import { LinearScale, pickTicks } from "../../../../utils/linear-scale/linear-scale";

export const TICK_LENGTH = 10;

interface SingleYAxisProps {
  series: ConcreteSeries;
  scale: LinearScale;
  stage: Stage;
}

export const SingleYAxis: React.FunctionComponent<SingleYAxisProps> = props => {
  const { scale, series, stage } = props;
  return <div>
    <svg viewBox={stage.getViewBox()}>
      <g transform="translate(-1, 0)">
        <VerticalAxis
          stage={stage}
          ticks={pickTicks(scale)}
          tickSize={TICK_LENGTH}
          scale={scale}
          formatter={series.formatter()} />
      </g>
    </svg>
  </div>;
};
