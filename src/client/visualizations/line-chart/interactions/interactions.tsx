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
import * as React from "react";
import { ReactNode } from "react";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Binary, Unary } from "../../../../common/utils/functional/functional";
import { GlobalEventListener } from "../../../components/global-event-listener/global-event-listener";
import { Highlight } from "../../base-visualization/highlight";
import { createHighlight, Interaction, MouseInteraction } from "./interaction";

interface InteractionsProps {
  children: Unary<{ interaction: Interaction }, ReactNode>;
  highlight?: Highlight;
  saveHighlight: Binary<List<FilterClause>, string, void>;
}

interface InteractionsState {
  interaction: MouseInteraction | null;
}

export class Interactions extends React.Component<InteractionsProps, InteractionsState> {

  state: InteractionsState = { interaction: null };

  handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
    // calculate hover range and setState
  };

  onMouseLeave = () => {
    // if hover, reset interaction
  };

  handleDragStart = () => {
    // calculate dragStart in Dragging and setState
  };

  globalMouseMoveListener = () => {
    // active only if we're in Dragging. Update dragEnd in state
  };

  globalMouseUpListener = () => {
    // if we're in Dragging - stop, update dragEnd and saveHighlight (handle highlighting different charts!)
  };

  interaction(): Interaction | null {
    const { highlight } = this.props;
    if (highlight) return createHighlight(highlight);
    return this.state.interaction;
  }

  render() {
    const interaction = this.interaction();
    const { children } = this.props;
    return <React.Fragment>
      <GlobalEventListener />
      {children({ interaction })}
    </React.Fragment>;
  }
}
