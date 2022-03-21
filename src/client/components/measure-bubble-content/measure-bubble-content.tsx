/*
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

import React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import { Delta } from "../delta/delta";
import "./measure-bubble-content.scss";

export interface MeasureBubbleContentProps {
  current: number;
  previous: number;
  formatter: Unary<number, string>;
  lowerIsBetter?: boolean;
}

export const MeasureBubbleContent: React.FunctionComponent<MeasureBubbleContentProps> = ({ lowerIsBetter, formatter, current, previous }) => {
  const currentValue = formatter(current);
  const previousValue = formatter(previous);
  return <React.Fragment>
    <strong className="current-value">{currentValue}</strong>
    <span className="previous-value">{previousValue}</span>
    <Delta formatter={formatter} currentValue={current} previousValue={previous} lowerIsBetter={lowerIsBetter} />
  </React.Fragment>;
};
