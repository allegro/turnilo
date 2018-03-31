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

export interface MeasuresDefinition {
  isMulti: boolean;
  single: string;
  multi: string[];
}

export interface MeasuresDefinitionConverter {
  fromSimpleValues(multiMeasureMode: boolean, singleMeasure: string, selectedMeasures: OrderedSet<string>): MeasuresDefinition;

  toMultiMeasureMode(measuresDefinition: MeasuresDefinition): boolean;

  toSingleMeasure(measuresDefinition: MeasuresDefinition): string;

  toSelectedMeasures(measuresDefinition: MeasuresDefinition): OrderedSet<string>;
}

export const measuresDefinitionConverter: MeasuresDefinitionConverter = {
  fromSimpleValues(multiMeasureMode: boolean, singleMeasure: string, selectedMeasures: OrderedSet<string>): MeasuresDefinition {
    return {
      isMulti: multiMeasureMode,
      single: singleMeasure,
      multi: selectedMeasures.toArray()
    };
  },

  toMultiMeasureMode(measuresDefinition: MeasuresDefinition): boolean {
    return measuresDefinition.isMulti;
  },

  toSingleMeasure(measuresDefinition: MeasuresDefinition): string {
    return measuresDefinition.single;
  },

  toSelectedMeasures(measuresDefinition: MeasuresDefinition): OrderedSet<string> {
    return OrderedSet(measuresDefinition.multi);
  }
};
