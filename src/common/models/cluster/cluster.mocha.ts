/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { expect } from "chai";
import { testImmutableClass } from "immutable-class-tester";
import { Cluster, ClusterJS } from "./cluster";

describe("Cluster", () => {
  it("is an immutable class", () => {
    testImmutableClass(Cluster, [
      {
        name: "my-druid-cluster"
      },
      {
        name: "my-druid-cluster",
        url: "https://192.168.99.100",
        version: "0.9.1",
        timeout: 30000,
        healthCheckTimeout: 50,
        sourceListScan: "auto",
        sourceListRefreshOnLoad: true,
        sourceListRefreshInterval: 10000,
        sourceReintrospectInterval: 10000,

        introspectionStrategy: "segment-metadata-fallback"
      },
      {
        name: "my-mysql-cluster",
        url: "http://192.168.99.100",
        timeout: 30000,
        sourceListScan: "auto"
      },
      {
        name: "my-mysql-cluster",
        url: "https://192.168.99.100",
        timeout: 30000,
        sourceListScan: "auto",
        sourceListRefreshInterval: 0,
        sourceReintrospectInterval: 0
      }
    ]);
  });

  describe("backward compatibility", () => {
    it("should read old host and assume http protocol", () => {
      const cluster = Cluster.fromJS({
        name: "old-host",
        host: "broker-host.com"
      } as ClusterJS);

      expect(cluster.url).to.be.eq("http://broker-host.com");
    });
  });

});
