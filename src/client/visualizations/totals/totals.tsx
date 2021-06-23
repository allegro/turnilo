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

import { Dataset } from "plywood";
import * as React from "react";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { Total } from "./total";
import "./totals.scss";

export class Totals extends React.Component<VisualizationProps> {
  renderTotals(dataset: Dataset): JSX.Element[] {
    const { essence } = this.props;
    const series = essence.getConcreteSeries().toArray();
    const datum = dataset.data[0];
    return series.map(series =>
      <Total
        key={series.reactKey()}
        series={series}
        datum={datum}
        showPrevious={essence.hasComparison()}
      />);

  }

  render() {
    const { data } = this.props;
    return <div className="total-container">
        {this.renderTotals(data)}
    </div>;
  }
}
