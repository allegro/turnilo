/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { allDimensions, findDimensionByName } from "../../models/dimension/dimensions";
import { allMeasures } from "../../models/measure/measures";
import { MeasureSeries } from "../../models/series/measure-series";
import { Split } from "../../models/split/split";
import { Resolve, VisualizationManifest } from "../../models/visualization-manifest/visualization-manifest";
import { emptySettingsConfig } from "../../models/visualization-settings/empty-settings-config";
import { thread } from "../../utils/functional/functional";
import { Predicates } from "../../utils/rules/predicates";
import { adjustLimit, adjustSort } from "../../utils/rules/split-adjustments";
import {
  ActionVariables,
  visualizationDependentEvaluatorBuilder
} from "../../utils/rules/visualization-dependent-evaluator";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.numberOfSplitsIsNot(2))
  .then(variables => Resolve.manual(
    3,
    "Heatmap needs exactly 2 splits",
    variables.splits.length() > 2 ? suggestRemovingSplits(variables) : suggestAddingSplits(variables)
  ))
  .when(Predicates.numberOfSeriesIsNot(1))
  .then(variables => Resolve.manual(
    3,
    "Heatmap needs exactly 1 measure",
    variables.series.series.size === 0 ? suggestAddingMeasure(variables) : suggestRemovingMeasures(variables)
  ))
  .otherwise(({ splits, dataCube, series }) => {
    const newSplits = splits.update("splits", splits => splits.map(split => {
      const splitDimension = findDimensionByName(dataCube.dimensions, split.reference);

      return thread(
        split,
        adjustLimit(splitDimension),
        adjustSort(splitDimension, series)
      );
    }));

    const changed = !newSplits.equals(splits);
    return changed
      ? Resolve.automatic(10, { splits: newSplits })
      : Resolve.ready(10);
  })
  .build();

export const suggestRemovingSplits = ({ splits }: ActionVariables) => [{
  description: splits.length() === 3 ? "Remove last split" : `Remove last ${splits.length() - 2} splits`,
  adjustment: { splits: splits.slice(0, 2) }
}];

export const suggestAddingSplits = ({ dataCube, splits }: ActionVariables) =>
  allDimensions(dataCube.dimensions)
    .filter(dimension => !splits.hasSplitOn(dimension))
    .slice(0, 2)
    .map(dimension => ({
      description: `Add ${dimension.title} split`,
      adjustment: {
        splits: splits.addSplit(Split.fromDimension(dimension))
      }
    }));

export const suggestAddingMeasure = ({ dataCube, series }: ActionVariables) => {
  const firstMeasure = allMeasures(dataCube.measures)[0];
  return [{
    description: `Add measure ${firstMeasure.title}`,
    adjustment: {
      series: series.addSeries(MeasureSeries.fromMeasure(firstMeasure))
    }
  }];
};

// TODO: Move these exports to commons
export const suggestRemovingMeasures = ({ series }: ActionVariables) => [{
  description: series.count() === 2 ? "Remove last measure" : `Remove last ${series.count() - 1} measures`,
  adjustment: {
    series: series.takeFirst()
  }
}];

export const HEAT_MAP_MANIFEST = new VisualizationManifest(
  "heatmap",
  "Heatmap",
  rulesEvaluator,
  emptySettingsConfig
);
