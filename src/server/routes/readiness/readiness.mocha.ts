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

import express from "express";
import { Express } from "express";
import * as http from "http";
import nock from "nock";
import supertest from "supertest";
import { NOOP_LOGGER } from "../../../common/logger/logger";
import { ClusterFixtures } from "../../../common/models/cluster/cluster.fixtures";
import { wikiSources, wikiTwitterSources } from "../../../common/models/sources/sources.fixtures";
import { readinessRouter } from "./readiness";

const loadStatusPath = "/druid/broker/v1/loadstatus";
const wikiBrokerNock = nock(`${ClusterFixtures.druidWikiClusterJS().url}`);
const twitterBrokerNock = nock(`${ClusterFixtures.druidTwitterClusterJS().url}`);

const mockLoadStatus = (nock: nock.Scope, fixture: { status: number, initialized: boolean, delay: number }) => {
  const { status, initialized, delay } = fixture;
  nock
    .get(loadStatusPath)
    .delay(delay)
    .reply(status, { inventoryInitialized: initialized });
};

describe("readiness router", () => {
  let app: Express;
  let server: http.Server;

  describe("single druid cluster", () => {
    before(done => {
      app = express();
      app.use("/", readinessRouter({ getSources: () => Promise.resolve(wikiSources), logger: NOOP_LOGGER }));
      server = app.listen(0, done);
    });

    after(done => {
      server.close(done);
    });

    const singleClusterTests = [
      { scenario: "healthy broker", status: 200, initialized: true, delay: 0, expectedStatus: 200 },
      { scenario: "unhealthy broker", status: 500, initialized: false, delay: 0, expectedStatus: 503 },
      { scenario: "uninitialized broker", status: 200, initialized: false, delay: 0, expectedStatus: 503 },
      { scenario: "timeout to broker", status: 200, initialized: true, delay: 200, expectedStatus: 503 }
    ];

    singleClusterTests.forEach(({ scenario, status, initialized, delay, expectedStatus }) => {
      it(`returns ${expectedStatus} with ${scenario}`, testComplete => {
        mockLoadStatus(wikiBrokerNock, { status, initialized, delay });
        supertest(app)
          .get("/")
          .expect(expectedStatus, testComplete);
      });
    });
  });

  describe("multiple druid clusters", () => {
    before(done => {
      app = express();
      app.use("/", readinessRouter({ getSources: () => Promise.resolve(wikiTwitterSources), logger: NOOP_LOGGER }));
      server = app.listen(0, done);
    });

    after(done => {
      server.close(done);
    });

    const multipleClustersTests: any[] = [
      {
        scenario: "all healthy brokers",
        wikiBroker: { status: 200, initialized: true, delay: 0 },
        twitterBroker: { status: 200, initialized: true, delay: 0 },
        expectedStatus: 200
      },
      {
        scenario: "single unhealthy broker",
        wikiBroker: { status: 500, initialized: true, delay: 0 },
        twitterBroker: { status: 200, initialized: true, delay: 0 },
        expectedStatus: 503
      },
      {
        scenario: "single uninitialized broker",
        wikiBroker: { status: 200, initialized: true, delay: 0 },
        twitterBroker: { status: 200, initialized: false, delay: 0 },
        expectedStatus: 503
      },
      {
        scenario: "timeout to single broker",
        wikiBroker: { status: 200, initialized: true, delay: 100 },
        twitterBroker: { status: 200, initialized: true, delay: 0 },
        expectedStatus: 503
      }
    ];

    multipleClustersTests.forEach(({ scenario, wikiBroker, twitterBroker, expectedStatus }) => {
      it(`returns ${expectedStatus} with ${scenario}`, testComplete => {
        mockLoadStatus(wikiBrokerNock, wikiBroker);
        mockLoadStatus(twitterBrokerNock, twitterBroker);
        supertest(app)
          .get("/")
          .expect(expectedStatus, testComplete);
      });
    });
  });
});
