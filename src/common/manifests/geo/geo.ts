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

import { Splits, DataCube, SplitCombine, Colors, Dimension } from '../../models/index';
import { Manifest, Resolve } from '../../models/manifest/manifest';

function handleCircumstance(dataCube: DataCube, splits: Splits, colors: Colors, current: boolean): Resolve {
  return Resolve.manual(0, 'The Geo visualization is not ready, please select another visualization.', []);
}

export const GEO_MANIFEST = new Manifest(
  'geo',
  'Geo',
  handleCircumstance
);
