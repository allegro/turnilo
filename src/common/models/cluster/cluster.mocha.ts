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
import { RetryOptions, RetryOptionsJS } from "../../../server/utils/retry-options/retry-options";
import { NOOP_LOGGER } from "../../logger/logger";
import { ClusterAuthJS } from "../cluster-auth/cluster-auth";
import { Cluster, ClusterJS, fromConfig } from "./cluster";

const baseConfig: ClusterJS = {
  name: "foobar",
  url: "https://foobar.com"
};

function buildCluster(options: Partial<ClusterJS> = {}): Cluster {
  return fromConfig({
    ...baseConfig,
    ...options
  }, NOOP_LOGGER);
}

use(equivalent);

describe("Cluster", () => {
  describe("fromConfig", () => {
    it("should load default values", () => {
      const cluster = buildCluster();

      expect(cluster).to.be.deep.equal({
        name: "foobar",
        guardDataCubes: false,
        healthCheckTimeout: 1000,
        introspectionStrategy: "segment-metadata-fallback",
        requestDecorator: null,
        retry: undefined,
        sourceListRefreshInterval: 0,
        sourceListRefreshOnLoad: false,
        sourceListScan: "auto",
        sourceReintrospectInterval: 0,
        sourceReintrospectOnLoad: false,
        sourceTimeBoundaryRefreshInterval: 60000,
        timeout: undefined,
        title: "",
        type: "druid",
        url: "https://foobar.com",
        version: null,
        auth: undefined
      });
    });

    it("should throw with incorrect name type", () => {
      expect(() => buildCluster({ name: 1 } as unknown as ClusterJS)).to.throw("must be a string");
    });

    it("should throw with incorrect empty name", () => {
      expect(() => buildCluster({ name: "" })).to.throw("empty name");
    });

    it("should throw with not url safe name", () => {
      expect(() => buildCluster({ name: "foobar%bazz#" })).to.throw("is not a URL safe name");
    });

    it("should throw with name equal to native", () => {
      expect(() => buildCluster({ name: "native" })).to.throw("name can not be 'native'");
    });

    it("should read auth options", () => {
      const cluster = buildCluster({
        auth: { type: "http-basic", password: "pass", username: "foobar" }
      });

      expect(cluster.auth).to.be.deep.equal({
        type: "http-basic", password: "pass", username: "foobar"
      });
    });

    it("should throw on unrecognized auth type", () => {
      expect(() => buildCluster({
        auth: { type: "unknown-method" } as any as ClusterAuthJS
      })).to.throw("Unrecognized authorization type: unknown-method");
    });

    it("should throw on missing username", () => {
      expect(() => buildCluster({
        auth: { type: "http-basic", username: undefined, password: "pass" }
      })).to.throw("username field is required");
    });

    it("should throw on missing password", () => {
      expect(() => buildCluster({
        auth: { type: "http-basic", username: "foobar", password: undefined }
      })).to.throw("password field is required");
    });

    it("should read retry options", () => {
      const cluster = buildCluster({
        retry: {
          maxAttempts: 1,
          delay: 42
        }
      });

      expect(cluster.retry).to.be.equivalent(new RetryOptions({ maxAttempts: 1, delay: 42 }));
    });

    it("should read partial retry options", () => {
      const cluster = buildCluster({
        retry: {
          delay: 42
        } as RetryOptionsJS
      });

      expect(cluster.retry).to.be.equivalent(new RetryOptions({ maxAttempts: 5, delay: 42 }));
    });

    it("should read request decorator", () => {
      const cluster = buildCluster({
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
      const cluster = buildCluster({
        requestDecorator: "foobar",
        decoratorOptions: { bazz: true }
      } as unknown as ClusterJS);

      expect(cluster.requestDecorator).to.be.equivalent(new RequestDecorator("foobar", { bazz: true }));
    });

    it("should read old host and assume http protocol", () => {
      const cluster = buildCluster({
        name: "old-host",
        // Set url to undefined, to force old format handling
        url: undefined,
        host: "broker-host.com"
      } as unknown as ClusterJS);

      expect(cluster.url).to.be.eq("http://broker-host.com");
    });

    it("should override default values", () => {
      const cluster = buildCluster({
        guardDataCubes: true,
        healthCheckTimeout: 42,
        introspectionStrategy: "introspection-introspection",
        sourceListRefreshInterval: 1123,
        sourceListRefreshOnLoad: true,
        sourceListScan: "auto",
        sourceReintrospectInterval: 1432,
        sourceReintrospectOnLoad: true,
        sourceTimeBoundaryRefreshInterval: 4242,
        timeout: 581,
        title: "foobar-title",
        version: "new-version"
      });

      expect(cluster).to.be.deep.equal({
        guardDataCubes: true,
        healthCheckTimeout: 42,
        introspectionStrategy: "introspection-introspection",
        name: "foobar",
        sourceListRefreshInterval: 1123,
        sourceListRefreshOnLoad: true,
        sourceListScan: "auto",
        sourceReintrospectInterval: 1432,
        sourceReintrospectOnLoad: true,
        sourceTimeBoundaryRefreshInterval: 4242,
        timeout: 581,
        title: "foobar-title",
        url: "https://foobar.com",
        version: "new-version",
        type: "druid",
        requestDecorator: null,
        retry: undefined,
        auth: undefined
      });
    });
  });
})
;
