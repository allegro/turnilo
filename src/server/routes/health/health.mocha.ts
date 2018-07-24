/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as express from "express";
import { Express, RequestHandler, Response } from "express";
import * as http from "http";
import * as nock from "nock";
import * as Q from "q";
import * as supertest from "supertest";
import { AppSettings } from "../../../common/models";
import { AppSettingsFixtures } from "../../../common/models/app-settings/app-settings.fixtures";
import { ClusterFixtures } from "../../../common/models/cluster/cluster.fixtures";
import { SwivRequest } from "../../utils";
import { GetSettingsOptions } from "../../utils/settings-manager/settings-manager";
import * as healthRouter from "./health";

const appSettingsHandlerProvider = (appSettings: AppSettings): RequestHandler => {
  return (req: SwivRequest, res: Response, next: Function) => {
    req.user = null;
    req.version = "0.9.4";
    req.getSettings = (dataCubeOfInterest?: GetSettingsOptions) => Q(appSettings);
    next();
  };
};

const mockLoadStatus = (nock: nock.Scope, fixture: { status: int, initialized: boolean, delay: int }) => {
  const { status, initialized, delay } = fixture;
  nock
    .get(loadStatusPath)
    .delay(delay)
    .reply(status, { inventoryInitialized: initialized });
};

const appSettings = AppSettingsFixtures.wikiOnly();
const loadStatusPath = "/druid/broker/v1/loadstatus";
const wikiBrokerNock = nock(`http://${ClusterFixtures.druidWikiClusterJS().host}`);
const twitterBrokerNock = nock(`http://${ClusterFixtures.druidTwitterClusterJS().host}`);

describe("health router", () => {
  let app: Express;
  let server: http.Server;

  describe("single druid cluster", () => {
    before(done => {
      app = express();
      app.use(appSettingsHandlerProvider(appSettings));
      app.use("/", healthRouter);
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
      app.use(appSettingsHandlerProvider(AppSettingsFixtures.wikiTwitter()));
      app.use("/", healthRouter);
      server = app.listen(0, done);
    });

    after(done => {
      server.close(done);
    });

    const multipleClustersTests = [
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
