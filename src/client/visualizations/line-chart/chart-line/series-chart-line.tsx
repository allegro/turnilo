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
import { Essence } from "../../../../common/models/essence/essence";
import { ConcreteSeries, SeriesDerivation } from "../../../../common/models/series/concrete-series";
import { Unary } from "../../../../common/utils/functional/functional";
import { readNumber } from "../../../../common/utils/general/general";
import { ChartLine, ChartLineProps } from "./chart-line";

interface OwnProps {
  essence: Essence;
  series: ConcreteSeries;
}

export type SeriesChartLineProps = Pick<ChartLineProps, "showArea" | "getX" | "xScale" | "yScale" | "dataset" | "color" | "stage"> & OwnProps;

export const SeriesChartLine: React.FunctionComponent<SeriesChartLineProps> = props => {
  const { showArea, essence, series, getX, stage, dataset, xScale, yScale, color } = props;

  const getY: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d));
  const getYP: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d, SeriesDerivation.PREVIOUS));
  const hasComparison = essence.hasComparison();
  return <React.Fragment key={series.reactKey()}>
    <ChartLine
      key="current"
      xScale={xScale}
      yScale={yScale}
      getX={getX}
      getY={getY}
      showArea={showArea}
      color={color}
      dashed={false}
      dataset={dataset}
      stage={stage} />
    {hasComparison && <ChartLine
      key="previous"
      xScale={xScale}
      yScale={yScale}
      getX={getX}
      getY={getYP}
      showArea={showArea}
      color={color}
      dashed={true}
      dataset={dataset}
      stage={stage} />}
  </React.Fragment>;

};
