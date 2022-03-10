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
import "./measure-cell.scss";

interface MeasureCellProps {
  width: number;
  value: string | JSX.Element;
}

export const MeasureCell: React.FunctionComponent<MeasureCellProps> = props => {
  const { width, value, children } = props;
  return <div className="measure-cell" style={{ width }}>
    {children}
    <div className="measure-label">{value}</div>
  </div>;
};
