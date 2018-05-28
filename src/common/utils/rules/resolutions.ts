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

import { OrderedSet } from "immutable";
import { DataCube, Resolution, SplitCombine, Splits } from "../../models";

export class Resolutions {
  static someDimensions = (dataCube: DataCube): Resolution[] => {
    const numberOfSuggestedSplitDimensions = 2;
    const suggestedSplitDimensions = dataCube
      .getDimensionsByKind("string")
      .slice(0, numberOfSuggestedSplitDimensions);

    return suggestedSplitDimensions.map(dimension => {
      return {
        description: `Add a split on ${dimension.title}`,
        adjustment: {
          splits: Splits.fromSplitCombine(SplitCombine.fromExpression(dimension.expression))
        }
      };
    });
  }

  static defaultSelectedMeasures = (dataCube: DataCube): Resolution[] => {
    const defaultSelectedMeasures = dataCube.defaultSelectedMeasures || OrderedSet();
    const measures = defaultSelectedMeasures.map(measureName => dataCube.getMeasure(measureName)).toArray();
    if (measures.length === 0) {
      return [];
    }

    const measureNames = measures.map(measure => measure.title).join(", ");
    return [
      { description: `Select default measures: ${measureNames}`, adjustment: { selectedMeasures: measures } }
    ];
  }

  static firstMeasure = (dataCube: DataCube): Resolution[] => {
    const firstMeasure = dataCube.measures.first();
    return [{ description: `Select measure: ${firstMeasure.title}`, adjustment: { selectedMeasures: [firstMeasure] } }];
  }
}
