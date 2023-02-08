/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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
import { ChartProps } from "../../../common/models/chart-props/chart-props";
import {
  ChartPanel,
  DefaultVisualizationControls,
  VisualizationProps
} from "../../views/cube-view/center-panel/center-panel";
import { Total } from "./total";
import "./totals.scss";

const BigNumbers: React.FunctionComponent<ChartProps> = ({ essence, data }) => {
  const series = essence.getConcreteSeries().toArray();
  const datum = data.data[0];
  return <div className="total-container">
    {series.map(series =>
    <Total
      key={series.reactKey()}
      series={series}
      datum={datum}
      showPrevious={essence.hasComparison()}
    />)}
  </div>;
};

export default function TotalsVisualization(props: VisualizationProps) {
  return <React.Fragment>
    <DefaultVisualizationControls {...props} />
    <ChartPanel {...props} chartComponent={BigNumbers}/>
  </React.Fragment>;
}
