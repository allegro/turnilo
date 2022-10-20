/*
 * Copyright 2017-2022 Allegro.pl
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
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { getFormattedClause } from "../../../common/utils/formatter/formatter";
import "./filter-clause-label.scss";
import timeShiftLabel from "./time-shift-label";

interface LabelProps {
  dimension: Dimension;
  clause: FilterClause;
  essence: Essence;
}

export function FilterClauseLabel(props: LabelProps) {
  const { dimension, clause, essence } = props;
  const { title, values } = getFormattedClause(dimension, clause, essence.timezone);
  const timeShift = timeShiftLabel(dimension, essence);

  return <div className="reading">
    {title ? <span className="filter-clause-title">{title}</span> : null}
    <span className="values">{values} {timeShift}</span>
  </div>;
}
