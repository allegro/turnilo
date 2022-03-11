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
import { ExpressionSeriesOperation } from "../../../common/models/expression/expression";
import { PercentExpression, PercentOperation } from "../../../common/models/expression/percent";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { SeriesFormat } from "../../../common/models/series/series-format";
import { Binary } from "../../../common/utils/functional/functional";
import { Dropdown } from "../dropdown/dropdown";
import { FormatPicker } from "./format-picker";
import "./percent-series-menu.scss";

interface PercentSeriesMenuProps {
  measure: Measure;
  series: ExpressionSeries;
  seriesList: SeriesList;
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

function operationToExpression(operation: PercentOperation): PercentExpression {
  return new PercentExpression({ operation });
}

const renderOperation = (op: Operation): string => op.label;

export const PercentSeriesMenu: React.FunctionComponent<PercentSeriesMenuProps> = ({ series, seriesList, measure, onChange }) => {

  const selectedOperations = seriesList
    .getExpressionSeriesFor(measure.name)
    .filter(s => !s.equals(series))
    .filter(s => s.expression instanceof PercentExpression)
    .map((s: ExpressionSeries) => s.expression.operation)
    .toSet();

  function isSeriesValid(series: ExpressionSeries): boolean {
    return series.expression instanceof PercentExpression;
  }

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
    <Dropdown<Operation>
      className="percent-operation-picker"
      items={OPERATIONS.filter(({ id }) => !selectedOperations.has(id))}
      renderItem={renderOperation}
      renderSelectedItem={renderOperation}
      equal={(a, b) => a.id === b.id}
      selectedItem={series.expression && OPERATIONS.find(op => op.id === series.expression.operation)}
      onSelect={onOperationSelect}
    />
    <FormatPicker
      measure={measure}
      format={series.format}
      formatChange={onFormatChange}
    />
  </React.Fragment>;
};
