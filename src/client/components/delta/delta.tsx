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
import { DataSeries } from "../../../common/models/data-series/data-series";
import { SeriesDerivation } from "../../../common/models/series/series-definition";
import { isNil } from "../../../common/utils/general/general";
import "./delta.scss";

export type DeltaSign = -1 | 0 | 1;

export interface DeltaAttributes {
  delta: string;
  deltaPercentage: string;
  deltaSign: DeltaSign;
}

export function formatDelta(datum: Datum, series: DataSeries): DeltaAttributes {
  const currentValue = series.selectValue(datum);
  const previousValue = series.selectValue(datum, SeriesDerivation.PREVIOUS);
  if (isNil(currentValue) || isNil(previousValue)) {
    return null;
  }
  const deltaValue = series.selectValue(datum, SeriesDerivation.DELTA);
  const delta = series.formatValue(datum, SeriesDerivation.DELTA);

  const diff = currentValue - previousValue;
  const deltaSign = diff ? diff < 0 ? -1 : 1 : 0;
  const deltaRatio = Math.floor((deltaValue / previousValue) * 100);
  const deltaPercentage = isFinite(deltaRatio) ? `${deltaRatio}%` : null;

  return { deltaSign, deltaPercentage, delta };
}

function deltaSignToSymbol(deltaSign: DeltaSign): string {
  switch (deltaSign) {
    case -1:
      return "▼";
    case 0:
      return "";
    case 1:
      return "▲";
  }
}

function deltaSignToClassName(deltaSign: DeltaSign, lowerIsBetter = false): string {
  switch (deltaSign) {
    case -1:
      return lowerIsBetter ? "delta-positive" : "delta-negative";
    case 0:
      return "delta-neutral";
    case 1:
      return lowerIsBetter ? "delta-negative" : "delta-positive";
  }
}

export interface DeltaProps {
  datum: Datum;
  series: DataSeries;
}

export const Delta: React.SFC<DeltaProps> = ({ series, datum }) => {
  const formattedDelta = formatDelta(datum, series);
  if (formattedDelta === null) {
    return <span className="delta-neutral">-</span>;
  }

  const { delta, deltaPercentage, deltaSign } = formattedDelta;
  return <span className={deltaSignToClassName(deltaSign, series.measure.lowerIsBetter)}>
    {deltaSignToSymbol(deltaSign)}
    {delta}
    {deltaPercentage && ` (${deltaPercentage})`}
  </span>;
};
