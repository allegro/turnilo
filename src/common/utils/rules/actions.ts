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

import { Splits } from "../../models/splits/splits";
import { HIGH_PRIORITY_ACTION, NORMAL_PRIORITY_ACTION, Resolve } from "../../models/visualization-manifest/visualization-manifest";
import { Resolutions } from "./resolutions";
import { Action } from "./rules-evaluator-builder";
import { VisualizationDependentAction } from "./visualization-dependent-evaluator";
import { VisualizationIndependentAction } from "./visualization-independent-evaluator";

export class Actions {
  static ready(score = 10): Action<{}> {
    return () => Resolve.ready(score);
  }

  static manualDimensionSelection(message: string): VisualizationDependentAction {
    return ({ dataCube }) => {
      return Resolve.manual(HIGH_PRIORITY_ACTION, message, Resolutions.someDimensions(dataCube));
    };
  }

  static removeExcessiveSplits(visualizationName = "Visualization"): VisualizationDependentAction {
    return ({ splits, dataCube }) => {
      const newSplits = splits.splits.take(dataCube.getMaxSplits());
      const excessiveSplits = splits.splits
        .skip(dataCube.getMaxSplits())
        .map(split => dataCube.getDimension(split.reference).title);
      return Resolve.manual(NORMAL_PRIORITY_ACTION, `${visualizationName} supports only ${dataCube.getMaxSplits()} splits`, [
        {
          description: `Remove excessive splits: ${excessiveSplits.toArray().join(", ")}`,
          adjustment: {
            splits: Splits.fromSplits(newSplits.toArray())
          }
        }
      ]);
    };
  }

  static manualMeasuresSelection(): VisualizationIndependentAction {
    return ({ dataCube }) => {
      const selectDefault = Resolutions.defaultSelectedMeasures(dataCube);
      const resolutions = selectDefault.length > 0 ? selectDefault : Resolutions.firstMeasure(dataCube);

      return Resolve.manual(NORMAL_PRIORITY_ACTION, "At least one of the measures should be selected", resolutions);
    };
  }
}
