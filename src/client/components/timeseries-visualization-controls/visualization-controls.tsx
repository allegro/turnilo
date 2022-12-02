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
import { classNames } from "../../utils/dom/dom";
import {
  VisualizationControls,
  VisualizationControlsBaseProps
} from "../../views/cube-view/center-panel/center-panel";
import { SplitTileBaseProps } from "../split-tile/split-tile";
import { SplitTilesRow, SplitTilesRowBaseProps } from "../split-tile/split-tiles-row";
import { SvgIcon } from "../svg-icon/svg-icon";
import { WithRef } from "../with-ref/with-ref";
import { TimeSeriesSplitMenu } from "./split-menu";

const TimeSeriesSplitTile: React.FunctionComponent<SplitTileBaseProps> = props => {
  const {
    essence,
    open,
    split,
    dimension,
    style,
    removeSplit,
    updateSplit,
    openMenu,
    closeMenu,
    dragStart,
    containerStage
  } = props;

  const title = split.getTitle(dimension);

  const remove = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    removeSplit(split);
  };

  return <WithRef>
    {({ ref: openOn, setRef }) => <React.Fragment>
      <div
        className={classNames("tile dimension")}
        key={split.toKey()}
        ref={setRef}
        draggable={true}
        onClick={() => openMenu(split)}
        onDragStart={e => dragStart(dimension.title, split, e)}
        style={style}
        title={title}
      >
        <div className="reading">{title}</div>
        <div className="remove"
             onClick={remove}>
          <SvgIcon svg={require("../../icons/x.svg")}/>
        </div>
      </div>
      {open && openOn && <TimeSeriesSplitMenu
        saveSplit={updateSplit}
        essence={essence}
        openOn={openOn}
        containerStage={containerStage}
        onClose={closeMenu}
        dimension={dimension}
        split={split}/>}
    </React.Fragment>}
  </WithRef>;
};

const TimeSeriesSplitTilesRow: React.FunctionComponent<SplitTilesRowBaseProps> = props =>
  <SplitTilesRow {...props} splitTileComponent={TimeSeriesSplitTile}/>;

export const TimeSeriesVisualizationControls: React.FunctionComponent<VisualizationControlsBaseProps> = props =>
  <VisualizationControls {...props} splitTilesRow={TimeSeriesSplitTilesRow}/>;
