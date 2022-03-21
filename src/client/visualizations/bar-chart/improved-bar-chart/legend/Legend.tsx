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
import { StackedBarChartModel } from "../utils/bar-chart-model";
import "./legend.scss";

interface LegendProps {
  model: StackedBarChartModel;
}

interface LegendValuesProps {
  colors: StackedBarChartModel["colors"];
}

const LegendValues: React.FunctionComponent<LegendValuesProps> = ({ colors }) => {
  return <div className="legend-values">
    <table className="legend-values-table">
      <tbody>
      {colors.entrySeq().toArray().map(([segment, color]) => {
        const style = { background: color };
        return <tr key={segment} className="legend-value">
          <td className="legend-value-color-cell">
            <div className="legend-value-color" style={style} />
          </td>
          <td className="legend-value-label">
            <span className="legend-value-name">{segment}</span>
          </td>
        </tr>;
      })}
      </tbody>
    </table>
  </div>;
};

export const Legend: React.FunctionComponent<LegendProps> = props => {
  const { model: { nominalSplit, nominalDimension, colors } } = props;
  const title = nominalSplit.getTitle(nominalDimension);

  return <div className="bar-chart-legend">
    <div className="legend-header">
      {title}
    </div>
    <LegendValues colors={colors} />
  </div>;
};
