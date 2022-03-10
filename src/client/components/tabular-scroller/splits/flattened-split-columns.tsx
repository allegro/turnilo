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

import { Timezone } from "chronoshift";
import { List } from "immutable";
import { PseudoDatum } from "plywood";
import React from "react";
import { Split } from "../../../../common/models/split/split";
import { formatSegment } from "../../../../common/utils/formatter/formatter";
import "./flattened-split-columns.scss";

interface FlattenedSplitColumnsProps {
  splits: List<Split>;
  datum: PseudoDatum;
  timezone: Timezone;
}

export const FlattenedSplitColumns: React.FunctionComponent<FlattenedSplitColumnsProps> = ({ splits, datum, timezone }) =>
  <React.Fragment>
    {splits.map(split => {
      const { reference } = split;
      const value = split.selectValue(datum);
      return <div key={reference} className="flattened-split-value">{formatSegment(value, timezone)}</div>;
    })}
  </React.Fragment>;
