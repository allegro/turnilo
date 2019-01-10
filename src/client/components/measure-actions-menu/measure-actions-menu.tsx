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
import { Essence } from "../../../common/models/essence/essence";
import { Measure } from "../../../common/models/measure/measure";
import { createExpression, fromMeasure, SeriesDefinition } from "../../../common/models/series/series-definition";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { classNames } from "../../utils/dom/dom";
import { BubbleMenu, Direction } from "../bubble-menu/bubble-menu";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./measure-actions-menu.scss";

const ACTION_SIZE = 66;

export interface MeasureActionsMenuProps {
  direction: Direction;
  containerStage: Stage;
  openOn: Element;
}

export interface MeasureActionsProps {
  essence: Essence;
  measure: Measure;
  onClose: Fn;
  appendSeries: Unary<SeriesDefinition, void>;
  promptSeries: Unary<SeriesDefinition, void>;
}

export const MeasureActionsMenu: React.SFC<MeasureActionsMenuProps & MeasureActionsProps> = ({ promptSeries, essence, appendSeries, direction, containerStage, openOn, measure, onClose }) => {
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
      onClose={onClose}
      promptSeries={promptSeries}
      appendSeries={appendSeries}
      essence={essence}
      measure={measure}
    />
  </BubbleMenu>;
};

export const MeasureActions: React.SFC<MeasureActionsProps> = ({ essence, measure, onClose, appendSeries, promptSeries }) => {
  // TODO: rethink when disabled
  const disabled = !measure.isQuantile() && essence.series.hasSeriesForMeasure(measure);

  function onAdd() {
    if (measure.isQuantile()) {
      promptSeries(fromMeasure(measure));
    } else {
      if (!disabled) appendSeries(fromMeasure(measure));
    }
    onClose();
  }

  function onExpression() {
    promptSeries(createExpression(measure));
    onClose();
  }

  return <React.Fragment>
    <div className={classNames("add", "action", { disabled })} onClick={onAdd}>
      <SvgIcon svg={require("../../icons/preview-subsplit.svg")} />
      <div className="action-label">{STRINGS.add}</div>
    </div>
    <div className={classNames("expression", "action")} onClick={onExpression}>
      <SvgIcon svg={require("../../icons/full-edit.svg")} />
      <div className="action-label">{STRINGS.add}</div>
    </div>
  </React.Fragment>;
};
