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
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { classNames } from "../../utils/dom/dom";
import { BubbleMenu, Direction } from "../bubble-menu/bubble-menu";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./measure-actions-menu.scss";

const ACTION_SIZE = 58;

export interface MeasureActionsMenuProps {
  direction: Direction;
  containerStage: Stage;
  openOn: Element;
}

export interface MeasureActionsProps {
  newExpression: Unary<Measure, void>;
  addSeries: Unary<Measure, void>;
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
    stage={Stage.fromSize(ACTION_SIZE * 2, ACTION_SIZE)}
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
  const { newExpression, series, measure, onClose, addSeries } = props;
  const disabled = series.hasMeasure(measure);

  function onAddSeries() {
    if (!disabled) addSeries(measure);
    onClose();
  }

  function onNewExpression() {
    newExpression(measure);
    onClose();
  }

  return <React.Fragment>
    <div className={classNames("add-series", "action", { disabled })} onClick={onAddSeries}>
      <SvgIcon svg={require("../../icons/preview-subsplit.svg")} />
      <div className="action-label">{STRINGS.add}</div>
    </div>
    <div className={classNames("new-expression", "action")} onClick={onNewExpression}>
      <SvgIcon svg={require("../../icons/full-edit.svg")} />
      <div className="action-label">Expression</div>
    </div>
  </React.Fragment>;
};
