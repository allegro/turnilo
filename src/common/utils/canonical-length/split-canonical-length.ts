/*
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

import { Duration } from "chronoshift";
import { ClientDataCube, getTimeDimensionReference } from "../../models/data-cube/data-cube";
import { Split } from "../../models/split/split";

export default function splitCanonicalLength(split: Split, dataCube: ClientDataCube): number | null {
  const { reference, bucket } = split;
  if (reference !== getTimeDimensionReference(dataCube)) return null;
  return (bucket as Duration).getCanonicalLength();
}
