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
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { mapTruthy } from "../../../../../common/utils/functional/functional";
import { ColorEntry, ColorSwabs } from "../../../../components/color-swabs/color-swabs";
import { Delta } from "../../../../components/delta/delta";
import { MeasureBubbleContent } from "../../../../components/measure-bubble-content/measure-bubble-content";
import { selectSplitDataset } from "../../../../utils/dataset/selectors/selectors";
import { getContinuousDimension, getContinuousReference, getNominalSplit, hasNominalSplit } from "../../utils/splits";

function findNestedDatumByAttribute(dimensionName: string, range: PlywoodRange): (d: Datum) => Datum {
  return (d: Datum): Datum => {
    const dataset = selectSplitDataset(d);
    return dataset != null ? dataset.findDatumByAttribute(dimensionName, range) : null;
  };
}

function measureLabel(dataset: Dataset, range: PlywoodRange, series: ConcreteSeries, essence: Essence): ReactNode {
  const continuousDimension = getContinuousDimension(essence);
  const datum = dataset.findDatumByAttribute(continuousDimension.name, range);
  if (!datum) return null;

  if (!essence.hasComparison()) {
    return series.formatValue(datum);
  }
  const currentValue = series.selectValue(datum);
  const previousValue = series.selectValue(datum, SeriesDerivation.PREVIOUS);
  const formatter = series.formatter();
  return <MeasureBubbleContent
    lowerIsBetter={series.measure.lowerIsBetter}
    current={currentValue}
    previous={previousValue}
    formatter={formatter} />;
}

function colorEntries(dataset: Dataset, range: PlywoodRange, series: ConcreteSeries, essence: Essence): ColorEntry[] {
  const categorySplit = getNominalSplit(essence);
  const continuousRef = getContinuousReference(essence);
  const hoverDatums = dataset.data.map(findNestedDatumByAttribute(continuousRef, range));
  const colorValues = NORMAL_COLORS;
  const hasComparison = essence.hasComparison();
  return mapTruthy(dataset.data, (d, i) => {
    const segment = d[categorySplit.reference];
    const hoverDatum = hoverDatums[i];
    if (!hoverDatum) return null;

    const currentEntry: ColorEntry = {
      color: colorValues[i],
      name: String(segment),
      value: series.formatValue(hoverDatum)
    };

    if (!hasComparison) {
      return currentEntry;
    }

    return {
      ...currentEntry,
      previous: series.formatValue(hoverDatum, SeriesDerivation.PREVIOUS),
      delta: <Delta
        currentValue={series.selectValue(hoverDatum)}
        previousValue={series.selectValue(hoverDatum, SeriesDerivation.PREVIOUS)}
        formatter={series.formatter()}
        lowerIsBetter={series.measure.lowerIsBetter}
      />
    };
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
