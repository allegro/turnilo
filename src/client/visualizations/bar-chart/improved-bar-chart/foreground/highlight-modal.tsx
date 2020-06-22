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

import { Timezone } from "chronoshift";
import { Datum } from "plywood";
import * as React from "react";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { formatValue } from "../../../../../common/utils/formatter/formatter";
import { Nullary, Unary } from "../../../../../common/utils/functional/functional";
import { HighlightModal as BaseHighlightModal } from "../../../../components/highlight-modal/highlight-modal";
import { LinearScale } from "../../../../utils/linear-scale/linear-scale";
import { Highlight } from "../interactions/interaction";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";

interface HighlightModalProps {
  interaction: Highlight;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  timezone: Timezone;
  xScale: XScale;
  yScale: LinearScale;
  series: ConcreteSeries;
  getX: Unary<Datum, DomainValue>;
  rect: ClientRect | DOMRect;
}

export const HighlightModal: React.SFC<HighlightModalProps> = props => {
  const {
    timezone,
    rect: { left, top },
    interaction: { datum },
    dropHighlight,
    acceptHighlight,
    yScale,
    getX,
    series,
    xScale } = props;
  const xValue = getX(datum);
  const x = xScale.calculate(xValue) + (xScale.rangeBand() / 2);
  const yValue = series.selectValue(datum);
  const y = yScale(yValue);
  return <BaseHighlightModal
    title={formatValue(xValue, timezone)}
    left={left + x}
    top={top + y}
    dropHighlight={dropHighlight}
    acceptHighlight={acceptHighlight} />;
};
