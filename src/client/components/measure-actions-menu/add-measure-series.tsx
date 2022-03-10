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
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { MeasureSeries } from "../../../common/models/series/measure-series";
import { Series } from "../../../common/models/series/series";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { classNames } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";

interface AddMeasureSeriesButtonProps {
  addSeries: Unary<Series, void>;
  series: SeriesList;
  measure: Measure;
  onClose: Fn;
}

export const AddMeasureSeriesButton: React.FunctionComponent<AddMeasureSeriesButtonProps> = props => {
  const { series, measure, onClose, addSeries } = props;
  const measureDisabled = series.hasMeasure(measure);

  function onAddSeries() {
    if (!measureDisabled) addSeries(MeasureSeries.fromMeasure(measure));
    onClose();
  }

  return <div className={classNames("add-series", "action", { disabled: measureDisabled })} onClick={onAddSeries}>
    <SvgIcon svg={require("../../icons/preview-subsplit.svg")} />
    <div className="action-label">{STRINGS.add}</div>
  </div>;
};
