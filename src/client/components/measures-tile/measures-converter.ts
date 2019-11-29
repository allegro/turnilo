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

import { Measure } from "../../../common/models/measure/measure";
import { MeasureGroup, MeasureOrGroupVisitor } from "../../../common/models/measure/measure-group";

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

export class MeasuresConverter implements MeasureOrGroupVisitor<MeasureOrGroupForView> {
  constructor(
    private hasSearchTextPredicate: (measure: Measure) => boolean,
    private isSelectedMeasurePredicate: (measure: Measure) => boolean
  ) {
  }

  visitMeasure(measure: Measure): MeasureOrGroupForView {
    const { hasSearchTextPredicate, isSelectedMeasurePredicate } = this;

    return {
      name: measure.name,
      title: measure.getTitleWithUnits(),
      description: measure.description,
      hasSelectedMeasures: isSelectedMeasurePredicate(measure),
      hasSearchText: hasSearchTextPredicate(measure),
      type: MeasureForViewType.measure,
      approximate: measure.isApproximate()
    };
  }

  visitMeasureGroup(measureGroup: MeasureGroup): MeasureOrGroupForView {
    const { name, title, description, measures } = measureGroup;
    const measuresForView = measures.map(measureOrGroup => measureOrGroup.accept(this));

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
