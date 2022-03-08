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

import { List } from "immutable";
import { Dataset } from "plywood";
import React from "react";
import { ReactNode } from "react";
import { Essence } from "../../../../common/models/essence/essence";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Binary, Nullary, Unary } from "../../../../common/utils/functional/functional";
import { GlobalEventListener } from "../../../components/global-event-listener/global-event-listener";
import { toFilterClause } from "../../../utils/highlight-clause/highlight-clause";
import { mouseEventOffset } from "../../../utils/mouse-event-offset/mouse-event-offset";
import { Highlight } from "../../highlight-controller/highlight";
import { ContinuousRange, ContinuousScale, ContinuousValue } from "../utils/continuous-types";
import { getContinuousReference } from "../utils/splits";
import { constructRange, shiftByOne } from "./continuous-range";
import { findClosestDatum } from "./find-closest-datum";
import { createDragging, createHighlight, createHover, Interaction, isDragging, isHighlight, isHover, MouseInteraction } from "./interaction";
import { snapRangeToGrid } from "./snap-range-to-grid";

interface InteractionControllerProps {
  xScale: ContinuousScale;
  essence: Essence;
  dataset: Dataset;
  children: Unary<InteractionsProps, ReactNode>;
  highlight?: Highlight;
  saveHighlight: Binary<List<FilterClause>, string, void>;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  chartsContainerRef: React.RefObject<HTMLDivElement>;
}

interface InteractionsState {
  interaction: MouseInteraction | null;
  scrollTop: number;
}

export interface InteractionsProps {
  interaction: Interaction | null;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  dragStart: Binary<string, number, void>;
  handleHover: Binary<string, number, void>;
  mouseLeave: Nullary<void>;
}

export class InteractionController extends React.Component<InteractionControllerProps, InteractionsState> {

  state: InteractionsState = { interaction: null, scrollTop: 0 };

  handleHover = (chartId: string, offset: number) => {
    // calculate hover range and setState
    const { interaction } = this.state;
    if (isDragging(interaction) || isHighlight(interaction)) return;
    const hoverRange = this.findRangeUnderOffset(offset);
    if (hoverRange === null) {
      this.setState({ interaction: null });
      return;
    }
    /*
      Plywood expects that `equals` argument in concrete Range types (NumberRange, TimeRange)
      have exact type as object. Because we move union type into covariant position, typescript
      would expect that `hoverRange` has type NumberRange & TimeRange which is impossible.
      Plywood handles mismatched types correctly.
     */
    // @ts-ignore
    if (isHover(interaction) && interaction.range.equals(hoverRange)) return;
    this.setState({ interaction: createHover(chartId, hoverRange) });
  };

  onMouseLeave = () => {
    const { interaction } = this.state;
    if (!isHover(interaction)) return;
    this.setState({ interaction: null });
  };

  handleDragStart = (chartId: string, offset: number) => {
    const { essence: { timezone } } = this.props;
    const start = this.findValueUnderOffset(offset);
    const end = shiftByOne(start, timezone);
    this.setState({ interaction: createDragging(chartId, start, end) });
  };

  private calculateOffset(e: MouseEvent): number | null {
    const { chartsContainerRef } = this.props;
    if (!chartsContainerRef.current) return null;
    const [x] = mouseEventOffset(e);
    const { left } = chartsContainerRef.current.getBoundingClientRect();
    return x - left;
  }

  dragging = (e: MouseEvent) => {
    const { interaction } = this.state;
    if (!isDragging(interaction)) return;
    const offset = this.calculateOffset(e);
    if (offset === null) return;
    const end = this.findValueUnderOffset(offset);
    const { start, key } = interaction;
    this.setState({ interaction: createDragging(key, start, end) });
  };

  stopDragging = (e: MouseEvent) => {
    const { interaction } = this.state;
    if (!isDragging(interaction)) return;
    const offset = this.calculateOffset(e);
    if (offset === null) return;
    this.setState({ interaction: null });
    const { essence, saveHighlight } = this.props;
    const { start, key } = interaction;
    const end = this.findValueUnderOffset(offset);
    const range = snapRangeToGrid(constructRange(start, end, essence.timezone), essence);
    saveHighlight(List.of(toFilterClause(range, getContinuousReference(essence))), key);
  };

  private findValueUnderOffset(offset: number): ContinuousValue {
    const { xScale } = this.props;
    return xScale.invert(offset);
  }

  private findRangeUnderOffset(offset: number): ContinuousRange | null {
    const value = this.findValueUnderOffset(offset);
    const { essence, xScale, dataset } = this.props;
    const closestDatum = findClosestDatum(value, essence, dataset, xScale);
    const range = closestDatum && closestDatum[getContinuousReference(essence)];
    return range as ContinuousRange;
  }

  scrollCharts = (scrollEvent: MouseEvent) => {
    const { scrollTop } = scrollEvent.target as Element;

    this.setState({
      interaction: null,
      scrollTop
    });
  };

  interaction(): Interaction | null {
    const { highlight } = this.props;
    if (highlight) return createHighlight(highlight);
    return this.state.interaction;
  }

  render() {
    const interaction = this.interaction();
    const { children, acceptHighlight, dropHighlight } = this.props;
    const hocProps: InteractionsProps = {
      interaction,
      acceptHighlight,
      dropHighlight,
      dragStart: this.handleDragStart,
      handleHover: this.handleHover,
      mouseLeave: this.onMouseLeave
    };
    return <React.Fragment>
      <GlobalEventListener
        mouseUp={this.stopDragging}
        mouseMove={this.dragging}
        scroll={this.scrollCharts} />
      {children(hocProps)}
    </React.Fragment>;
  }
}
