/*
 * Copyright 2017-2022 Allegro.pl
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
import { VisualizationControls, VisualizationControlsBaseProps } from "../../views/cube-view/center-panel/center-panel";
import { SplitTile, SplitTileBaseProps } from "../split-tile/split-tile";
import { SplitTilesRow, SplitTilesRowBaseProps } from "../split-tile/split-tiles-row";
import { TimeSeriesSplitMenu } from "./split-menu";

const TimeSeriesSplitTile: React.FunctionComponent<SplitTileBaseProps> = props =>
  <SplitTile splitMenuComponent={TimeSeriesSplitMenu} {...props} />;

const TimeSeriesSplitTilesRow: React.FunctionComponent<SplitTilesRowBaseProps> = props =>
  <SplitTilesRow {...props} splitTileComponent={TimeSeriesSplitTile}/>;

export const TimeSeriesVisualizationControls: React.FunctionComponent<VisualizationControlsBaseProps> = props =>
  <VisualizationControls {...props} splitTilesRow={TimeSeriesSplitTilesRow}/>;
