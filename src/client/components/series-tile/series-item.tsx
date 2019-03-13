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
import { Measure } from "../../../common/models/measure/measure";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { classNames } from "../../utils/dom/dom";
import { OpenOnSelf } from "../open-on-self/open-on-self";
import { SeriesMenu } from "../series-menu/series-menu";
import { SvgIcon } from "../svg-icon/svg-icon";
import { SERIES_CLASS_NAME } from "./series-tile";

export interface Item {
  series: Series;
  measure: Measure;
  open: boolean;
}

interface SeriesItemProps {
  item: Item;
  style: React.CSSProperties;
  removeSeries: Unary<Series, void>;
  saveSeries: Unary<Series, void>;
  openSeriesMenu: Unary<Series, void>;
  closeSeriesMenu: Fn;
  dragStart: Ternary<string, Series, React.DragEvent<HTMLElement>, void>;
  containerStage: Stage;
}

export const SeriesItem: React.SFC<SeriesItemProps> = props => {
  const { item, style, saveSeries, removeSeries, openSeriesMenu, closeSeriesMenu, dragStart, containerStage } = props;
  const { series, measure, open } = item;
  return <OpenOnSelf open={open}>
    {({ element, setRef }) => <div
      className={classNames(SERIES_CLASS_NAME, "measure")}
      draggable={true}
      ref={setRef}
      onClick={() => openSeriesMenu(series)}
      onDragStart={e => dragStart(measure.title, series, e)}
      style={style}
    >
      <div className="reading">{measure.title}</div>
      <div className="remove" onClick={() => removeSeries(series)}>
        <SvgIcon svg={require("../../icons/x.svg")} />
      </div>
      {open && element && <SeriesMenu
        key={series.key()}
        openOn={element}
        containerStage={containerStage}
        onClose={closeSeriesMenu}
        initialSeries={series}
        measure={measure}
        saveSeries={saveSeries} />}
    </div>}
  </OpenOnSelf>;
};
