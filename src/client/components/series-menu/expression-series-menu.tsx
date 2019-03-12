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

import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { ExpressionSeries, ExpressionSeriesOperation } from "../../../common/models/series/expression-series";
import { SeriesFormat } from "../../../common/models/series/series-format";
import { Unary } from "../../../common/utils/functional/functional";
import { Dropdown } from "../dropdown/dropdown";
import { FormatPicker } from "./format-picker";

interface ExpressionSeriesMenuProps {
  measure: Measure;
  series: ExpressionSeries;
  onChange: Unary<ExpressionSeries, void>;
}

interface Operation {
  id: ExpressionSeriesOperation;
  label: string;
}

const OPERATIONS: Operation[] = [{
  id: ExpressionSeriesOperation.PERCENT_OF_PARENT, label: "Percent of parent"
}, {
  id: ExpressionSeriesOperation.PERCENT_OF_TOTAL, label: "Percent of total"
}];

export const ExpressionSeriesMenu: React.SFC<ExpressionSeriesMenuProps> = ({ series, measure, onChange }) => {

  function onFormatChange(format: SeriesFormat) {
    onChange(series.set("format", format));
  }

  function onOperationSelect({ id }: Operation) {
    // sometimes could yield invalid series!!
    onChange(series.set("operation", id));
  }

  return <React.Fragment>
    <FormatPicker
      measure={measure}
      format={series.format}
      formatChange={onFormatChange}
    />
    <Dropdown<Operation>
      items={OPERATIONS}
      equal={(a, b) => a.id === b.id}
      selectedItem={OPERATIONS.find(op => op.id === series.operation)}
      onSelect={onOperationSelect}
    />
  </React.Fragment>;
};
