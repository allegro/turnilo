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

import { SeriesDerivation } from "../series/series-definition";
import { DataSeriesPercentOf } from "./data-series";

function formatPercentOf(percentOf: DataSeriesPercentOf): string {
  return `__${percentOf}_`;
}

function formatDerivation(derivation: SeriesDerivation): string {
  return `_${derivation}__`;
}

export function plywoodExpressionKey(name: string, derivation: SeriesDerivation, percentOf?: DataSeriesPercentOf): string {
  const percentStr = percentOf ? formatPercentOf(percentOf) : "";
  const derivationStr = derivation === SeriesDerivation.CURRENT ? "" : formatDerivation(derivation);
  return `${derivationStr}${name}${percentStr}`;
}

function extractDerivation(fullName: string): { derivation: SeriesDerivation, length: number } {
  if (fullName.startsWith(formatDerivation(SeriesDerivation.PREVIOUS))) {
    return { derivation: SeriesDerivation.PREVIOUS, length: formatDerivation(SeriesDerivation.PREVIOUS).length };
  }
  if (fullName.startsWith(formatDerivation(SeriesDerivation.DELTA))) {
    return { derivation: SeriesDerivation.DELTA, length: formatDerivation(SeriesDerivation.DELTA).length };
  }
  return { derivation: SeriesDerivation.CURRENT, length: 0 };
}

function extractPercent(fullName: string): { percentOf?: DataSeriesPercentOf, length: number } {
  if (fullName.endsWith(formatPercentOf(DataSeriesPercentOf.TOTAL))) {
    return { percentOf: DataSeriesPercentOf.TOTAL, length: formatPercentOf(DataSeriesPercentOf.TOTAL).length };
  }
  if (fullName.endsWith(formatPercentOf(DataSeriesPercentOf.PARENT))) {
    return { percentOf: DataSeriesPercentOf.PARENT, length: formatPercentOf(DataSeriesPercentOf.PARENT).length };
  }
  return { length: 0 };
}

/**
 * @deprecated
 */
export function nominalName(fullName: string): { name: string, derivation: SeriesDerivation, percentOf?: DataSeriesPercentOf } {
  const { derivation, length: derivationLength } = extractDerivation(fullName);
  const { percentOf, length: percentLength } = extractPercent(fullName);
  const name = fullName.substring(derivationLength, fullName.length - percentLength);
  return { name, derivation, percentOf };
}

function derivationTitle(derivation: SeriesDerivation): string {
  switch (derivation) {
    case SeriesDerivation.CURRENT:
      return "";
    case SeriesDerivation.PREVIOUS:
      return "Previous ";
    case SeriesDerivation.DELTA:
      return "Difference ";
  }
}

function percentTitle(percentOf: DataSeriesPercentOf): string {
  if (!percentOf) return "";
  switch (percentOf) {
    case DataSeriesPercentOf.TOTAL:
      return " (% of Total)";
    case DataSeriesPercentOf.PARENT:
      return " (% of Parent)";
  }
}

export function title(title: string, derivation: SeriesDerivation, percentOf: DataSeriesPercentOf): string {
  const derivationStr = derivationTitle(derivation);
  const percentStr = percentTitle(percentOf);
  return `${derivationStr}${title}${percentStr}`;
}
