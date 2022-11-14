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

import { isNil } from "../../utils/general/general";

export type ClusterAuthType = "http-basic";

interface BasicHttpClusterAuth {
  type: "http-basic";
  username: string;
  password: string;
}

export type ClusterAuth = BasicHttpClusterAuth;

export interface ClusterAuthJS {
  type: ClusterAuthType;
  username?: string;
  password?: string;
}

export function readClusterAuth(input?: ClusterAuthJS): ClusterAuth | undefined {
  if (isNil(input)) return undefined;
  switch (input.type) {
    case "http-basic": {
      const { username, password } = input;
      if (isNil(username)) throw new Error("ClusterAuth: username field is required for http-basic auth configuration");
      if (isNil(password)) throw new Error("ClusterAuth: password field is required for http-basic auth configuration");
      return {
        type: "http-basic",
        password,
        username
      };
    }
    default: {
      throw new Error(`ClusterAuth: Unrecognized authorization type: ${input.type}`);
    }
  }
}
