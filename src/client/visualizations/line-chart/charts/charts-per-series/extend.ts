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
import * as d3 from "d3";
import { Dataset, Datum } from "plywood";
import { Splits } from "../../../../../common/models/splits/splits";
import { Unary } from "../../../../../common/utils/functional/functional";
import { SPLIT } from "../../../../config/constants";

export default function calculateExtend(dataset: Dataset, splits: Splits, getY: Unary<Datum, number>, getYP: Unary<Datum, number>): [number, number] {

  function extentForData(data: Datum[], accessor: Unary<Datum, number>) {
    return d3.extent(data, accessor);
  }

  if (splits.length() === 1) {
    const [currMin, currMax] = extentForData(dataset.data, getY);
    const [prevMin, prevMax] = extentForData(dataset.data, getYP);
    return [d3.min([currMin, prevMin]), d3.max([currMax, prevMax])];
  } else {
    return dataset.data.reduce((acc, datum) => {
      const split = datum[SPLIT] as Dataset;
      // TODO: wtf?
      if (!split) {
        return acc;
      }
      const [accMin, accMax] = acc;
      const [currMin, currMax] = extentForData(split.data, getY);
      const [prevMin, prevMax] = extentForData(split.data, getYP);
      return [d3.min([currMin, prevMin, accMin]), d3.max([currMax, prevMax, accMax])];
    }, [0, 0]) as [number, number];
  }
}
