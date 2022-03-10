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
import { Map } from "immutable";
import { Datum } from "plywood";
import React from "react";
import { Essence } from "../../../../common/models/essence/essence";
import { classNames } from "../../../utils/dom/dom";
import "./measure-row.scss";
import { MeasureValue } from "./measure-value";

interface MeasureRowProps {
  essence: Essence;
  highlight: boolean;
  dimmed: boolean;
  style: React.CSSProperties;
  datum: Datum;
  cellWidth: number;
  scales: Map<string, d3.ScaleLinear<number, number>>;
  showBar: boolean;
}

export const MeasureRow: React.FunctionComponent<MeasureRowProps> = props => {
  const { datum, showBar, scales, cellWidth, highlight, dimmed, style, essence } = props;

  const concreteSeries = essence.getConcreteSeries().toArray();

  return <div
    className={classNames("measure-row", { highlight, dimmed })}
    style={style}
  >
    {concreteSeries.map(series => {
      return <MeasureValue
        key={series.reactKey()}
        series={series}
        datum={datum}
        highlight={highlight}
        barScale={showBar ? scales.get(series.reactKey()) : null}
        cellWidth={cellWidth}
        showPrevious={essence.hasComparison()} />;
    })}
  </div>;
};
