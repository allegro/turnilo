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

import { Resolve } from "../../models";
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
      return Resolve.manual(4, message, Resolutions.someDimensions(dataCube));
    };
  }

  static manualMeasuresSelection(): VisualizationIndependentAction {
    return ({ dataCube }) => {
      const selectDefault = Resolutions.defaultSelectedMeasures(dataCube);
      const resolutions = selectDefault.length > 0 ? selectDefault : Resolutions.firstMeasure(dataCube);

      return Resolve.manual(3, "At least one of the measures should be selected", resolutions);
    };
  }
}
