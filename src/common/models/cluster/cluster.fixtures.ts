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

import { ClusterJS } from "./cluster";

export class ClusterFixtures {
  static druidWikiClusterJS(): ClusterJS {
    return {
      name: "druid-wiki",
      type: "druid",
      host: "192.168.99.100",
      version: "0.9.1",
      timeout: 30000,
      healthCheckTimeout: 50,
      sourceListScan: "auto",
      sourceListRefreshInterval: 10000,
      sourceReintrospectInterval: 10000,

      introspectionStrategy: "segment-metadata-fallback"
    };
  }

  static druidTwitterClusterJS(): ClusterJS {
    return {
      name: "druid-twitter",
      type: "druid",
      host: "192.168.99.101",
      version: "0.9.1",
      timeout: 30000,
      healthCheckTimeout: 200,
      sourceListScan: "auto",
      sourceListRefreshInterval: 10000,
      sourceReintrospectInterval: 10000,

      introspectionStrategy: "segment-metadata-fallback"
    };
  }
}
