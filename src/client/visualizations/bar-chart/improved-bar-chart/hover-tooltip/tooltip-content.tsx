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

import { Datum } from "plywood";
import React from "react";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { createColorEntry } from "../../../../components/color-swabs/color-entry";
import { ColorSwabs } from "../../../../components/color-swabs/color-swabs";
import { SeriesBubbleContent } from "../../../../components/series-bubble-content/series-bubble-content";
import { selectSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import { BarChartModel, isStacked, StackedBarChartModel } from "../utils/bar-chart-model";

interface ContentProps {
  model: BarChartModel;
  datum: Datum;
  series: ConcreteSeries;
}

function colorEntries(datum: Datum, series: ConcreteSeries, model: StackedBarChartModel) {
  const { nominalSplit, colors, hasComparison } = model;
  const datums = selectSplitDatums(datum);
  const colorEntries = colors.entrySeq().toArray();
  return colorEntries.map(([name, color]) => {
    const datum = datums.find(d => String(nominalSplit.selectValue(d)) === name);

    if (!datum) {
      return { color, name, value: "-" };
    }

    return createColorEntry({ color, name, hasComparison, datum, series });
  });
}

export const Content: React.FunctionComponent<ContentProps> = props => {
  const { model, series, datum } = props;
  if (isStacked(model)) {
    const entries = colorEntries(datum, series, model);
    return <ColorSwabs colorEntries={entries} />;
  }
  return <SeriesBubbleContent series={series} datum={datum} showPrevious={model.hasComparison}/>;
};
