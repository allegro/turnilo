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
import { ArithmeticExpression } from "../../../common/models/expression/concreteArithmeticOperation";
import { ExpressionSeriesOperation } from "../../../common/models/expression/expression";
import { Measure } from "../../../common/models/measure/measure";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { Series } from "../../../common/models/series/series";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { classNames } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";

interface AddPercentSeriesButtonProps {
  addPartialSeries: Unary<Series, void>;
  measure: Measure;
  onClose: Fn;
}

export const AddArithmeticOperationButton: React.FunctionComponent<AddPercentSeriesButtonProps> = props => {
  const { measure, addPartialSeries, onClose } = props;

  function onNewOperation() {
    addPartialSeries(new ExpressionSeries({
      reference: measure.name,
      expression: new ArithmeticExpression({
        operation: ExpressionSeriesOperation.ADD,
        reference: null
      })
    }));
    onClose();
  }

  return <div className={classNames("new-arithmetic-expression", "action")} onClick={onNewOperation}>
    <SvgIcon svg={require("../../icons/full-arithmetic.svg")} />
    <div className="action-label">Calculate</div>
  </div>;
};
