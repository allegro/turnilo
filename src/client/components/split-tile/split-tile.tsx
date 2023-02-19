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
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Binary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { SplitMenu, SplitMenuProps } from "../split-menu/split-menu";
import { SvgIcon } from "../svg-icon/svg-icon";
import { WithRef } from "../with-ref/with-ref";

export interface SplitTileBaseProps {
  essence: Essence;
  split: Split;
  dimension: Dimension;
  open: boolean;
  style?: React.CSSProperties;
  removeSplit: Unary<Split, void>;
  updateSplit: Binary<Split, Split, void>;
  openMenu: Unary<Split, void>;
  closeMenu: Fn;
  dragStart: Ternary<string, Split, React.DragEvent<HTMLElement>, void>;
  containerStage: Stage;
}

interface SplitTileProps extends SplitTileBaseProps {
  splitMenuComponent: React.ComponentType<SplitMenuProps>;
}

export const DefaultSplitTile: React.FunctionComponent<SplitTileBaseProps> = props => {
  return <SplitTile {...props} splitMenuComponent={SplitMenu} />;
};

export const SplitTile: React.FunctionComponent<SplitTileProps> = props => {
  const { splitMenuComponent: SplitMenu, essence, open, split, dimension, style, removeSplit, updateSplit, openMenu, closeMenu, dragStart, containerStage } = props;

  const title = split.getTitle(dimension);

  const remove = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    removeSplit(split);
  };

  return <WithRef>
    {({ ref: openOn, setRef }) => <React.Fragment>
      <div
        className="tile dimension"
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
          <SvgIcon svg={require("../../icons/x.svg")} />
        </div>
      </div>
      {open && openOn && <SplitMenu
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
