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
import { Dataset } from "plywood";
import { range } from "../../../../common/utils/functional/functional";
import { SPLIT } from "../../../config/constants";
import { ContinuousScale } from "../../../visualizations/line-chart/utils/continuous-types";

export const makeDataset = (datums: any[]) =>
  Dataset.fromJS([{ [SPLIT]: datums }]);

export const january = (n: number) => new Date(`2000-01-${n}`);

const nonNominalDatums = [
  { time: { type: "TIME_RANGE", start: january(1), end: january(2) }, measure: 12 },
  { time: { type: "TIME_RANGE", start: january(2), end: january(3) }, measure: 654 },
  { time: { type: "TIME_RANGE", start: january(3), end: january(4) }, measure: 11000 },
  { time: { type: "TIME_RANGE", start: january(4), end: january(5) }, measure: 987 },
  { time: { type: "TIME_RANGE", start: january(5), end: january(6) }, measure: 21321321 },
  { time: { type: "TIME_RANGE", start: january(6), end: january(7) }, measure: 765765 }
];
export const nonNominalDataset = makeDataset(nonNominalDatums);

const sparseNonNominalDatums = [
  { time: { type: "TIME_RANGE", start: january(1), end: january(2) }, measure: 12 },
  { time: { type: "TIME_RANGE", start: january(6), end: january(7) }, measure: 11000 }
];
export const sparseNonNominalDataset = makeDataset(sparseNonNominalDatums);

export const nominalDataset = makeDataset([{ channel: "foobar", [SPLIT]: nonNominalDatums }]);

export const sparseNominalDataset = makeDataset([{ channel: "foobar", [SPLIT]: sparseNonNominalDatums }]);

export const scale = d3.scaleTime().domain([january(1), january(7)]).range([0, 1000]) as unknown as ContinuousScale;

export function createDailyNominalDatasetInJanuary(startDay: number, endDay: number): Dataset {
  const datums = range(startDay, endDay).map(i => {
    const start = january(i);
    const end = january(i + 1);
    return { time: { type: "TIME_RANGE", start, end } };
  });
  return makeDataset(datums);
}
