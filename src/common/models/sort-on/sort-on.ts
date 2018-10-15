/*
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

import { Dimension } from "../dimension/dimension";
import { Measure } from "../measure/measure";

export class SortOn {

  static equal(s1: SortOn, s2: SortOn): boolean {
    return s1.equals(s2);
  }

  static getName(s: SortOn): string {
    return s.getName();
  }

  static getTitle(s: SortOn): string {
    return s.getTitle();
  }

  static fromDimension(dimension: Dimension): SortOn {
    return new SortOn(dimension);
  }

  static fromMeasure(measure: Measure): SortOn {
    return new SortOn(measure);
  }

  constructor(public reference: Dimension | Measure) {
  }

  public getName(): string {
    return this.reference.name;
  }

  public getTitle(): string {
    return this.reference.title;
  }

  public equals(other: SortOn): boolean {
    return this.reference.equals(other.reference);
  }
}
