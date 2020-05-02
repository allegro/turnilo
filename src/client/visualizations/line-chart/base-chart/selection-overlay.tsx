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

import { Range } from "plywood";
import * as React from "react";
import { Highlighter } from "../../../components/highlighter/highlighter";
import { constructRange } from "../interactions/construct-range";
import { Interaction, isDragging, isHighlight } from "../interactions/interaction";
import { isValidClause } from "../utils/is-valid-clause";
import { ContinuousScale } from "../utils/scale";

interface SelectionOverlayProps {
  interaction: Interaction;
  xScale: ContinuousScale;
}

export const SelectionOverlay: React.SFC<SelectionOverlayProps> = props => {
  const { interaction, xScale } = props;
  if (isDragging(interaction)) {
    const range = constructRange(interaction.start, interaction.end);
    return <Highlighter highlightRange={range} scaleX={xScale} />;
  }
  if (isHighlight(interaction)) {
    const { clause } = interaction;
    if (!isValidClause(clause)) {
      throw new Error(`Expected FixedTime or Number Filter clause. Got: ${clause}`);
    }
    const range = Range.fromJS(clause.values.first());
    return <Highlighter highlightRange={range} scaleX={xScale} />;
  }
  return null;
};
