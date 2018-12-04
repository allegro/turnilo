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
import { SeriesPercents, SeriesPercentsValue } from "../../../common/models/series/series";
import { Unary } from "../../../common/utils/functional/functional";
import { classNames } from "../../utils/dom/dom";
import { Checkbox } from "../checkbox/checkbox";

interface PercentPickerProps {
  percents: SeriesPercents;
  percentsChange: Unary<SeriesPercents, void>;
  disabled?: boolean;
}

export const PercentsPicker: React.SFC<PercentPickerProps> = ({ disabled, percents, percentsChange }) => {
  const { ofParent, ofTotal } = percents;

  function togglePercent(type: keyof SeriesPercentsValue) {
    return () => percentsChange(percents.update(type, val => !val));
  }

  return <div className="percents-picker">
    <div className={classNames("percent-row", { disabled })}
         onClick={!disabled && togglePercent("ofTotal")}>
      <Checkbox disabled={disabled} selected={ofTotal} />
      <span className="label">"Percent of Total"</span>
    </div>
    <div className={classNames("percent-row", { disabled })}
         onClick={!disabled && togglePercent("ofParent")}>
      <Checkbox disabled={disabled} selected={ofParent} />
      <span className="label">"Percent of Parent"</span>
    </div>
  </div>;
};
