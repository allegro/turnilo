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

import * as React from "react";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { CORE_ITEM_GAP } from "../../config/constants";
import { transformStyle } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { WithRef } from "../with-ref/with-ref";
import { Item, SeriesItem } from "./series-item";

interface SeriesItemOverflowMenuProps {
  items: Item[];
  openOn: Element;
  closeOverflowMenu: Fn;
  removeSeries: Unary<Series, void>;
  saveSeries: Unary<Series, void>;
  openSeriesMenu: Unary<Series, void>;
  closeSeriesMenu: Fn;
  dragStart: Ternary<string, Series, React.DragEvent<HTMLElement>, void>;
  containerStage: Stage;
}

const SEGMENT_HEIGHT = 29 + CORE_ITEM_GAP;

const SeriesItemOverflowMenu: React.SFC<SeriesItemOverflowMenuProps> = props => {
  const { containerStage, closeSeriesMenu, openSeriesMenu, removeSeries, dragStart, items, saveSeries, openOn } = props;
  const seriesItems = items.map((item, idx) => {
    const { series } = item;
    const style = transformStyle(0, CORE_ITEM_GAP + idx * SEGMENT_HEIGHT);
    return <SeriesItem
      key={series.key()}
      item={item}
      style={style}
      closeSeriesMenu={closeSeriesMenu}
      removeSeries={removeSeries}
      dragStart={dragStart}
      containerStage={containerStage}
      openSeriesMenu={openSeriesMenu}
      saveSeries={saveSeries}
    />;
  });

  return <BubbleMenu
    className="overflow-menu"
    id={this.overflowMenuId}
    direction="down"
    stage={Stage.fromSize(208, CORE_ITEM_GAP + (seriesItems.length * SEGMENT_HEIGHT))}
    fixedSize={true}
    openOn={openOn}
    onClose={close}
  >
    {seriesItems}
  </BubbleMenu>;
};

interface SeriesItemOverflowProps {
  x: number;
  items: Item[];
  open: boolean;
  openOverflowMenu: Fn;
  closeOverflowMenu: Fn;
  removeSeries: Unary<Series, void>;
  saveSeries: Unary<Series, void>;
  openSeriesMenu: Unary<Series, void>;
  closeSeriesMenu: Fn;
  dragStart: Ternary<string, Series, React.DragEvent<HTMLElement>, void>;
  containerStage: Stage;
}

export const SeriesItemOverflow: React.SFC<SeriesItemOverflowProps> = props => {
  const { x, items, dragStart, removeSeries, saveSeries, open, openSeriesMenu, openOverflowMenu, closeOverflowMenu, closeSeriesMenu, containerStage } = props;
  const opened = open || items.some(item => item.open);

  const style = transformStyle(x, 0);
  return <WithRef>
    {({ ref: openOn, setRef }) => <div
      className="overflow measure"
      style={style}
      ref={setRef}
      onClick={openOverflowMenu}>
      <div className="count">{"+" + items.length}</div>
      {opened && openOn && <SeriesItemOverflowMenu
        openOn={openOn}
        items={items}
        closeOverflowMenu={closeOverflowMenu}
        removeSeries={removeSeries}
        saveSeries={saveSeries}
        openSeriesMenu={openSeriesMenu}
        closeSeriesMenu={closeSeriesMenu}
        dragStart={dragStart}
        containerStage={containerStage} />}
    </div>}
  </WithRef>;
};
