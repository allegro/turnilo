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

import * as bodyParser from "body-parser";
import express from "express";
import supertest from "supertest";
import { NOOP_LOGGER } from "../../../common/logger/logger";
import { appSettings } from "../../../common/models/app-settings/app-settings.fixtures";
import { wikiSourcesWithExecutor } from "../../../common/models/sources/sources.fixtures";
import { UrlHashConverterFixtures } from "../../../common/utils/url-hash-converter/url-hash-converter.fixtures";
import {
  ViewDefinitionConverter2Fixtures
} from "../../../common/view-definitions/version-2/view-definition-converter-2.fixtures";
import { mkurlRouter } from "./mkurl";

const app = express();

app.use(bodyParser.json());

app.use("/", mkurlRouter({
  appSettings,
  getSources: () => Promise.resolve(wikiSourcesWithExecutor),
  logger: NOOP_LOGGER
}));

describe("mkurl router", () => {
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

  it("gets a simple url back", (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({
        dataCubeName: "wiki",
        viewDefinitionVersion: "2",
        viewDefinition: ViewDefinitionConverter2Fixtures.totals()
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200)
      .expect(
        {
          hash: "#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0408SqGOAygKZobYDmZe2MCClGALZNkOJvhABRNAGMA9" +
            "AFUAKgGEKIAGYQEaJgCcuAbVBoAngAdxBIeMp6mGiTfU2ASnA5MjoKCT1oJACYABgBGAFYAWmCATkjQwKVg4Lxk1OCAOmT" +
            "ggC11JmwAEyCwqNj4gGYklLTkrOS8gF8AXRbKKHMkNCNm9v0IL3xjEHsNfQKZKxAZTBhsAMoNTD1BdHwTCynChzheBfBEG" +
            "CmQRoFNiWE4WHsT3pBzCGxsJkKAEQhhbCgsL6G7h6eLwYywCBBmcwCjSAA"
        },
        testComplete
      );
  });

  it("gets a complex url back", (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({
        dataCubeName: "wiki",
        viewDefinitionVersion: "2",
        viewDefinition: ViewDefinitionConverter2Fixtures.fullTable()
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200)
      .expect(
        {
          hash: "#wiki/" + UrlHashConverterFixtures.tableHashVersion4()
        },
        testComplete
      );
  });
});
