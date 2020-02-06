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
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { SeriesSort, Sort, SortDirection } from "../../../common/models/sort/sort";
import { flatMap } from "../../../common/utils/functional/functional";
import { MeasureHeaderCell } from "./measure-header-cell";

interface MeasuresHeaderProps {
  cellWidth: number;
  series: ConcreteSeries[];
  commonSort: Sort;
  showPrevious: boolean;
}

export const MeasuresHeader: React.SFC<MeasuresHeaderProps> = props => {
  const { cellWidth, series, commonSort, showPrevious } = props;

  function sortDirection(series: ConcreteSeries, period = SeriesDerivation.CURRENT): SortDirection | null {
    const isSortedBy = commonSort instanceof SeriesSort && commonSort.reference === series.definition.key() && commonSort.period === period;
    return isSortedBy ? commonSort.direction : null;
  }

  return <React.Fragment>
    {flatMap(series, serie => {
      const isCurrentSorted = sortDirection(serie);

      const currentMeasure = <MeasureHeaderCell
        key={serie.reactKey()}
        width={cellWidth}
        title={serie.title()}
        sort={sortDirection(serie)} />;

      if (!showPrevious) {
        return [currentMeasure];
      }

      return [
        currentMeasure,
        <MeasureHeaderCell
          key={serie.reactKey(SeriesDerivation.PREVIOUS)}
          width={cellWidth}
          title={serie.title(SeriesDerivation.PREVIOUS)}
          sort={sortDirection(serie, SeriesDerivation.PREVIOUS)} />,
        <MeasureHeaderCell
          className="measure-delta"
          key={serie.reactKey(SeriesDerivation.DELTA)}
          width={cellWidth}
          title="Difference"
          sort={sortDirection(serie, SeriesDerivation.DELTA)} />
      ];
    })}
  </React.Fragment>;
};
