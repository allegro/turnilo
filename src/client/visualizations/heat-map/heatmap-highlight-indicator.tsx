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
import "./heatmap-highlight-indicator.scss";
import { HighlightPosition } from "./utils/get-highlight-position";

interface RowHighlightProps {
  width: number;
  row: number;
  tileSize: number;
}

const RowHighlight: React.FunctionComponent<RowHighlightProps> = props => {
  const { row, width, tileSize } = props;
  const top = row * tileSize;
  return <div className="heatmap-highlighter heatmap-highlighter-row" style={{
    top: `${top}px`,
    width: `${width}px`
  }} />;
};

interface ColumnHighlightProps {
  height: number;
  column: number;
  tileSize: number;
  tileGap: number;
}

const ColumnHighlight: React.FunctionComponent<ColumnHighlightProps> = props => {
  const { column, tileSize, height, tileGap } = props;
  const left = column * tileSize + tileGap;
  return <div className="heatmap-highlighter heatmap-highlighter-column" style={{
    left: `${left}px`,
    height: `${height}px`
  }} />;
};

interface HeatmapHighlightIndicatorProps {
  tileSize: number;
  tileGap: number;
  position: HighlightPosition;
  width: number;
  height: number;
}

export const HeatmapHighlightIndicator: React.FunctionComponent<HeatmapHighlightIndicatorProps> = props => {
  const { position: { row, column }, width, height, tileGap, tileSize } = props;

  return <React.Fragment>
    {row && <RowHighlight
      row={row}
      width={width}
      tileSize={tileSize} />}
    {column && <ColumnHighlight
      column={column}
      tileGap={tileGap}
      height={height}
      tileSize={tileSize} />}
  </React.Fragment>;
};
