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

import { Dataset, Datum, PlywoodRange } from "plywood";
import * as React from "react";
import { ReactNode } from "react";
import { NORMAL_COLORS } from "../../../../../common/models/colors/colors";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { ColorEntry, createColorEntry } from "../../../../components/color-swabs/color-entry";
import { ColorSwabs } from "../../../../components/color-swabs/color-swabs";
import { SeriesBubbleContent } from "../../../../components/series-bubble-content/series-bubble-content";
import { selectSplitDataset } from "../../../../utils/dataset/selectors/selectors";
import { getContinuousDimension, getContinuousReference, getNominalSplit, hasNominalSplit } from "../../utils/splits";

function findSplitDatumByAttribute(d: Datum, dimensionName: string, range: PlywoodRange): Datum {
  const dataset = selectSplitDataset(d);
  return dataset != null ? dataset.findDatumByAttribute(dimensionName, range) : null;
}

function measureLabel(dataset: Dataset, range: PlywoodRange, series: ConcreteSeries, essence: Essence): ReactNode {
  const continuousDimension = getContinuousDimension(essence);
  const datum = dataset.findDatumByAttribute(continuousDimension.name, range);
  if (!datum) return null;

  return <SeriesBubbleContent series={series} datum={datum} showPrevious={essence.hasComparison()}/>;
}

function colorEntries(dataset: Dataset, range: PlywoodRange, series: ConcreteSeries, essence: Essence): ColorEntry[] {
  const { data } = dataset;
  const { reference: nominalRef } = getNominalSplit(essence);
  const continuousRef = getContinuousReference(essence);
  const hasComparison = essence.hasComparison();
  return data.map((datum, i) => {
    const name = String(datum[nominalRef]);
    const color = NORMAL_COLORS[i];
    const hoverDatum = findSplitDatumByAttribute(datum, continuousRef, range);

    if (!hoverDatum) {
      return {
        color,
        name,
        value: "-"
      };
    }

    return createColorEntry({
      color,
      name,
      series,
      datum: hoverDatum,
      hasComparison
    });
  });
}

interface SeriesHoverContentProps {
  essence: Essence;
  dataset: Dataset;
  range: PlywoodRange;
  series: ConcreteSeries;
}

export const SeriesHoverContent: React.SFC<SeriesHoverContentProps> = props => {
  const { essence, range, series, dataset } = props;
  if (hasNominalSplit(essence)) {
    const entries = colorEntries(dataset, range, series, essence);
    return <ColorSwabs colorEntries={entries} />;
  }
  return <React.Fragment>
    {measureLabel(dataset, range, series, essence)}
  </React.Fragment>;
};
