/*
 * Copyright 2017-2021 Allegro.pl
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

export enum DatasetRequestStatus { LOADED, LOADING, ERROR }

interface DatasetRequestBase {
  status: DatasetRequestStatus;
}

interface DatasetLoading extends DatasetRequestBase {
  status: DatasetRequestStatus.LOADING;
}

interface DatasetLoaded extends DatasetRequestBase {
  status: DatasetRequestStatus.LOADED;
  dataset: Dataset;
}

interface DatasetLoadError extends DatasetRequestBase {
  status: DatasetRequestStatus.ERROR;
  error: Error;
}

export const loading: DatasetLoading = { status: DatasetRequestStatus.LOADING };
export const error = (error: Error): DatasetLoadError => ({ error, status: DatasetRequestStatus.ERROR });
export const loaded = (dataset: Dataset): DatasetLoaded => ({ status: DatasetRequestStatus.LOADED, dataset });

export const isLoading = (dr: DatasetRequest): dr is DatasetLoading => dr.status === DatasetRequestStatus.LOADING;
export const isLoaded = (dr: DatasetRequest): dr is DatasetLoaded => dr.status === DatasetRequestStatus.LOADED;
export const isError = (dr: DatasetRequest): dr is DatasetLoadError => dr.status === DatasetRequestStatus.ERROR;

export type DatasetRequest = DatasetLoading | DatasetLoaded | DatasetLoadError;
