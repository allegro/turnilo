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

import React from "react";
import { isContinuous } from "../../../common/models/dimension/dimension";
import { SplitTileBaseProps } from "../../components/split-tile/split-tile";
import { SvgIcon } from "../../components/svg-icon/svg-icon";
import { WithRef } from "../../components/with-ref/with-ref";
import { classNames } from "../../utils/dom/dom";
import { GridSplitMenu } from "./grid-split-menu";
import { mainSplit } from "./utils/main-split";

export const GridSplitTile: React.FunctionComponent<SplitTileBaseProps> = props => {
  const { essence, open: isOpened, split, dimension, style, removeSplit, updateSplit, openMenu, closeMenu, dragStart, containerStage } = props;

  const enabled = split.equals(mainSplit(essence)) || isContinuous(dimension);

  const title = split.getTitle(dimension);

  const remove = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    removeSplit(split);
  };

  const open = () => {
    if (!enabled) return;
    openMenu(split);
  };

  return <WithRef>
    {({ ref: openOn, setRef }) => <React.Fragment>
      <div
        className={classNames("tile dimension", { disabled: !enabled })}
        key={split.toKey()}
        ref={setRef}
        draggable={true}
        onClick={open}
        onDragStart={e => dragStart(dimension.title, split, e)}
        style={style}
        title={title}
      >
        <div className="reading">{title}</div>
        <div className="remove"
             onClick={remove}>
          <SvgIcon svg={require("../../icons/x.svg")} />
        </div>
      </div>
      {enabled && isOpened && openOn && <GridSplitMenu
        saveSplit={updateSplit}
        essence={essence}
        openOn={openOn}
        containerStage={containerStage}
        onClose={closeMenu}
        dimension={dimension}
        split={split} />}
    </React.Fragment>}
  </WithRef>;
};
