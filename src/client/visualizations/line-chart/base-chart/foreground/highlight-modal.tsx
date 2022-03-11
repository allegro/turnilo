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
import React from "react";
import { formatValue } from "../../../../../common/utils/formatter/formatter";
import { Nullary } from "../../../../../common/utils/functional/functional";
import { HighlightModal as BaseHighlightModal } from "../../../../components/highlight-modal/highlight-modal";
import { toPlywoodRange } from "../../../../utils/highlight-clause/highlight-clause";
import { Highlight } from "../../interactions/interaction";
import { ContinuousScale } from "../../utils/continuous-types";

interface HighlightModalProps {
  interaction: Highlight;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  timezone: Timezone;
  xScale: ContinuousScale;
  rect: ClientRect | DOMRect;
}

export const HighlightModal: React.FunctionComponent<HighlightModalProps> = props => {
  const { rect: { left, top }, interaction, timezone, dropHighlight, acceptHighlight, xScale } = props;
  const range = toPlywoodRange(interaction.clause);
  const x = xScale(range.midpoint());
  return <BaseHighlightModal
    title={formatValue(range, timezone)}
    left={left + x}
    top={top + 80}
    dropHighlight={dropHighlight}
    acceptHighlight={acceptHighlight} />;
};
