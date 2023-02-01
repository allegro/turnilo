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

import bodyParser from "body-parser";
import { expect } from "chai";
import express from "express";
import supertest, { Response } from "supertest";
import { NOOP_LOGGER } from "../../../common/logger/logger";
import { appSettings } from "../../../common/models/app-settings/app-settings.fixtures";
import { wikiSourcesWithExecutor } from "../../../common/models/sources/sources.fixtures";
import { TimekeeperFixtures } from "../../../common/models/timekeeper/timekeeper.fixtures";
import { total } from "../../../common/view-definitions/version-4/view-definition-4.fixture";
import { queryRouter } from "./query";

const settingsManagerFixture = {
  getSources: () => Promise.resolve(wikiSourcesWithExecutor),
  anchorPath: ".",
  logger: NOOP_LOGGER,
  getTimekeeper: () => TimekeeperFixtures.wiki(),
  appSettings
};

const app = express();

app.use(bodyParser.json());

app.use("/", queryRouter(settingsManagerFixture));

describe("query router", () => {
  it("should require dataCube", (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({})
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(400)
      .expect({ error: "must have a dataCube" })
      .end(testComplete);
  });

  it("should validate viewDefinition", (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({ dataCube: "wiki" })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(400)
      .expect({ error: "viewDefinition must be an object" })
      .end(testComplete);
  });

  it("should require viewDefinitionVersion", (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({ dataCube: "wiki", viewDefinition: {} })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(400)
      .expect({ error: "must have a viewDefinitionVersion" })
      .end(testComplete);
  });

  it("should validate viewDefinitionVersion", (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({ dataCube: "wiki", viewDefinition: {}, viewDefinitionVersion: "foobar" })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(400)
      .expect({ error: "unsupported viewDefinitionVersion value" })
      .end(testComplete);
  });

  it("should execute query", (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({
        dataCube: "wiki",
        viewDefinitionVersion: "4",
        viewDefinition: total
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200)
      .expect((res: Response) => {
        expect(res.body.result.data[0]).to.include({ added: 591, count: 10 });
      })
      .end(testComplete);
  });
});
