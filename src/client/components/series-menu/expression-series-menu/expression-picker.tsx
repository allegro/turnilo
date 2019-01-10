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
import { SeriesExpression } from "../../../../common/models/series/series-definition";
import { Unary } from "../../../../common/utils/functional/functional";
import { Dropdown } from "../../dropdown/dropdown";

interface ExpressionPickerProps {
  selected: SeriesExpression;
  onSelect: Unary<SeriesExpression, void>;
}

interface ExpressionOption {
  value: SeriesExpression;
  label: string;
}

const placeholder: ExpressionOption = {
  value: null,
  label: "Select expression"
};

const items: ExpressionOption[] = [
  { value: SeriesExpression.PERCENT_OF_PARENT, label: "Percent of parent" },
  { value: SeriesExpression.PERCENT_OF_TOTAL, label: "Percent of total" }
];

function renderOption(option: ExpressionOption) {
  return <span className="option-label">{option.label}</span>;
}

export const ExpressionPicker: React.SFC<ExpressionPickerProps> = ({ onSelect, selected }) => {
  const selectedItem = items.find(({ value }) => value === selected);
  return <div className="expression-picker">
    <div className="title">Expression:</div>
    <Dropdown<ExpressionOption>
      items={items}
      equal={(a, b) => a.value === b.value}
      keyItem={d => d.value}
      renderItem={renderOption}
      onSelect={d => onSelect(d.value)}
      selectedItem={selectedItem || placeholder} />
  </div>;
};
