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
import { Measure, MeasureDerivation, titleWithDerivation } from "../measure/measure";
import { Sort, SortDirection, SortReferenceType } from "../sort/sort";

export class SortOn {

  static getName(sortOn: SortOn): string {
    return sortOn.getName();
  }

  static getTitle(sortOn: SortOn): string {
    return sortOn.getTitle();
  }

  static equals(sortOn: SortOn, other: SortOn): boolean {
    if (!sortOn) return sortOn === other;
    return sortOn.equals(other);
  }

  constructor(public reference: Dimension | Measure, public period = MeasureDerivation.CURRENT) {
  }

  public getName(): string {
    return this.reference.name;
  }

  public equals(other: SortOn): boolean {
    return other instanceof SortOn && this.reference.equals(other.reference) && this.period === other.period;
  }

  public toSort(direction?: SortDirection): Sort {
    return new Sort({
      reference: this.reference.name,
      type: this.reference instanceof Dimension ? SortReferenceType.DIMENSION : SortReferenceType.MEASURE,
      period: this.period,
      direction
    });
  }

  public getTitle() {
    if (this.reference instanceof Dimension) return this.reference.title;
    return titleWithDerivation(this.reference, this.period);
  }
}
