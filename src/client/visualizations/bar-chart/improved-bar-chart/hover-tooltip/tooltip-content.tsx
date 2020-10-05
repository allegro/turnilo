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
import * as React from "react";
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { ColorEntry, ColorSwabs } from "../../../../components/color-swabs/color-swabs";
import { Delta } from "../../../../components/delta/delta";
import { MeasureBubbleContent } from "../../../../components/measure-bubble-content/measure-bubble-content";
import { selectSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import { BarChartModel, isStacked, StackedBarChartModel } from "../utils/bar-chart-model";

interface ContentProps {
  model: BarChartModel;
  datum: Datum;
  series: ConcreteSeries;
}
interface LabelProps {
  showPrevious: boolean;
  datum: Datum;
  series: ConcreteSeries;
}

const Label: React.SFC<LabelProps> = props => {
  const { showPrevious, series, datum } = props;
  if (!showPrevious) {
    return <React.Fragment>
      {series.formatValue(datum)}
    </React.Fragment>;
  }
  const currentValue = series.selectValue(datum);
  const previousValue = series.selectValue(datum, SeriesDerivation.PREVIOUS);
  const formatter = series.formatter();
  return <MeasureBubbleContent
    lowerIsBetter={series.measure.lowerIsBetter}
    formatter={formatter}
    current={currentValue}
    previous={previousValue}
  />;
};

// TODO: looks similar to SplitHoverContent and SeriesHoverContent.
function colorEntries(datum: Datum, series: ConcreteSeries, model: StackedBarChartModel) {
  const { reference } = model.nominalSplit;
  const datums = selectSplitDatums(datum);
  const colorEntries = model.colors.entrySeq().toArray();
  return colorEntries.map(([segment, color]) => {
    const datum = datums.find(d => String(d[reference]) === segment);

    if (!datum) {
      return {
        color,
        name: segment,
        value: "-"
      };
    }

    const currentEntry: ColorEntry = {
      color,
      name: segment,
      value: series.formatValue(datum)
    };

    if (!model.hasComparison) {
      return currentEntry;
    }

    return {
      ...currentEntry,
      previous: series.formatValue(datum, SeriesDerivation.PREVIOUS),
      delta: <Delta
        currentValue={series.selectValue(datum)}
        previousValue={series.selectValue(datum, SeriesDerivation.PREVIOUS)}
        formatter={series.formatter()}
        lowerIsBetter={series.measure.lowerIsBetter}
      />
    };
  });
}

export const Content: React.SFC<ContentProps> = props => {
  const { model, series, datum } = props;
  if (isStacked(model)) {
    const entries = colorEntries(datum, series, model);
    return <ColorSwabs colorEntries={entries} />;
  }
  return <Label showPrevious={model.hasComparison} datum={datum} series={series} />;
};
