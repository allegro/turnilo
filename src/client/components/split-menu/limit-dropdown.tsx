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
import { AVAILABLE_LIMITS } from "../../../common/limit/limit";
import { Unary } from "../../../common/utils/functional/functional";
import { STRINGS } from "../../config/constants";
import { Dropdown } from "../dropdown/dropdown";

function formatLimit(limit: number): string {
  return limit === null ? "None" : String(limit);
}

function calculateLimits(includeNone: boolean) {
  if (!includeNone) return AVAILABLE_LIMITS;
  return [...AVAILABLE_LIMITS, null];
}

export interface LimitDropdownProps {
  limit: number;
  includeNone: boolean;
  onLimitSelect: Unary<number, void>;
}

export const LimitDropdown: React.SFC<LimitDropdownProps> = ({ onLimitSelect, limit, includeNone }) => {
  return <Dropdown<number | string>
    label={STRINGS.limit}
    items={calculateLimits(includeNone)}
    selectedItem={limit}
    renderItem={formatLimit}
    onSelect={onLimitSelect}
  />;
};
