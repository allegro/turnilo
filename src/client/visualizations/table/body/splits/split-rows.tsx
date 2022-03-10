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

import { Datum, PseudoDatum } from "plywood";
import React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { FlattenedSplitColumns } from "../../../../components/tabular-scroller/splits/flattened-split-columns";
import { FlattenedSplits } from "../../../../components/tabular-scroller/splits/flattened-splits";
import { NestedSplits } from "./nested-splits";

interface SplitRowsProps {
  collapseRows: boolean;
  visibleRowsIndexRange: [number, number];
  essence: Essence;
  data: PseudoDatum[];
  hoverRow?: Datum;
  segmentWidth: number;
  highlightedRowIndex: number | null;
}

export const SplitRows: React.FunctionComponent<SplitRowsProps> = props => {
  const { collapseRows, ...rest } = props;
  const { data, essence: { timezone, splits: { splits } } } = rest;
  if (!data) return null;
  return collapseRows ?
    <FlattenedSplits
      {...rest}
      splitLabel={({ datum }) =>
        <FlattenedSplitColumns splits={splits} datum={datum} timezone={timezone} />}
    /> :
    <NestedSplits {...rest} />;
};
