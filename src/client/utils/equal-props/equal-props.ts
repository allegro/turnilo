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

import { isEqualable } from "../../../common/utils/immutable-utils/immutable-utils";

function equals(a: any, b: unknown): boolean {
  if (a === null) {
    return a === b;
  }
  if (isEqualable(a)) {
    return a.equals(b);
  }
  return a === b;
}

export function equalProps<T extends object>(oldProps: T, newProps: T): boolean {
  const keys = Object.keys(oldProps) as Array<keyof T>;
  return keys.every(key => equals(oldProps[key], newProps[key]));
}
