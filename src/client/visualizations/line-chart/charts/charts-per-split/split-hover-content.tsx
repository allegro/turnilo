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

import { Dataset, Datum } from "plywood";
import * as React from "react";
import { NORMAL_COLORS } from "../../../../../common/models/colors/colors";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { createColorEntry } from "../../../../components/color-swabs/color-entry";
import { ColorSwabs } from "../../../../components/color-swabs/color-swabs";
import { SeriesBubbleContent } from "../../../../components/series-bubble-content/series-bubble-content";
import { Hover } from "../../interactions/interaction";
import { getContinuousReference } from "../../utils/splits";

interface SplitHoverContentProps {
  interaction: Hover;
  essence: Essence;
  dataset: Dataset;
}

interface ColoredSeriesProps {
  series: ConcreteSeries[];
  datum: Datum;
  hasComparison: boolean;
}

const ColoredSeries: React.SFC<ColoredSeriesProps> = props => {
  const { datum, hasComparison, series } = props;
  const colorEntries = series.map((series, index) => {
    const color = NORMAL_COLORS[index];
    const name = series.title();
    return createColorEntry({ color, name, hasComparison, datum, series });
  });
  return <ColorSwabs colorEntries={colorEntries} />;
};

export const SplitHoverContent: React.SFC<SplitHoverContentProps> = props => {
  const { essence, dataset, interaction: { range } } = props;
  const series = essence.getConcreteSeries().toArray();
  const hasComparison = essence.hasComparison();
  const reference = getContinuousReference(essence);
  const datum = dataset.findDatumByAttribute(reference, range) || {};
  if (series.length === 1) {
    return <SeriesBubbleContent series={series[0]} datum={datum} showPrevious={hasComparison}/>;
  }
  return <ColoredSeries  datum={datum} series={series} hasComparison={hasComparison}/>;
};
