/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Record } from "immutable";
import { Dimensions } from "../dimension/dimensions";
import { EMPTY_FILTER, Filter } from "../filter/filter";
import { SeriesList } from "../series-list/series-list";

export interface HighlightValue {
  delta: Filter;
  measure: string;
}

const defaultHighlight: HighlightValue = {
  delta: EMPTY_FILTER,
  measure: null
};

export class Highlight extends Record<HighlightValue>(defaultHighlight) {

  public toString(): string {
    return `[Highlight ${this.delta.toString()}]`;
  }

  public applyToFilter(filter: Filter): Filter {
    return filter.applyDelta(this.delta);
  }

  public constrainToDimensions(dimensions: Dimensions): Highlight {
    const { delta } = this;
    const newDelta = delta.constrainToDimensions(dimensions);
    if (newDelta.empty()) return null;
    return this.set("delta", newDelta);
  }

  public validForSeries(series: SeriesList): boolean {
    const { measure } = this;
    if (!measure) return true;
    return series.hasMeasureSeries(measure);
  }
}
