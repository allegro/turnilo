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

import { expect, use } from "chai";
import equivalent from "../../../client/utils/test-utils/equivalent";
import { RequestDecorator } from "../../../server/utils/request-decorator/request-decorator";
import { RetryOptions } from "../../../server/utils/retry-options/retry-options";
import { ClusterJS, fromConfig } from "./cluster";

use(equivalent);

describe("Cluster", () => {
  describe("fromConfig", () => {
    it("should load default values", () => {
      const cluster = fromConfig({
        name: "foobar",
        url: "http://bazz"
      });

      expect(cluster).to.be.deep.equal({
        name: "foobar",
        guardDataCubes: false,
        healthCheckTimeout: 1000,
        introspectionStrategy: "segment-metadata-fallback",
        requestDecorator: null,
        retry: new RetryOptions(),
        sourceListRefreshInterval: 0,
        sourceListRefreshOnLoad: false,
        sourceListScan: "auto",
        sourceReintrospectInterval: 0,
        sourceReintrospectOnLoad: false,
        sourceTimeBoundaryRefreshInterval: 60000,
        timeout: undefined,
        title: "",
        type: "druid",
        url: "http://bazz",
        version: null
      });
    });

    it("should throw with incorrect name type", () => {
      expect(() => fromConfig({ name: 1 } as unknown as ClusterJS)).to.throw("must be a string");
    });

    it("should throw with incorrect empty name", () => {
      expect(() => fromConfig({ name: "", url: "http://foobar" })).to.throw("empty name");
    });

    it("should throw with not url safe name", () => {
      expect(() => fromConfig({ name: "foobar%bazz#", url: "http://foobar" })).to.throw("is not a URL safe name");
    });

    it("should throw with name equal to native", () => {
      expect(() => fromConfig({ name: "native", url: "http://foobar" })).to.throw("name can not be 'native'");
    });

    it("should read retry options", () => {
      const cluster = fromConfig({
        name: "foobar",
        url: "http://foobar",
        retry: {
          maxAttempts: 1,
          delay: 42
        }
      });

      expect(cluster.retry).to.be.equivalent(new RetryOptions({ maxAttempts: 1, delay: 42 }));
    });

    it("should read request decorator", () => {
      const cluster = fromConfig({
        name: "foobar",
        url: "http://foobar",
        requestDecorator: {
          path: "foobar",
          options: { bazz: true }
        }
      });

      expect(cluster.requestDecorator).to.be.equivalent(new RequestDecorator("foobar", { bazz: true }));
    });

    it("should read request decorator old format", () => {
      const cluster = fromConfig({
        name: "foobar",
        url: "http://foobar",
        requestDecorator: "foobar",
        decoratorOptions: { bazz: true }
      } as unknown as ClusterJS);

      expect(cluster.requestDecorator).to.be.equivalent(new RequestDecorator("foobar", { bazz: true }));
    });

    it("should read old host and assume http protocol", () => {
      const cluster = fromConfig({
        name: "old-host",
        host: "broker-host.com"
      } as unknown as ClusterJS);

      expect(cluster.url).to.be.eq("http://broker-host.com");
    });

    it("should override default values", () => {
      const cluster = fromConfig({
        guardDataCubes: true,
        healthCheckTimeout: 42,
        introspectionStrategy: "introspection-introspection",
        name: "cluster-name",
        sourceListRefreshInterval: 1123,
        sourceListRefreshOnLoad: true,
        sourceListScan: "auto",
        sourceReintrospectInterval: 1432,
        sourceReintrospectOnLoad: true,
        sourceTimeBoundaryRefreshInterval: 4242,
        timeout: 581,
        title: "foobar-title",
        url: "http://url-bazz",
        version: "new-version"
      });

      expect(cluster).to.be.deep.equal({
        guardDataCubes: true,
        healthCheckTimeout: 42,
        introspectionStrategy: "introspection-introspection",
        name: "cluster-name",
        sourceListRefreshInterval: 1123,
        sourceListRefreshOnLoad: true,
        sourceListScan: "auto",
        sourceReintrospectInterval: 1432,
        sourceReintrospectOnLoad: true,
        sourceTimeBoundaryRefreshInterval: 4242,
        timeout: 581,
        title: "foobar-title",
        url: "http://url-bazz",
        version: "new-version",
        type: "druid",
        requestDecorator: null,
        retry: new RetryOptions()
      });
    });
  });
})
;
