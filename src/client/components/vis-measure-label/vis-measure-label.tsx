/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import * as React from "react";
import { Delta } from "..";
import { Measure, MeasureDerivation } from "../../../common/models/index";
import "./vis-measure-label.scss";

export interface VisMeasureLabelProps {
  measure: Measure;
  datum: Datum;
  showPrevious: boolean;
}

function renderPrevious(measure: Measure, datum: Datum): JSX.Element {
  const current = datum[measure.name] as number;
  const previous = datum[measure.getDerivedName(MeasureDerivation.PREVIOUS)] as number;
  return <React.Fragment>
    <span className="measure-previous-value">
      {measure.formatFn(previous)}
      </span>
    <Delta formatter={measure.formatFn}
           currentValue={current}
           previousValue={previous}/>
  </React.Fragment>;
}

export const VisMeasureLabel: React.SFC<VisMeasureLabelProps> = ({ measure, datum, showPrevious }) => {
  return <div className="vis-measure-label">
    <span className="measure-title">{measure.title}</span>
    <span className="colon">: </span>
    <span className="measure-value">{measure.formatDatum(datum)}</span>
    {showPrevious && renderPrevious(measure, datum)}
  </div>;
};
