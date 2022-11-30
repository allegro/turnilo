/*
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
import { useSettingsContext } from "../../../views/cube-view/settings-context";
import "./legend.scss";

export interface LegendProps {
  values: string[];
  title: string;
}

interface LegendValuesProps {
  values: string[];
}

const LegendValues: React.FunctionComponent<LegendValuesProps> = props => {
  const { customization: { visualizationColors } } = useSettingsContext();
  const { values } = props;
  return <div className="legend-values">
    <table className="legend-values-table">
      <tbody>
      {values.map((value, i) => {
        const style = { background: visualizationColors.series[i] };
        return <tr key={value} className="legend-value">
          <td className="legend-value-color-cell">
            <div className="legend-value-color" style={style} />
          </td>
          <td className="legend-value-label">
            <span className="legend-value-name">{value}</span>
          </td>
        </tr>;
      })}
      </tbody>
    </table>
  </div>;
};

export const Legend: React.FunctionComponent<LegendProps> = props => {
  const { values, title } = props;

  return <div className="line-chart-legend">
    <div className="legend-header">
      {title}
    </div>
    <LegendValues values={values} />
  </div>;
};
