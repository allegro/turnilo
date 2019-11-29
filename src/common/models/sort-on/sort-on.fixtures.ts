/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Dimension } from "../dimension/dimension";
import { Measure } from "../measure/measure";
import { fromMeasure } from "../series/measure-concrete-series";
import { DimensionSortOn, SeriesSortOn, SortOn } from "./sort-on";

export class SortOnFixtures {
  public static get DEFAULT_A_JS(): Measure {
    return Measure.fromJS({
      name: "price",
      title: "Price",
      formula: "$main.min($price)"
    });
  }

  public static get DEFAULT_B_JS(): Measure {
    return Measure.fromJS({
      name: "price",
      title: "Price",
      formula: "$main.sum($price)"
    });
  }

  public static get DEFAULT_C_JS(): Dimension {
    return Dimension.fromJS({
      name: "country",
      title: "important countries",
      formula: "$country",
      kind: "string"
    });
  }

  static defaultA() {
    return new SeriesSortOn(fromMeasure(SortOnFixtures.DEFAULT_A_JS));
  }

  static defaultB() {
    return new SeriesSortOn(fromMeasure(SortOnFixtures.DEFAULT_B_JS));
  }

  static defaultC() {
    return new DimensionSortOn(SortOnFixtures.DEFAULT_C_JS);
  }
}
