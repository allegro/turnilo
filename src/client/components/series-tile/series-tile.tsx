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
import { Measures } from "../../../common/models/measure/measures";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Binary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { SeriesMenu } from "../series-menu/series-menu";
import { SvgIcon } from "../svg-icon/svg-icon";
import { WithRef } from "../with-ref/with-ref";

interface SeriesTileProps {
  item: ConcreteSeries;
  open: boolean;
  seriesList: SeriesList;
  measures: Measures;
  style?: React.CSSProperties;
  removeSeries: Unary<Series, void>;
  updateSeries: Binary<Series, Series, void>;
  openSeriesMenu: Unary<Series, void>;
  closeSeriesMenu: Fn;
  dragStart: Ternary<string, Series, React.DragEvent<HTMLElement>, void>;
  containerStage: Stage;
}

export const SeriesTile: React.FunctionComponent<SeriesTileProps> = props => {
  const { seriesList, measures, open, item, style, updateSeries, removeSeries, openSeriesMenu, closeSeriesMenu, dragStart, containerStage } = props;
  const { definition, measure } = item;
  const title = item.title();

  const saveSeries = (newSeries: Series) => updateSeries(definition, newSeries);
  const remove = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    removeSeries(definition);
  };

  return <WithRef>
    {({ ref: openOn, setRef }) => <React.Fragment>
      <div
        className="tile measure"
        draggable={true}
        ref={setRef}
        onClick={() => openSeriesMenu(definition)}
        onDragStart={e => dragStart(measure.title, definition, e)}
        style={style}
        title={title}
      >
        <div className="reading">{title}</div>
        <div className="remove" onClick={remove}>
          <SvgIcon svg={require("../../icons/x.svg")} />
        </div>
      </div>
      {open && openOn && <SeriesMenu
        key={definition.key()}
        openOn={openOn}
        seriesList={seriesList}
        measures={measures}
        containerStage={containerStage}
        onClose={closeSeriesMenu}
        initialSeries={definition}
        measure={measure}
        saveSeries={saveSeries} />}
    </React.Fragment>}
  </WithRef>;
};
