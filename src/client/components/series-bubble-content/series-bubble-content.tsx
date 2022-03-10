/*
 * Copyright 2017-2020 Allegro.pl
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
import React from "react";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { MeasureBubbleContent } from "../measure-bubble-content/measure-bubble-content";

interface SeriesBubbleContentProps {
  series: ConcreteSeries;
  datum: Datum;
  showPrevious: boolean;
}

export const SeriesBubbleContent: React.FunctionComponent<SeriesBubbleContentProps> = props => {
  const { series, datum, showPrevious } = props;
  if (!showPrevious) {
    return <React.Fragment>
      {series.formatValue(datum)}
    </React.Fragment>;
  }
  const currentValue = series.selectValue(datum);
  const previousValue = series.selectValue(datum, SeriesDerivation.PREVIOUS);
  const formatter = series.formatter();
  return <MeasureBubbleContent
    lowerIsBetter={series.measure.lowerIsBetter}
    formatter={formatter}
    current={currentValue}
    previous={previousValue}
  />;
};
