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

import { Set } from "immutable";
import * as React from "react";
import { ArithmeticExpression } from "../../../common/models/expression/concreteArithmeticOperation";
import { ExpressionSeriesOperation } from "../../../common/models/expression/expression";
import { PercentExpression, PercentOperation } from "../../../common/models/expression/percent";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { Series } from "../../../common/models/series/series";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { classNames } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";

interface AddPercentSeriesButtonProps {
  addExpressionPlaceholder: Unary<Series, void>;
  series: SeriesList;
  measure: Measure;
  onClose: Fn;
}

export const AddArithmeticOperationButton: React.SFC<AddPercentSeriesButtonProps> = props => {
  const { series, measure, addExpressionPlaceholder, onClose } = props;

  const percentSeries: Set<PercentOperation> = series
    .getExpressionSeriesFor(measure.name)
    .filter(s => s.expression instanceof PercentExpression)
    .map((s: ExpressionSeries) => s.expression.operation as PercentOperation)
    .toSet();

  const percentsDisabled = percentSeries.count() === 2;

  function onNewOperation() {
    if (!percentsDisabled) {
      addExpressionPlaceholder(new ExpressionSeries({
        reference: measure.name,
        expression: new ArithmeticExpression({
          operation: ExpressionSeriesOperation.ADD,
          reference: null
        })
      }));
    }
    onClose();
  }

  return <div className={classNames("new-arithmetic-expression", "action", { disabled: percentsDisabled })} onClick={onNewOperation}>
    <SvgIcon svg={require("../../icons/full-add-framed.svg")} />
    <div className="action-label">Arithmetic</div>
  </div>;
};
