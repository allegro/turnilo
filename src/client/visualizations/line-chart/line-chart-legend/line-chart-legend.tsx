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

import { Dataset, Datum } from "plywood";
import * as React from "react";
import { NORMAL_COLORS } from "../../../../common/models/colors/colors";
import { Essence } from "../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../common/models/series/concrete-series";
import { SPLIT } from "../../../config/constants";
import "./line-chart-legend.scss";

export interface LineChartLegendProps {
  dataset: Dataset;
  essence: Essence;
}

interface LegendValuesProps {
  dataset: Datum[];
  series?: ConcreteSeries;
  splitReference: string;
}

const LegendValues: React.SFC<LegendValuesProps> = props => {
  const { dataset, series, splitReference } = props;
  return <div className="legend-values">
    <table className="legend-values-table">
      {dataset.map((datum, i) => {
        const splitValue = String(datum[splitReference]);
        const style = { background: NORMAL_COLORS[i] };
        return <tr key={splitValue} className="legend-value">
          <td className="legend-value-color-cell">
            <div className="legend-value-color" style={style} />
          </td>
          <td className="legend-value-label">
            <span className="legend-value-name">{splitValue}</span>
          </td>
          {series && <td className="legend-value-measure">{series.formatValue(datum)}</td>}
        </tr>;
      })}
    </table>
  </div>;
};

export const LineChartLegend: React.SFC<LineChartLegendProps> = props => {
  const { essence, dataset } = props;
  const legendSplit = essence.splits.splits.first();
  const legendDimension = essence.dataCube.getDimension(legendSplit.reference);
  const splitSortReference = legendSplit.sort.reference;
  const series = essence.findConcreteSeries(splitSortReference);

  return <div className="line-chart-legend">
    <div className="legend-header">
      {legendSplit.getTitle(legendDimension)}
    </div>
      <LegendValues
        dataset={(dataset.data[0][SPLIT] as Dataset).data}
        series={series}
        splitReference={legendSplit.reference} />
  </div>;
};
