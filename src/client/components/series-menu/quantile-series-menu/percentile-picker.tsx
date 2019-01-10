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
import { Unary } from "../../../../common/utils/functional/functional";

interface PercentilePickerProps {
  percentile: number;
  percentileChange: Unary<number, void>;
  error?: string;
}

export const PercentilePicker: React.SFC<PercentilePickerProps> = ({ error, percentile, percentileChange }) => {

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    percentileChange(parseInt(e.target.value, 10));
  }

  return <React.Fragment>
    <input type="number" min="1" max="100" value={percentile.toString(10)} onChange={handleChange} />
    {error && <span className="percentile-error">{error}</span>}
  </React.Fragment>;
};
