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

import { second } from "chronoshift";
import { List } from "immutable";
import { Dataset, PlywoodRange } from "plywood";
import * as React from "react";
import { ReactNode } from "react";
import { Essence } from "../../../../common/models/essence/essence";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Binary, Nullary, Unary } from "../../../../common/utils/functional/functional";
import { GlobalEventListener } from "../../../components/global-event-listener/global-event-listener";
import { mouseEventOffset } from "../../../utils/mouse-event-offset/mouse-event-offset";
import { Highlight } from "../../base-visualization/highlight";
import { ContinuousScale } from "../utils/scale";
import { getContinuousReference } from "../utils/splits";
import { constructRange } from "./construct-range";
import { findClosestDatum } from "./find-closest-datum";
import { ContinuousValue, createDragging, createHighlight, createHover, Interaction, isDragging, isHighlight, isHover, MouseInteraction } from "./interaction";
import { snapRangeToGrid } from "./snap-range-to-grid";
import { toFilterClause } from "./to-filter-clause";

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
    if (isHover(interaction) && interaction.range.equals(hoverRange)) return;
    this.setState({ interaction: createHover(chartId, hoverRange) });
  };

  onMouseLeave = () => {
    // if hover, reset interaction
    const { interaction } = this.state;
    if (!isHover(interaction)) return;
    this.setState({ interaction: null });
  };

  handleDragStart = (chartId: string, offset: number) => {
    // calculate dragStart in Dragging and setState
    const { essence: { timezone } } = this.props;
    const start = this.findValueUnderOffset(offset);
    const end = start instanceof Date ? second.shift(start, timezone, 1) : start + 1;
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
    // active only if we're in Dragging. Update dragEnd in state
    const { interaction } = this.state;
    if (!isDragging(interaction)) return;
    const offset = this.calculateOffset(e);
    if (offset === null) return;
    const end = this.findValueUnderOffset(offset);
    const { start, key } = interaction;
    // TODO: remember to ensure that we're inside xScale.domain!
    this.setState({ interaction: createDragging(key, start, end) });
  };

  stopDragging = (e: MouseEvent) => {
    // if we're in Dragging - stop, update dragEnd and saveHighlight (handle highlighting different charts!)
    const { interaction } = this.state;
    if (!isDragging(interaction)) return;
    const offset = this.calculateOffset(e);
    if (offset === null) return;
    this.setState({ interaction: null });
    const { essence, saveHighlight } = this.props;
    const { start, key } = interaction;
    const end = this.findValueUnderOffset(offset);
    // TODO: remember to ensure that we're inside xScale.domain!
    const range = snapRangeToGrid(constructRange(start, end), essence);
    saveHighlight(List.of(toFilterClause(range, getContinuousReference(essence))), key);
  };

  private findValueUnderOffset(offset: number): ContinuousValue {
    const { xScale } = this.props;
    // TODO: remember to ensure that we're inside xScale.domain!
    return xScale.invert(offset);
  }

  private findRangeUnderOffset(offset: number): PlywoodRange | null {
    const value = this.findValueUnderOffset(offset);
    const { essence, xScale, dataset } = this.props;
    const closestDatum = findClosestDatum(value, essence, dataset, xScale);
    const range = closestDatum && closestDatum[getContinuousReference(essence)];
    return range as PlywoodRange;
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
    const { children } = this.props;
    const hocProps: InteractionsProps = {
      interaction,
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
