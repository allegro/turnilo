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
import { ClusterAuthJS, ClusterAuthType } from "../../common/models/cluster-auth/cluster-auth";
import { isNil } from "../../common/utils/general/general";

export function parseInteger(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new InvalidArgumentError("Must be an integer");
  }
  return parsed;
}

export function parseCredentials(username: string | undefined, password: string | undefined, type: ClusterAuthType): ClusterAuthJS | undefined {
  if (isNil(password) && isNil(username)) return undefined;
  if (isNil(username)) {
    throw new InvalidArgumentError("Expected username for password");
  }
  if (isNil(password)) {
    throw new InvalidArgumentError("Expected password for username");
  }
  return {
    type,
    username,
    password
  };
}
