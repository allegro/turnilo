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
import { ExpressionSeriesOperation } from "../../../common/models/expression/expression";
import { ExpressionPercentOf, PercentOperation } from "../../../common/models/expression/percent-of";
import { Measure } from "../../../common/models/measure/measure";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { SeriesFormat } from "../../../common/models/series/series-format";
import { Binary } from "../../../common/utils/functional/functional";
import { Dropdown } from "../dropdown/dropdown";
import { FormatPicker } from "./format-picker";

interface ExpressionSeriesMenuProps {
  measure: Measure;
  series: ExpressionSeries;
  onChange: Binary<ExpressionSeries, boolean, void>;
}

interface Operation {
  id: PercentOperation;
  label: string;
}

const OPERATIONS: Operation[] = [{
  id: ExpressionSeriesOperation.PERCENT_OF_PARENT, label: "Percent of parent"
}, {
  id: ExpressionSeriesOperation.PERCENT_OF_TOTAL, label: "Percent of total"
}];

function operationToExpression(operation: PercentOperation): ExpressionPercentOf {
  return new ExpressionPercentOf({ operation });
}

function isSeriesValid(series: ExpressionSeries): boolean {
  return !!series.expression;
}

const renderOperation = (op: Operation): string => op.label;
const renderSelectedOperation = (op: Operation): string => op ? renderOperation(op) : "Select operation";

export const PercentOfSeriesMenu: React.SFC<ExpressionSeriesMenuProps> = ({ series, measure, onChange }) => {

  function onSeriesChange(series: ExpressionSeries) {
    onChange(series, isSeriesValid(series));
  }

  function onFormatChange(format: SeriesFormat) {
    onSeriesChange(series.set("format", format));
  }

  function onOperationSelect({ id }: Operation) {
    onSeriesChange(series.set("expression", operationToExpression(id)));
  }

  return <React.Fragment>
    <FormatPicker
      measure={measure}
      format={series.format}
      formatChange={onFormatChange}
    />
    <Dropdown<Operation>
      items={OPERATIONS}
      renderItem={renderOperation}
      renderSelectedItem={renderSelectedOperation}
      equal={(a, b) => a.id === b.id}
      selectedItem={series.expression && OPERATIONS.find(op => op.id === series.expression.operation)}
      onSelect={onOperationSelect}
    />
  </React.Fragment>;
};
