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
import { Omit } from "../../../common/utils/functional/functional";
import { InputWithPresets, InputWithPresetsProps } from "../input-with-presets/input-with-presets";

type QuantilePickerProps = Omit<InputWithPresetsProps<number>, "parseCustomValue" | "formatCustomValue">;

function parse(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function format(n: number): string {
  return n.toString();
}

export const QuantilePicker: React.FunctionComponent<QuantilePickerProps> = props =>
  <InputWithPresets<number> {...props} parseCustomValue={parse} formatCustomValue={format} />;
