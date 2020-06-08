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

import { PlywoodRange, Range } from "plywood";

export function union(first: PlywoodRange | null, second: PlywoodRange | null): PlywoodRange | null {
  if (!Range.isRange(first) && !Range.isRange(second)) {
    return null;
  }
  if (!Range.isRange(first)) {
    return second;
  }
  if (!Range.isRange(second)) {
    return first;
  }
  return first.union(second);
}
