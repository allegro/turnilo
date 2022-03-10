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

import React from "react";
import { INDENT_WIDTH, ROW_HEIGHT } from "../../../components/tabular-scroller/dimensions";
import "./highlight.scss";

interface HighlighterProps {
  highlightedIndex: number;
  highlightedNesting: number;
  scrollTopOffset: number;
  collapseRows: boolean;
}

export const Highlighter: React.FunctionComponent<HighlighterProps> = props => {
  const { highlightedIndex, scrollTopOffset, highlightedNesting, collapseRows } = props;
  const top = highlightedIndex * ROW_HEIGHT - scrollTopOffset;
  const left = collapseRows ? 0 : Math.max(0, highlightedNesting - 1) * INDENT_WIDTH;
  return <div className="highlight-cont">
    <div className="highlight">
      <div className="highlighter" key="highlight" style={{ top, left }} />
    </div>
  </div>;
};
