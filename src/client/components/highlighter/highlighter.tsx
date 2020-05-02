/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { PlywoodRange } from "plywood";
import * as React from "react";
import "./highlighter.scss";

export interface HighlighterProps {
  highlightRange: PlywoodRange;
  scaleX: any;
}

export function Highlighter(props: HighlighterProps) {
  const { highlightRange, scaleX } = props;
  if (!highlightRange) return null;

  const startPos = scaleX(highlightRange.start);
  const endPos = scaleX(highlightRange.end);

  const whiteoutLeftStyle = {
    width: Math.max(startPos, 0)
  };

  const frameStyle = {
    left: startPos,
    width: Math.max(endPos - startPos, 0)
  };

  const whiteoutRightStyle = {
    left: endPos
  };

  return <div className="highlighter">
    <div className="whiteout left" style={whiteoutLeftStyle}></div>
    <div className="frame" style={frameStyle}></div>
    <div className="whiteout right" style={whiteoutRightStyle}></div>
  </div>;
}
