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

import { PlywoodRange, Range } from "plywood";
import * as React from "react";
import { FilterClause, FixedTimeFilterClause, NumberFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Highlighter } from "../../../components/highlighter/highlighter";
import { Interaction, isDragging, isHighlight } from "../interactions/interaction";
import { ContinuousScale } from "../utils/scale";

interface SeriesHighlighterProps {
  scaleX: ContinuousScale;
  interaction: Interaction;
}

function highlightRange(clause: FilterClause): PlywoodRange {
  if ((clause instanceof NumberFilterClause) || (clause instanceof FixedTimeFilterClause)) {
    return Range.fromJS(clause.values.first());
  }
  return null;
}

export const SeriesHighlighter: React.SFC<SeriesHighlighterProps> = props => {
  const { interaction, scaleX } = props;

  if (isDragging(interaction)) {
    const range = Range.fromJS({
      start: interaction.start,
      end: interaction.end
    });
    return <Highlighter highlightRange={range} scaleX={scaleX} />;
  }
  if (isHighlight(interaction)) {
    const range = highlightRange(interaction.clause);
    return <Highlighter highlightRange={range} scaleX={scaleX} />;
  }
  return null;
};
