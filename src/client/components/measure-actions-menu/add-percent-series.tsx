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

import { Set } from "immutable";
import React from "react";
import { ExpressionSeriesOperation } from "../../../common/models/expression/expression";
import { PercentExpression, PercentOperation } from "../../../common/models/expression/percent";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { Series } from "../../../common/models/series/series";
import { PERCENT_FORMAT } from "../../../common/models/series/series-format";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { classNames } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";

const percentOperations = Set.of<PercentOperation>(
  ExpressionSeriesOperation.PERCENT_OF_PARENT,
  ExpressionSeriesOperation.PERCENT_OF_TOTAL);

interface AddPercentSeriesButtonProps {
  addSeries: Unary<Series, void>;
  series: SeriesList;
  measure: Measure;
  onClose: Fn;
}

export const AddPercentSeriesButton: React.FunctionComponent<AddPercentSeriesButtonProps> = props => {
  const { series, measure, addSeries, onClose } = props;

  const percentSeries: Set<PercentOperation> = series
    .getExpressionSeriesFor(measure.name)
    .filter(s => s.expression instanceof PercentExpression)
    .map((s: ExpressionSeries) => s.expression.operation as PercentOperation)
    .toSet();

  const percentsDisabled = percentSeries.count() === 2;

  function onNewPercentExpression() {
    if (!percentsDisabled) {
      const operation = percentOperations.subtract(percentSeries).first();
      addSeries(new ExpressionSeries({
        reference: measure.name,
        format: PERCENT_FORMAT,
        expression: new PercentExpression({ operation })
      }));
    }
    onClose();
  }

  return <div className={classNames("new-percent-expression", "action", { disabled: percentsDisabled })} onClick={onNewPercentExpression}>
    <SvgIcon svg={require("../../icons/full-percent.svg")} />
    <div className="action-label">Percent</div>
  </div>;
};
