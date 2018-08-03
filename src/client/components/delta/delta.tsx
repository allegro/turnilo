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

import * as React from "react";
import { isNil } from "../../../common/utils";
import { Unary } from "../../../common/utils/functional/functional";
import "./delta.scss";

export type DeltaSign = -1 | 0 | 1;

export interface DeltaAttributes {
  delta: number;
  deltaPercentage: number;
  deltaSign: DeltaSign;
}

export function formatDelta(currentValue: number, previousValue: number): DeltaAttributes {
  if (isNil(currentValue) || isNil(previousValue)) {
    return null;
  }

  const delta = currentValue - previousValue;
  const deltaSign = delta ? delta < 0 ? -1 : 1 : 0;
  const deltaPercentage = Math.floor((delta / previousValue) * 100);

  return { deltaSign, deltaPercentage, delta };
}

function deltaSignToSymbol(deltaSign: DeltaSign): string {
  switch (deltaSign) {
    case -1:
      return "▼";
    case 0:
      return "";
    case 1:
      return "▲";
  }
}

function deltaSignToClassName(deltaSign: DeltaSign): string {
  switch (deltaSign) {
    case -1:
      return "delta-negative";
    case 0:
      return "delta-neutral";
    case 1:
      return "delta-positive";
  }
}

export interface DeltaProps {
  currentValue: number;
  previousValue: number;
  formatter: Unary<number, string>;
}

export const Delta: React.SFC<DeltaProps> = ({ currentValue, previousValue, formatter }) => {
  const formattedDelta = formatDelta(currentValue, previousValue);
  if (formattedDelta === null) {
    return <span className="delta-neutral">-</span>;
  }

  const { delta, deltaPercentage, deltaSign } = formattedDelta;
  return <span className={deltaSignToClassName(deltaSign)}>
    {deltaSignToSymbol(deltaSign)}
    {formatter(Math.abs(delta))}
    {isFinite(deltaPercentage) && ` (${Math.abs(deltaPercentage)}%)`}
  </span>;
};
