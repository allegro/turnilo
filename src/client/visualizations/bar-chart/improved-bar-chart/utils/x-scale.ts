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
import { Datum, NumberRange, TimeRange } from "plywood";
import { Unary } from "../../../../../common/utils/functional/functional";
import { DomainValue, XDomain } from "./x-domain";

export type OrdinalScale = d3.scale.Ordinal<string, number>;

export function calculateXScale(domain: XDomain, width: number): OrdinalScale {
  return d3.scale.ordinal()
    .domain(domain.map(value => formatDomainValue(value)))
    .rangeRoundBands([0, width], 0, 0);
}

export const xGetter = (reference: string): Unary<Datum, string> => datum => {
  const value = datum[reference];
  return formatDomainValue(value as DomainValue);
};

export function formatDomainValue(value: DomainValue): string {
  if (TimeRange.isTimeRange(value)) {
    const { start } = value;
    return start.toISOString();
  }
  if (NumberRange.isNumberRange(value)) {
    const { start } = value;
    return start.toString(10);
  }
  return String(value);
}
