/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Dataset } from "plywood";
import { Clicker } from "../clicker/clicker";
import { Essence } from "../essence/essence";
import { Stage } from "../stage/stage";
import { Timekeeper } from "../timekeeper/timekeeper";

export interface VisualizationProps {
  clicker: Clicker;
  essence: Essence;
  timekeeper: Timekeeper;
  stage: Stage;
  registerDownloadableDataset?: (dataset: Dataset) => void;
  refreshRequestTimestamp: number;
}

enum DatasetLoadStatus { LOADED, LOADING, ERROR }

interface DatasetLoadBase {
  status: DatasetLoadStatus;
}

interface DatasetLoading extends DatasetLoadBase {
  status: DatasetLoadStatus.LOADING;
}

interface DatasetLoaded extends DatasetLoadBase {
  status: DatasetLoadStatus.LOADED;
  dataset: Dataset;
}

interface DatasetLoadError extends DatasetLoadBase {
  status: DatasetLoadStatus.ERROR;
  error: Error;
}

export const loading: DatasetLoading = { status: DatasetLoadStatus.LOADING };
export const error = (error: Error): DatasetLoadError => ({ error, status: DatasetLoadStatus.ERROR });
export const loaded = (dataset: Dataset): DatasetLoaded => ({ status: DatasetLoadStatus.LOADED, dataset });

export const isLoading = (dl: DatasetLoad): dl is DatasetLoading => dl.status === DatasetLoadStatus.LOADING;
export const isLoaded = (dl: DatasetLoad): dl is DatasetLoaded => dl.status === DatasetLoadStatus.LOADED;
export const isError = (dl: DatasetLoad): dl is DatasetLoadError => dl.status === DatasetLoadStatus.ERROR;

export type DatasetLoad = DatasetLoading | DatasetLoaded | DatasetLoadError;
