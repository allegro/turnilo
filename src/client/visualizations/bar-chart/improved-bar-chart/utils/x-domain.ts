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

import { Datum, NumberRange, TimeRange } from "plywood";
import { BarChartModel } from "./bar-chart-model";

export type DomainValue = boolean | number | string | Date | NumberRange | TimeRange;

export type XDomain = DomainValue[];

export function getXDomain(datums: Datum[], { continuousSplit }: BarChartModel): XDomain {
  return datums.map(datum => continuousSplit.selectValue<DomainValue>(datum));
}
