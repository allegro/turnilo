/*
 * Copyright 2017-2022 Allegro.pl
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
import { allDimensions } from "../../models/dimension/dimensions";
import { allMeasures } from "../../models/measure/measures";
import { MeasureSeries } from "../../models/series/measure-series";
import { Split } from "../../models/split/split";
import { Resolve, VisualizationManifest } from "../../models/visualization-manifest/visualization-manifest";
import { Predicates } from "../../utils/rules/predicates";
import {
  ActionVariables,
  visualizationDependentEvaluatorBuilder
} from "../../utils/rules/visualization-dependent-evaluator";
import { settings } from "./settings";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.numberOfSplitsIsNot(1))
  .then(variables => Resolve.manual(
    3,
    "Scatterplot needs exactly 1 split",
    variables.splits.length() > 1 ? suggestRemovingSplits(variables) : suggestAddingSplits(variables)
  ))
  .when(Predicates.numberOfSeriesIsNot(2))
  .then(variables => Resolve.manual(
    3,
    "Scatterplot needs exactly 2 measures",
    variables.series.series.size < 2  ? suggestAddingMeasure(variables) : suggestRemovingMeasures(variables)
  ))
  .otherwise(({ isSelectedVisualization }) =>
    Resolve.ready(isSelectedVisualization ? 10 : 3)
  )
  .build();

const suggestRemovingSplits = ({ splits }: ActionVariables) => [{
    description: splits.length() === 2 ? "Remove last split" : `Remove last ${splits.length() - 1} splits`,
    adjustment: { splits: splits.slice(0, 1) }
  }];

const suggestAddingSplits = ({ dataCube, splits }: ActionVariables) =>
  allDimensions(dataCube.dimensions)
    .filter(dimension => !splits.hasSplitOn(dimension))
    .slice(0, 2)
    .map(dimension => ({
      description: `Add ${dimension.title} split`,
      adjustment: {
        splits: splits.addSplit(Split.fromDimension(dimension))
      }
    }));

const suggestAddingMeasure = ({ dataCube, series }: ActionVariables) => {
  const firstSeriesKey = series.getSeriesKeys().first();
  const notUsedMeasures = allMeasures(dataCube.measures).filter(measure => measure.name !== firstSeriesKey);

  if (notUsedMeasures.length > 0) {
  const firstMeasure = notUsedMeasures[0];
  return [{
    description: `Add measure ${firstMeasure.title}`,
    adjustment: {
      series: series.addSeries(MeasureSeries.fromMeasure(firstMeasure))
    }
  }];
  }

  return [{
    description: "Second measure needed",
    adjustment: null
  }];
};

const suggestRemovingMeasures = ({ series }: ActionVariables) => [{
    description: series.count() === 3 ? "Remove last measure" : "Use first two measures",
    adjustment: {
      series: series.takeNFirst(2)
    }
  }];

export const SCATTERPLOT_MANIFEST = new VisualizationManifest(
  "scatterplot",
  "Scatterplot",
  rulesEvaluator,
  settings
);
