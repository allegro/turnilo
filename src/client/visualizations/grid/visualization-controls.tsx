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
import * as React from "react";
import { SplitMenu, SplitMenuProps } from "../../components/split-menu/split-menu";
import { SplitTile, SplitTileBaseProps } from "../../components/split-tile/split-tile";
import { SplitTilesRow, SplitTilesRowBaseProps } from "../../components/split-tile/split-tiles-row";
import {
  VisualizationControls,
  VisualizationControlsBaseProps
} from "../../views/cube-view/center-panel/center-panel";

export const GridVisualizationControls: React.SFC<VisualizationControlsBaseProps> = props => {
  return <VisualizationControls{...props} splitTilesRow={GridSplitTilesRow} />;
};

function GridSplitTilesRow(props: SplitTilesRowBaseProps) {
  return <SplitTilesRow {...props} splitTileComponent={GridSplitTile} />;
}

function GridSplitTile(props: SplitTileBaseProps) {
  return <SplitTile {...props} splitMenuComponent={GridSplitMenu} />;
}

// TODO: Really implement this menu!
function GridSplitMenu(props: SplitMenuProps) {
  return <React.Fragment>
    <div>GRIIIIIID!</div>
    <SplitMenu {...props}/>
  </React.Fragment>;
}
