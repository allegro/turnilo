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
import { ArithmeticExpression, ArithmeticOperation } from "../../../common/models/expression/concreteArithmeticOperation";
import { ExpressionSeriesOperation } from "../../../common/models/expression/expression";
import { ClientMeasure, isApproximate } from "../../../common/models/measure/measure";
import { ClientMeasures, findMeasureByName } from "../../../common/models/measure/measures";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ExpressionConcreteSeries } from "../../../common/models/series/expression-concrete-series";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { Series } from "../../../common/models/series/series";
import { SeriesFormat } from "../../../common/models/series/series-format";
import { Binary, values } from "../../../common/utils/functional/functional";
import { isTruthy } from "../../../common/utils/general/general";
import { Dropdown } from "../dropdown/dropdown";
import "./arithmetic-series-menu.scss";
import { FormatPicker } from "./format-picker";

interface ArithmeticOperationSeriesMenuProps {
  measure: ClientMeasure;
  measures: ClientMeasures;
  seriesList: SeriesList;
  series: ExpressionSeries;
  initialSeries: Series;
  onChange: Binary<ExpressionSeries, boolean, void>;
}

interface Operation {
  id: ArithmeticOperation;
  label: string;
}

const OPERATIONS: Operation[] = [{
  id: ExpressionSeriesOperation.ADD, label: "Add"
}, {
  id: ExpressionSeriesOperation.SUBTRACT, label: "Subtract"
}, {
  id: ExpressionSeriesOperation.MULTIPLY, label: "Multiply"
}, {
  id: ExpressionSeriesOperation.DIVIDE, label: "Divide"
}];

const renderOperation = (op: Operation): string => op.label;

const renderMeasure = (m: ClientMeasure): string => m.title;
const renderSelectedMeasure = (m: ClientMeasure): string => m ? m.title : "Select measure";

function expressionSeriesTitle(series: ExpressionSeries, measure: ClientMeasure, measures: ClientMeasures): string {
  const concreteSeries = new ExpressionConcreteSeries(series, measure, measures);
  return concreteSeries.title();
}

export const ArithmeticSeriesMenu: React.FunctionComponent<ArithmeticOperationSeriesMenuProps> = props => {
  const { measure, measures, initialSeries, series, seriesList, onChange } = props;

  function isSeriesValid({ expression }: ExpressionSeries): boolean {
    return expression instanceof ArithmeticExpression && isTruthy(expression.reference);
  }

  function onSeriesChange(series: ExpressionSeries) {
    onChange(series, isSeriesValid(series));
  }

  function onFormatChange(format: SeriesFormat) {
    onSeriesChange(series.set("format", format));
  }

  function onOperationSelect({ id }: Operation) {
    onSeriesChange(series.setIn(["expression", "operation"], id));
  }

  function onOperandSelect({ name }: ClientMeasure) {
    onSeriesChange(series.setIn(["expression", "reference"], name));
  }

  const otherSeries = seriesList.removeSeries(initialSeries);
  const duplicate = otherSeries.getSeriesWithKey(series.key());
  const expression = series.expression as ArithmeticExpression;
  const operation = OPERATIONS.find(op => op.id === expression.operation);
  const operand = findMeasureByName(measures, expression.reference);
  const items = values(measures.byName).filter(m => m.name !== measure.name && !isApproximate(m));

  return <React.Fragment>
    <div className="operation-select__title">Select operation</div>
    <Dropdown<Operation>
      className="operation-select"
      items={OPERATIONS}
      renderItem={renderOperation}
      equal={(a, b) => a.id === b.id}
      selectedItem={operation}
      onSelect={onOperationSelect}
    />
    <div className="operand-select__title">Select measure</div>
    <Dropdown<ClientMeasure>
      className="operand-select"
      items={items}
      renderItem={renderMeasure}
      renderSelectedItem={renderSelectedMeasure}
      equal={(a, b) => a.name === b.name}
      selectedItem={operand}
      onSelect={onOperandSelect}
    />
    {duplicate &&
    <div className="arithmetic-operation-warning">
      "{expressionSeriesTitle(duplicate as ExpressionSeries, measure, measures)}" is already defined
    </div>}
    <FormatPicker
      measure={measure}
      format={series.format}
      formatChange={onFormatChange}
    />
  </React.Fragment>;
};
