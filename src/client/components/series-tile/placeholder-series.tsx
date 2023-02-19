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
import { Measure } from "../../../common/models/measure/measure";
import { Measures } from "../../../common/models/measure/measures";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { SeriesMenu } from "../series-menu/series-menu";
import { WithRef } from "../with-ref/with-ref";

interface PlaceholderSeriesTileProps {
  measure: Measure;
  measures: Measures;
  seriesList: SeriesList;
  series: Series;
  style?: React.CSSProperties;
  containerStage: Stage;
  saveSeries: Unary<Series, void>;
  closeItem: Fn;
}

export const PlaceholderSeriesTile: React.FunctionComponent<PlaceholderSeriesTileProps> = props => {
  const { series, measures, seriesList, containerStage, saveSeries, closeItem, style, measure } = props;
  return <WithRef>
    {({ ref: openOn, setRef }) => <div
      className="tile measure"
      ref={setRef}
      style={style}>
      <div className="reading">{measure.title}</div>
      {openOn && <SeriesMenu
        key="placeholder-series"
        measures={measures}
        seriesList={seriesList}
        openOn={openOn}
        containerStage={containerStage}
        onClose={closeItem}
        initialSeries={series}
        measure={measure}
        saveSeries={saveSeries} />}
    </div>}
  </WithRef>;
};
