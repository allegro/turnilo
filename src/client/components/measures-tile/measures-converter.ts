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

import { getTitleWithUnits, isApproximate, Measure } from "../../../common/models/measure/measure";
import { isMeasure, MeasureOrGroup, Measures } from "../../../common/models/measure/measures";

export type MeasureOrGroupForView = MeasureForView | MeasureGroupForView;

export interface MeasureForView {
  name: string;
  title: string;
  approximate: boolean;
  description?: string;
  hasSelectedMeasures: boolean;
  hasSearchText: boolean;
  type: MeasureForViewType.measure;
}

export interface MeasureGroupForView {
  name: string;
  title: string;
  description?: string;
  hasSearchText: boolean;
  hasSelectedMeasures: boolean;
  children: MeasureOrGroupForView[];
  type: MeasureForViewType.group;
}

export enum MeasureForViewType {
  measure = "measure",
  group = "group"
}

export function convert(
  measures: Measures,
  hasSearchTextPredicate: (measure: Measure) => boolean,
  isSelectedMeasurePredicate: (measure: Measure) => boolean): MeasureOrGroupForView[] {

  const { byName, tree } = measures;

  function convertElement(el: MeasureOrGroup): MeasureOrGroupForView {
    if (isMeasure(el)) {
      const measure = byName[el];
      const {} = measure;

      return {
        name: measure.name,
        title: getTitleWithUnits(measure),
        description: measure.description,
        hasSelectedMeasures: isSelectedMeasurePredicate(measure),
        hasSearchText: hasSearchTextPredicate(measure),
        type: MeasureForViewType.measure,
        approximate: isApproximate(measure)
      };
    } else {
      const { name, title, description, measures } = el;
      const measuresForView = measures.map(item => convertElement(item));
      return {
        name,
        title,
        description,
        hasSearchText: measuresForView.some(measureForView => measureForView.hasSearchText),
        hasSelectedMeasures: measuresForView.some(measureForView => measureForView.hasSelectedMeasures),
        children: measuresForView,
        type: MeasureForViewType.group
      };
    }
  }

  return tree.map(convertElement);
}
