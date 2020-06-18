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

import { Dataset, Datum } from "plywood";
import { compose } from "../../../../common/utils/functional/functional";
import { SPLIT } from "../../../config/constants";

export const selectMainDatum = (dataset: Dataset): Datum =>
  dataset.data[0];

export const selectSplitDataset = (datum: Datum): Dataset =>
  datum[SPLIT] as Dataset;

const selectDatums = (dataset: Dataset): Datum[] =>
  dataset.data;

export const selectSplitDatums: (datum: Datum) => Datum[] =
  compose(selectSplitDataset, selectDatums);

export const selectFirstSplitDataset: (dataset: Dataset) => Dataset =
  compose(selectMainDatum, selectSplitDataset);

export const selectFirstSplitDatums: (dataset: Dataset) => Datum[] =
  compose(selectFirstSplitDataset, selectDatums);
