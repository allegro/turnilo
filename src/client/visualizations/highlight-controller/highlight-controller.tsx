/*
 * Copyright 2017-2021 Allegro.pl
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
import React from "react";
import { ReactNode } from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Binary, Nullary, Unary } from "../../../common/utils/functional/functional";
import { Highlight } from "./highlight";

interface HighlightProps {
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  highlight: Highlight | null;
  saveHighlight: Binary<List<FilterClause>, string | null, void>;
}

interface HighlightControllerProps {
  essence: Essence;
  clicker: Clicker;
  children: Unary<HighlightProps, ReactNode>;
}

interface HighlightControllerState {
  highlight: Highlight | null;
}

export function hasHighlightOn(highlight: Highlight | null, key: string): boolean {
  if (!highlight) return false;
  return highlight.key === key;
}

export class HighlightController extends React.Component<HighlightControllerProps, HighlightControllerState> {
  state: HighlightControllerState = { highlight: null };

  private dropHighlight = () => this.setState({ highlight: null });

  private acceptHighlight = () => {
    const { highlight } = this.state;
    if (highlight === null) return;
    const { essence, clicker } = this.props;
    clicker.changeFilter(essence.filter.mergeClauses(highlight.clauses));
    this.setState({ highlight: null });
  };

  private saveHighlight = (clauses: List<FilterClause>, key: string | null = null) => {
    const highlight = new Highlight(clauses, key);
    this.setState({ highlight });
  };

  render() {
    const { children } = this.props;
    const { highlight } = this.state;
    const highlightProps = {
      dropHighlight: this.dropHighlight,
      acceptHighlight: this.acceptHighlight,
      saveHighlight: this.saveHighlight,
      highlight
    };
    return children(highlightProps);
  }
}
