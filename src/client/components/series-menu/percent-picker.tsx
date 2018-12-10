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
import { SeriesPercentages, SeriesPercentageValue } from "../../../common/models/series/series-definition";
import { Unary } from "../../../common/utils/functional/functional";
import { STRINGS } from "../../config/constants";
import { classNames } from "../../utils/dom/dom";
import { Checkbox } from "../checkbox/checkbox";
import "./percentage-picker.scss";

interface PercentagePickerProps {
  percentages: SeriesPercentages;
  percentagesChange: Unary<SeriesPercentages, void>;
  disabled?: boolean;
}

export const PercentagePicker: React.SFC<PercentagePickerProps> = ({ disabled, percentages, percentagesChange }) => {
  const { ofParent, ofTotal } = percentages;

  function togglePercentage(type: keyof SeriesPercentageValue) {
    return () => percentagesChange(percentages.update(type, val => !val));
  }

  const toggleTotal = disabled ? undefined : togglePercentage("ofTotal");
  const toggleParent = disabled ? undefined : togglePercentage("ofParent");

  return <div className="percentages-picker">
    <span className="percentages-title">{STRINGS.percentages}</span>
    <div className={classNames("percentage-row", { disabled })}
         onClick={toggleTotal}>
      <Checkbox disabled={disabled} selected={ofTotal} />
      <span className="label">Percent of Total</span>
    </div>
    <div className={classNames("percentage-row", { disabled })}
         onClick={toggleParent}>
      <Checkbox disabled={disabled} selected={ofParent} />
      <span className="label">Percent of Parent</span>
    </div>
  </div>;
};
