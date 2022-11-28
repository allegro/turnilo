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

import React from "react";
import "./highlighter.scss";

export interface HighlighterProps {
  left: number;
  right: number;
  top?: number;
  bottom?: number;
}

export function Highlighter(props: HighlighterProps) {
  const { left, bottom = 0, right, top = 0 } = props;

  const whiteoutLeftStyle = {
    width: Math.max(left, 0)
  };

  const frameStyle = {
    left,
    top,
    bottom,
    width: Math.max(right - left, 0)
  };

  const whiteoutRightStyle = {
    left: right
  };

  return <div className="highlighter">
    <div className="whiteout left" style={whiteoutLeftStyle} />
    <div className="frame" style={frameStyle} />
    <div className="whiteout right" style={whiteoutRightStyle} />
  </div>;
}
