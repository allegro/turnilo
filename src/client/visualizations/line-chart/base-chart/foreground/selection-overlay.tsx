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

import { Timezone } from "chronoshift";
import { Range } from "plywood";
import React from "react";
import { Stage } from "../../../../../common/models/stage/stage";
import { Highlighter } from "../../../../components/highlighter/highlighter";
import { constructRange } from "../../interactions/continuous-range";
import { Interaction, isDragging, isHighlight } from "../../interactions/interaction";
import { ContinuousRange, ContinuousScale } from "../../utils/continuous-types";
import { isValidClause } from "../../utils/is-valid-clause";

interface SelectionOverlayProps {
  interaction: Interaction;
  stage: Stage;
  xScale: ContinuousScale;
  timezone: Timezone;
}

function getHighlightRange(interaction: Interaction, timezone: Timezone): ContinuousRange | null {
  if (isDragging(interaction)) {
    return constructRange(interaction.start, interaction.end, timezone);
  }
  if (isHighlight(interaction)) {
    const { clause } = interaction;
    if (!isValidClause(clause)) {
      throw new Error(`Expected FixedTime or Number Filter clause. Got: ${clause}`);
    }
    return Range.fromJS(clause.values.first()) as ContinuousRange;
  }
  return null;
}

export const SelectionOverlay: React.FunctionComponent<SelectionOverlayProps> = props => {
  const { stage, timezone, interaction, xScale } = props;
  const range = getHighlightRange(interaction, timezone);
  if (!range) return null;

  const left = xScale(range.start);
  const right = xScale(range.end);

  return <div style={stage.getLeftTopWidthHeight()}>
    <Highlighter left={left} right={right}/>
  </div>;
};
