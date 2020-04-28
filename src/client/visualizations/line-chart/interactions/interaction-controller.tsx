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
import { Dataset, PlywoodRange, Range } from "plywood";
import * as React from "react";
import { ReactNode } from "react";
import { Essence } from "../../../../common/models/essence/essence";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Binary, Nullary, Unary } from "../../../../common/utils/functional/functional";
import { GlobalEventListener } from "../../../components/global-event-listener/global-event-listener";
import { getXFromEvent } from "../../../utils/dom/dom";
import { Highlight } from "../../base-visualization/highlight";
import { ContinuousScale } from "../utils/scale";
import { getContinuousReference } from "../utils/splits";
import { findClosestDatum } from "./find-closest-datum";
import { ContinuousValue, createDragging, createHighlight, createHover, Interaction, isDragging, isHover, MouseInteraction } from "./interaction";
import { snapRangeToGrid } from "./snap-range-to-grid";
import { toFilterClause } from "./to-filter-clause";

interface InteractionControllerProps {
  xScale: ContinuousScale;
  essence: Essence;
  dataset: Dataset;
  children: Unary<InteractionsProps, ReactNode>;
  highlight?: Highlight;
  saveHighlight: Binary<List<FilterClause>, string, void>;
}

interface InteractionsState {
  interaction: MouseInteraction | null;
  scrollTop: number;
}

export interface InteractionsProps {
  interaction: Interaction | null;
  dragStart: Binary<string, React.MouseEvent<HTMLDivElement>, void>;
  handleHover: Binary<string, React.MouseEvent<HTMLDivElement>, void>;
  mouseLeave: Nullary<void>;
}

export class InteractionController extends React.Component<InteractionControllerProps, InteractionsState> {

  state: InteractionsState = { interaction: null, scrollTop: 0 };

  handleHover = (chartId: string, e: React.MouseEvent<HTMLDivElement>) => {
    // calculate hover range and setState
    const hoverRange = this.findRange(e);
    if (hoverRange === null) {
      this.setState({ interaction: null });
      return;
    }
    const { interaction } = this.state;
    if (isHover(interaction) && interaction.range.equals(hoverRange)) return;
    this.setState({ interaction: createHover(chartId, hoverRange) });
  };

  onMouseLeave = () => {
    // if hover, reset interaction
    const { interaction } = this.state;
    if (!isHover(interaction)) return;
    this.setState({ interaction: null });
  };

  handleDragStart = (chartId: string, e: React.MouseEvent<HTMLDivElement>) => {
    // calculate dragStart in Dragging and setState
    this.setState({ interaction: createDragging(chartId, this.findValue(e)) });
  };

  dragging = (e: MouseEvent) => {
    // active only if we're in Dragging. Update dragEnd in state
    const { interaction } = this.state;
    if (!isDragging(interaction)) return;
    const { start, key } = interaction;
    const end = this.findValue(e);
    // TODO: remember to ensure that we're inside xScale.domain!
    this.setState({ interaction: createDragging(key, start, end) });
  };

  stopDragging = (e: MouseEvent) => {
    // if we're in Dragging - stop, update dragEnd and saveHighlight (handle highlighting different charts!)
    const { interaction } = this.state;
    if (!isDragging(interaction)) return;
    const { start } = interaction;
    const end = this.findValue(e);
    this.setState({ interaction: null });
    const { essence, saveHighlight } = this.props;
    // TODO: ensure that start < end
    // TODO: remember to ensure that we're inside xScale.domain!
    const range = snapRangeToGrid(Range.fromJS({ start, end }), essence);
    saveHighlight(List.of(toFilterClause(range, getContinuousReference(essence))), "chart-id?");
  };

  private getX(e: MouseEvent | React.MouseEvent<HTMLDivElement>, offset = 0): number {
    return getXFromEvent(e) - offset;
  }

  private findValue(e: MouseEvent | React.MouseEvent<HTMLDivElement>): ContinuousValue {
    const { xScale } = this.props;
    // TODO: remember to ensure that we're inside xScale.domain!
    return xScale.invert(this.getX(e));
  }

  private findRange(e: MouseEvent | React.MouseEvent<HTMLDivElement>): PlywoodRange | null {
    const value = this.findValue(e);
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
