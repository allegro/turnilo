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
import React from "react";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { Delta } from "../delta/delta";

export interface ColorEntry {
  color: string;
  name: string;
  value: string;
  previous?: string;
  delta?: JSX.Element;
}

interface Parameters {
  color: string;
  name: string;
  series: ConcreteSeries;
  datum: Datum;
  hasComparison: boolean;
}

export function createColorEntry({ color, name, series, datum, hasComparison }: Parameters): ColorEntry {
  const current = {
    color,
    name,
    value: series.formatValue(datum)
  };

  if (!hasComparison) return current;

  return {
    ...current,
    previous: series.formatValue(datum, SeriesDerivation.PREVIOUS),
    delta: <Delta
      currentValue={series.selectValue(datum)}
      previousValue={series.selectValue(datum, SeriesDerivation.PREVIOUS)}
      lowerIsBetter={series.measure.lowerIsBetter}
      formatter={series.formatter()} />
  };
}
