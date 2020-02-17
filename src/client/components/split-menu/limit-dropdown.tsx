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

import * as React from "react";
import { Colors } from "../../../common/models/colors/colors";
import { Binary } from "../../../common/utils/functional/functional";
import { STRINGS } from "../../config/constants";
import { Dropdown } from "../dropdown/dropdown";

function formatLimit(limit: number | string): string {
  if (limit === "custom") return "Custom";
  return limit === null ? "None" : String(limit);
}

const defaultLimits = [5, 10, 25, 50, 100];
const limitsForColors = [3, 5, 7, 9, 10];

function calculateSelectedLimit(limit: number, colors: Colors) {
  if (!colors) return limit;
  return colors.values ? "custom" : colors.limit;
}

function calculateLimits(colors: Colors, includeNone: boolean) {
  const items = colors ? limitsForColors : defaultLimits;
  if (includeNone) {
    return items.concat([null]);
  }
  return items;
}

export interface LimitDropdownProps {
  limit: number;
  colors: Colors;
  includeNone: boolean;
  onLimitSelect: Binary<number, Colors, void>;
}

export const LimitDropdown: React.SFC<LimitDropdownProps> = ({ onLimitSelect, limit, colors, includeNone }) => {

  function selectLimit(limit: number) {
    onLimitSelect(limit, colors ? Colors.fromLimit(colors.dimension, limit) : colors);
  }

  return <Dropdown<number | string>
    label={STRINGS.limit}
    items={calculateLimits(colors, includeNone)}
    selectedItem={calculateSelectedLimit(limit, colors)}
    renderItem={formatLimit}
    onSelect={selectLimit}
  />;
};
