/*
 * Copyright 2017-2022 Allegro.pl
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

import { InvalidArgumentError } from "commander";
import { isNil } from "../../common/utils/general/general";

export function parseInteger(value: string): number {
  const parsed = parseInt(value, 10);
  invariant(!isNaN(parsed), "Must be an integer");
  return parsed;
}

export function assertCredentials(username: string | undefined, password: string | undefined) {
  invariant(isNil(password) && isNil(username) || !isNil(username) && !isNil(password), "You need to pass both username and password");
}

function invariant(condition: boolean, message: string) {
  if (!condition) throw new InvalidArgumentError(message);
}
