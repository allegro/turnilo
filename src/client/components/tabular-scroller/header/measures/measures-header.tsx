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
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { SeriesSort, Sort, SortDirection } from "../../../../../common/models/sort/sort";
import { MeasureHeaderCell } from "./measure-header-cell";

interface MeasuresHeaderProps {
  cellWidth: number;
  series: ConcreteSeries[];
  sort: Sort;
  showPrevious: boolean;
}

function sortDirection(commonSort: Sort, series: ConcreteSeries, period = SeriesDerivation.CURRENT): SortDirection | null {
  const isSortedBy = commonSort instanceof SeriesSort && commonSort.reference === series.definition.key() && commonSort.period === period;
  return isSortedBy ? commonSort.direction : null;
}

export const MeasuresHeader: React.FunctionComponent<MeasuresHeaderProps> = props => {
  const { cellWidth, series, sort, showPrevious } = props;

  return <React.Fragment>
    {series.map(serie => {
      const currentMeasure = <MeasureHeaderCell
        key={serie.reactKey()}
        width={cellWidth}
        title={serie.title()}
        sort={sortDirection(sort, serie)} />;

      if (!showPrevious) {
        return currentMeasure;
      }

      return <React.Fragment key={serie.reactKey()}>
        {currentMeasure}
        <MeasureHeaderCell
          key={serie.reactKey(SeriesDerivation.PREVIOUS)}
          width={cellWidth}
          title={serie.title(SeriesDerivation.PREVIOUS)}
          sort={sortDirection(sort, serie, SeriesDerivation.PREVIOUS)} />
        <MeasureHeaderCell
          className="measure-delta"
          key={serie.reactKey(SeriesDerivation.DELTA)}
          width={cellWidth}
          title="Difference"
          sort={sortDirection(sort, serie, SeriesDerivation.DELTA)} />
      </React.Fragment>;
    })}
  </React.Fragment>;
};
