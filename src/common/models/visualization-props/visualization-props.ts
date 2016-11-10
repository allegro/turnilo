/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Dataset } from 'plywood';
import { Fn } from '../../utils/general/general';
import { Clicker, Stage, Essence, Timekeeper, DeviceSize } from '../index';

export interface VisualizationProps {
  clicker: Clicker;
  essence: Essence;
  timekeeper: Timekeeper;
  stage: Stage;
  openRawDataModal?: Fn;
  registerDownloadableDataset?: (dataset: Dataset) => void;
  deviceSize?: DeviceSize;
  isThumbnail?: boolean;
}

export interface DatasetLoad {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
}
