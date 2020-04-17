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

import { NumberRange, TimeRange } from "plywood";
import * as React from "react";
import { HighlightTooltip, HoverTooltip } from "../../../components/line-chart-tooltip/line-chart-tooltip";
import { VIS_H_PADDING } from "../../../config/constants";

interface TooltipProps {
}

export const Tooltip: React.SFC<TooltipProps> = props => {
  // const { essence } = props;
  //
  // const { containerYPosition, containerXPosition, scrollTop, dragRange } = this.state;
  // const { dragOnSeries, scaleX, hoverRange } = props;
  //
  // const highlightOnDifferentSeries = this.hasHighlight() && !this.highlightOn(series.definition.key());
  // if (highlightOnDifferentSeries) return null;
  //
  // const topOffset = chartStage.height * chartIndex + scaleY(extentY[1]) + TEXT_SPACER - scrollTop;
  // if (topOffset < 0) return null;
  //
  // if ((dragRange && dragOnSeries.equals(series)) || (!dragRange && this.highlightOn(series.definition.key()))) {
  //   const highlightRange = dragRange || this.highlightRange();
  //   const leftOffset = containerXPosition + VIS_H_PADDING + scaleX(highlightRange.midpoint());
  //   return <HighlightTooltip
  //     highlightRange={highlightRange}
  //     dataset={dataset}
  //     series={series}
  //     essence={essence}
  //     dropHighlight={this.dropHighlight}
  //     acceptHighlight={this.acceptHighlight}
  //     topOffset={topOffset + containerYPosition}
  //     leftOffset={leftOffset} />;
  // } else if (!dragRange && hoverRange) {
  //   const leftOffset = VIS_H_PADDING + scaleX((hoverRange as NumberRange | TimeRange).midpoint());
  //   return <HoverTooltip
  //     hoverRange={hoverRange}
  //     dataset={dataset}
  //     series={series}
  //     essence={essence}
  //     topOffset={topOffset}
  //     leftOffset={leftOffset}
  //   />;
  // }

  return null;
};
