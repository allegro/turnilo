/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { isApproximate, isQuantile, Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { BubbleMenu, Direction } from "../bubble-menu/bubble-menu";
import { AddArithmeticOperationButton } from "./add-arithmetic-operation";
import { AddMeasureSeriesButton } from "./add-measure-series";
import { AddPercentSeriesButton } from "./add-percent-series";
import { AddQuantileSeriesButton } from "./add-quantile-series";
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
  addPartialSeries: Unary<Series, void>;
  addSeries: Unary<Series, void>;
  series: SeriesList;
  measure: Measure;
  onClose: Fn;
}

export const MeasureActionsMenu: React.FunctionComponent<MeasureActionsMenuProps & MeasureActionsProps> = props => {
  const { direction, containerStage, openOn, measure, onClose } = props;
  if (!measure) return null;

  const actions = measureActions(props);

  return <BubbleMenu
    className="measure-actions-menu"
    direction={direction}
    containerStage={containerStage}
    stage={Stage.fromSize(MENU_PADDING + ACTION_WIDTH * actions.length, ACTION_HEIGHT + MENU_PADDING)}
    fixedSize={true}
    openOn={openOn}
    onClose={onClose}
  >
    {actions}
  </BubbleMenu>;
};

function measureActions(props: MeasureActionsProps): JSX.Element[] {
  const { series, measure, onClose, addSeries, addPartialSeries } = props;

  if (isQuantile(measure)) {
    return [
      <AddQuantileSeriesButton
        key="Add"
        addSeries={addSeries}
        addPartialSeries={addPartialSeries}
        measure={measure}
        series={series}
        onClose={onClose} />
    ];
  }

  if (isApproximate(measure)) {
    return [
      <AddMeasureSeriesButton
        key="Add"
        addSeries={addSeries}
        series={series}
        measure={measure}
        onClose={onClose} />
    ];
  }

  return [
    <AddMeasureSeriesButton
      key="Add"
      addSeries={addSeries}
      series={series}
      measure={measure}
      onClose={onClose} />,
    <AddPercentSeriesButton
      key="Percent"
      addSeries={addSeries}
      measure={measure}
      onClose={onClose}
      series={series} />,
    <AddArithmeticOperationButton
      key="Arithmetic"
      addPartialSeries={addPartialSeries}
      measure={measure}
      onClose={onClose} />
  ];
}
