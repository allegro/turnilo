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
import { ServerSettings } from "./server-settings";

describe("ServerSettings", () => {
  // TODO: reimplement this test as simpler cases without immutable-class-tester - it checks too much
  it.skip("is an immutable class", () => {
    testImmutableClass(ServerSettings, [
      {},
      {
        port: 9091
      },
      {
        port: 9091,
        trustProxy: "always"
      },
      {
        port: 9090,
        serverRoot: "/swivs",
        pageMustLoadTimeout: 900,
        iframe: "deny"
      },
      {
        port: 9091,
        serverRoot: "/swivs",
        pageMustLoadTimeout: 901
      },
      {
        port: 9091,
        serverHost: "10.20.30.40",
        serverRoot: "/swivs",
        readinessEndpoint: "/status/readiness",
        pageMustLoadTimeout: 901
      }
    ]);
  });

  describe("healthEndpoint backward compatibility", () => {
    it("should interpret healthEndpoint as readinessEndpoint", () => {
      const healthEndpoint = "/health";
      const settings = ServerSettings.fromJS({ healthEndpoint });
      expect(settings.readinessEndpoint).to.be.eq(healthEndpoint);
    });
  });

  describe("upgrades", () => {
    it("port", () => {
      expect(ServerSettings.fromJS({
        port: ("9090" as any),
        serverRoot: "/swivs",
        pageMustLoadTimeout: 900,
        iframe: "deny"
      }).port).to.equal(9090);
    });
  });
});
