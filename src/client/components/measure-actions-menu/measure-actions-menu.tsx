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

import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { BubbleMenu, Direction } from "../bubble-menu/bubble-menu";
import { AddArithmeticOperationButton } from "./add-arithmetic-operation";
import { AddMeasureSeriesButton } from "./add-measure-series";
import { AddPercentSeriesButton } from "./add-percent-series";
import "./measure-actions-menu.scss";

const ACTION_HEIGHT = 50;
const ACTION_WIDTH = 58;
const MENU_PADDING = 16;

export interface MeasureActionsMenuProps {
  direction: Direction;
  containerStage: Stage;
  openOn: Element;
}

export interface MeasureActionsProps {
  newExpression: Unary<ExpressionSeries, void>;
  addSeries: Unary<Series, void>;
  series: SeriesList;
  measure: Measure;
  onClose: Fn;
}

export const MeasureActionsMenu: React.SFC<MeasureActionsMenuProps & MeasureActionsProps> = props => {
  const { newExpression, series, addSeries, direction, containerStage, openOn, measure, onClose } = props;
  if (!measure) return null;

  return <BubbleMenu
    className="measure-actions-menu"
    direction={direction}
    containerStage={containerStage}
    stage={Stage.fromSize(MENU_PADDING + ACTION_WIDTH * 3, ACTION_HEIGHT + MENU_PADDING)}
    fixedSize={true}
    openOn={openOn}
    onClose={onClose}
  >
    <MeasureActions
      series={series}
      onClose={onClose}
      addSeries={addSeries}
      newExpression={newExpression}
      measure={measure}
    />
  </BubbleMenu>;
};

export const MeasureActions: React.SFC<MeasureActionsProps> = props => {
  const { series, measure, onClose, addSeries, newExpression } = props;

  return <React.Fragment>
    <AddMeasureSeriesButton addSeries={addSeries} series={series} measure={measure} onClose={onClose} />
    <AddPercentSeriesButton addSeries={addSeries} measure={measure} onClose={onClose} series={series} />
    <AddArithmeticOperationButton addExpressionPlaceholder={newExpression} measure={measure} onClose={onClose} />
  </React.Fragment>;
};
