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

import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../../common/models/essence/essence";
import { selectFirstSplitDatums } from "../../../utils/dataset/selectors/selectors";
import { Legend } from "./legend";

interface SplitLegendProps {
  dataset: Dataset;
  essence: Essence;
}

export const SplitLegend: React.SFC<SplitLegendProps> = props => {
  const { essence, dataset } = props;
  const legendSplit = essence.splits.splits.first();

  const legendDimension = essence.dataCube.getDimension(legendSplit.reference);
  const title = legendSplit.getTitle(legendDimension);

  const nestedDataset = selectFirstSplitDatums(dataset);
  const values = nestedDataset.map(datum => String(datum[legendSplit.reference]));

  return <Legend
    values={values}
    title={title}/>;
};
