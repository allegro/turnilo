/*
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
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { CORE_ITEM_GAP } from "../../config/constants";
import { classNames, transformStyle } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { WithRef } from "../with-ref/with-ref";

interface TileOverflowContainerMenuProps {
  items: JSX.Element[];
  openOn: Element;
  closeOverflowMenu: Fn;
}

const SEGMENT_HEIGHT = 29 + CORE_ITEM_GAP;

const TileOverflowContainerMenu: React.FunctionComponent<TileOverflowContainerMenuProps> = props => {
  const { items, openOn, closeOverflowMenu } = props;

  const positionedItems = items.map((item, idx) =>
    React.cloneElement(item, { style: transformStyle(0, CORE_ITEM_GAP + idx * SEGMENT_HEIGHT) }));

  return <BubbleMenu
    className="overflow-menu"
    direction="down"
    stage={Stage.fromSize(208, CORE_ITEM_GAP + (items.length * SEGMENT_HEIGHT))}
    fixedSize={true}
    openOn={openOn}
    onClose={closeOverflowMenu}
  >
    {positionedItems}
  </BubbleMenu>;
};

interface TileOverflowContainerProps {
  className: string;
  x: number;
  items: JSX.Element[];
  open: boolean;
  openOverflowMenu: Fn;
  closeOverflowMenu: Fn;
}

export const TileOverflowContainer: React.FunctionComponent<TileOverflowContainerProps> = props => {
  const { x, items, open, openOverflowMenu, className, closeOverflowMenu } = props;

  const style = transformStyle(x, 0);
  return <WithRef>
    {({ ref: openOn, setRef }) => <React.Fragment>
      <div
        className={classNames("overflow", className)}
        style={style}
        ref={setRef}
        onClick={openOverflowMenu}>
        <div className="count">{"+" + items.length}</div>
      </div>
      {open && openOn && <TileOverflowContainerMenu
        openOn={openOn}
        items={items}
        closeOverflowMenu={closeOverflowMenu} />}
    </React.Fragment>}
  </WithRef>;
};
