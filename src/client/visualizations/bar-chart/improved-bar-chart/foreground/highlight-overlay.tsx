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

import { Datum } from "plywood";
import * as React from "react";
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { Stage } from "../../../../../common/models/stage/stage";
import { Unary } from "../../../../../common/utils/functional/functional";
import { Highlighter } from "../../../../components/highlighter/highlighter";
import { LinearScale } from "../../../../utils/linear-scale/linear-scale";
import { TOP_PADDING } from "../bars/bar";
import { Highlight } from "../interactions/interaction";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";

interface HighlightOverlayProps {
  interaction: Highlight;
  xScale: XScale;
  yScale: LinearScale;
  series: ConcreteSeries;
  getX: Unary<Datum, DomainValue>;
  stage: Stage;
  showPrevious: boolean;
}

function getYValue(datum: Datum, series: ConcreteSeries, includePrevious: boolean): number {
  if (!includePrevious) {
    return series.selectValue(datum);
  }
  return Math.max(series.selectValue(datum), series.selectValue(datum, SeriesDerivation.PREVIOUS));
}

export const HighlightOverlay: React.SFC<HighlightOverlayProps> = props => {
  const { stage, yScale, series, xScale, showPrevious, interaction: { datum }, getX } = props;
  const xValue = getX(datum);
  const left = xScale.calculate(xValue);
  const right = left + xScale.rangeBand();
  const yValue = getYValue(datum, series, showPrevious);
  const top = yScale(yValue) + stage.y - TOP_PADDING;
  return <Highlighter left={left} right={right} top={top} />;
};
