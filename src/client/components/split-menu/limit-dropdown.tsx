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
import { STRINGS } from "../../config/constants";
import { Dropdown } from "../dropdown/dropdown";

function formatLimit(limit: number): string {
  return limit === null ? "None" : String(limit);
}

// TODO: Review again when fixing time split menu in #756
function calculateLimits(limits: number[], includeNone: boolean) {
  if (!includeNone) return limits;
  return [...limits, null];
}

export interface LimitDropdownProps {
  selectedLimit: number;
  limits: number[];
  includeNone: boolean;
  onLimitSelect: Unary<number, void>;
}

export const LimitDropdown: React.FunctionComponent<LimitDropdownProps> = ({ onLimitSelect, limits, selectedLimit, includeNone }) => {
  return <Dropdown<number | string>
    label={STRINGS.limit}
    items={calculateLimits(limits, includeNone)}
    selectedItem={selectedLimit}
    renderItem={formatLimit}
    onSelect={onLimitSelect}
  />;
};
