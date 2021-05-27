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

import { List } from "immutable";
import { ClientDataCube, getDimensionsByKind } from "../../models/data-cube/data-cube";
import { SeriesList } from "../../models/series-list/series-list";
import { MeasureSeries } from "../../models/series/measure-series";
import { Split } from "../../models/split/split";
import { Splits } from "../../models/splits/splits";
import { Resolution } from "../../models/visualization-manifest/visualization-manifest";

export class Resolutions {
  static someDimensions = (dataCube: ClientDataCube): Resolution[] => {
    const numberOfSuggestedSplitDimensions = 2;
    const suggestedSplitDimensions = getDimensionsByKind(dataCube, "string")
      .slice(0, numberOfSuggestedSplitDimensions);

    return suggestedSplitDimensions.map(dimension => {
      return {
        description: `Add a split on ${dimension.title}`,
        adjustment: {
          splits: Splits.fromSplit(Split.fromDimension(dimension))
        }
      };
    });
  }

  static defaultSelectedMeasures = (dataCube: ClientDataCube): Resolution[] => {
    const defaultSelectedMeasures = dataCube.defaultSelectedMeasures || [];
    const measures = defaultSelectedMeasures.map(measureName => dataCube.measures.getMeasureByName(measureName));
    if (measures.length === 0) {
      return [];
    }

    const measureTitles = measures.map(measure => measure.title);
    return [
      {
        description: `Select default measures: ${measureTitles.join(", ")}`,
        adjustment: {
          series: new SeriesList({ series: List(measures.map(measure => MeasureSeries.fromMeasure(measure))) })
        }
      }
    ];
  }

  static firstMeasure = (dataCube: ClientDataCube): Resolution[] => {
    const firstMeasure = dataCube.measures.first();
    if (!firstMeasure) return [];
    return [
      {
        description: `Select measure: ${firstMeasure.title}`,
        adjustment: {
          series: new SeriesList({ series: List.of(MeasureSeries.fromMeasure(firstMeasure)) })
        }
      }];
  }
}
