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
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { cons, threadConditionally } from "../../../../../common/utils/functional/functional";
import { SPLIT } from "../../../../config/constants";
import { selectSplitDataset, selectSplitDatums } from "../../../../utils/dataset/selectors/selectors";

export function selectBase(datum: Datum, series: ConcreteSeries, period = SeriesDerivation.CURRENT): number {
  return datum[stackBaseKey(series, period)] as number;
}

function stackBaseKey(series: ConcreteSeries, period = SeriesDerivation.CURRENT): string {
  return `__stack_base_${series.plywoodKey(period)}`;
}

function stackBy(series: ConcreteSeries, period = SeriesDerivation.CURRENT) {
  return (datum: Datum): Datum => {
    const values = selectSplitDatums(datum);
    const { y0, stacked } = values.reduce(({ y0, stacked }, value) => {
      const y = series.selectValue(value, period);
      const baseKey = stackBaseKey(series, period);

      return {
        y0: y + y0,
        stacked: cons(stacked, { ...value, [baseKey]: y0 })
      };

    }, { y0: 0, stacked: [] });

    const maxKey = series.plywoodKey(period);
    return {
      ...datum,
      [maxKey]: y0,
      [SPLIT]: selectSplitDataset(datum).changeData(stacked)
    };
  };
}

export function stack(datums: Datum[], series: ConcreteSeries, includePrevious: boolean): Datum[] {
  return datums.map(datum =>
    threadConditionally(datum,
      stackBy(series),
      includePrevious && stackBy(series, SeriesDerivation.PREVIOUS)));
}
