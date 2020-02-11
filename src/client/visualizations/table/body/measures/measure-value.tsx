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

import * as d3 from "d3";
import { Datum } from "plywood";
import * as React from "react";
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { Delta } from "../../../../components/delta/delta";
import { MeasureBackground } from "./measure-background";
import { MeasureCell } from "./measure-cell";

interface MeasureValueProps {
  series: ConcreteSeries;
  datum: Datum;
  scale: d3.scale.Linear<number, number>;
  cellWidth: number;
  lastLevel: boolean;
  showPrevious: boolean;
  highlight: boolean;
}

export const MeasureValue: React.SFC<MeasureValueProps> = props => {
  const { series, datum, scale, highlight, showPrevious, cellWidth, lastLevel } = props;

  const currentValue = series.selectValue(datum);

  const currentCell = <MeasureCell
    key={series.reactKey()}
    width={cellWidth}
    value={series.formatValue(datum)}
  >
    {lastLevel && <MeasureBackground highlight={highlight} width={scale(currentValue)} />}
  </MeasureCell>;

  if (!showPrevious) {
    return currentCell;
  }

  const previousValue = series.selectValue(datum, SeriesDerivation.PREVIOUS);

  return <React.Fragment>
    {currentCell}
    <MeasureCell
      key={series.reactKey(SeriesDerivation.PREVIOUS)}
      width={cellWidth}
      value={series.formatValue(datum, SeriesDerivation.PREVIOUS)}>
      {lastLevel && <MeasureBackground highlight={highlight} width={scale(previousValue)} />}
    </MeasureCell>
    <MeasureCell
      width={cellWidth}
      key={series.reactKey(SeriesDerivation.DELTA)}
      value={<Delta
        currentValue={currentValue}
        previousValue={previousValue}
        lowerIsBetter={series.measure.lowerIsBetter}
        formatter={series.formatter()}
      />} />
  </React.Fragment>;
};
