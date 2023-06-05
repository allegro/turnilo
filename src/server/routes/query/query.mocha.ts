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
import express, { Response } from "express";
import supertest from "supertest";
import { getLogger } from "../../../common/logger/logger";
import { appSettings } from "../../../common/models/app-settings/app-settings.fixtures";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { stringContains } from "../../../common/models/filter-clause/filter-clause.fixtures";
import { wikiSourcesWithExecutor } from "../../../common/models/sources/sources.fixtures";
import { Split } from "../../../common/models/split/split";
import { stringSplitCombine } from "../../../common/models/split/split.fixtures";
import { TimekeeperFixtures } from "../../../common/models/timekeeper/timekeeper.fixtures";
import { Fn, isNil } from "../../../common/utils/general/general";
import { filterDefinitionConverter } from "../../../common/view-definitions/version-4/filter-definition";
import { splitConverter } from "../../../common/view-definitions/version-4/split-definition";
import { total } from "../../../common/view-definitions/version-4/view-definition-4.fixture";
import { queryRouter, QueryRouterRequest } from "./query";

const settingsManagerFixture = {
  getSources: () => Promise.resolve(wikiSourcesWithExecutor),
  anchorPath: ".",
  logger: getLogger("error"),
  getTimekeeper: () => TimekeeperFixtures.wiki(),
  appSettings
};

const serializeSplit = (split: Split) => splitConverter.fromSplitCombine(split);
const serializeClause = (clause: FilterClause) => filterDefinitionConverter.fromFilterClause(clause);

const app = express();

app.use(bodyParser.json());

app.use((req: any, res, next) => {
  req.turniloMetadata = {
    loggerContext: {}
  };
  next();
});

app.use("/", queryRouter(settingsManagerFixture));

describe("query router", () => {
  describe("QueryRouterRequest", () => {
    it("should require dataCube", (testComplete: any) => {
      supertest(app)
        .post("/")
        .set("Content-Type", "application/json")
        .send({})
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400)
        .expect({ error: "Parameter dataCube is required" })
        .end(testComplete);
    });

    it("should validate viewDefinition", (testComplete: any) => {
      supertest(app)
        .post("/")
        .set("Content-Type", "application/json")
        .send({ dataCube: "wiki" })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400)
        .expect({ error: "Parameter viewDefinition is required" })
        .end(testComplete);
    });

    it("should create context", (testComplete: Fn) => {
      const withMiddleware = express()
        .use(bodyParser.json())
        .use("/", queryRouter(settingsManagerFixture))
        .use((req: QueryRouterRequest, res: Response) => {
          const { essence, dataCube, timekeeper, decorator } = req.context;
          res.status(200).send({
            essence: !isNil(essence),
            dataCube: !isNil(dataCube),
            decorator: !isNil(decorator),
            timekeeper: !isNil(timekeeper)
          });
        });

      supertest(withMiddleware)
        .post("/")
        .set("Content-Type", "application/json")
        .send({ dataCube: "wiki", viewDefinition: total })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200)
        .expect((res: supertest.Response) => {
          expect(res.body).to.have.property("decorator");
          expect(res.body).to.have.property("essence");
          expect(res.body).to.have.property("dataCube");
          expect(res.body).to.have.property("timekeeper");
        })
        .end(testComplete);
    });
  });

  describe("visualization endpoint", () => {
    it("should return 200 for valid parameters", (testComplete: any) => {
      supertest(app)
        .post("/visualization")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200)
        .end(testComplete);
    });
  });

  describe("raw data endpoint", () => {
    it("should return 200 for valid parameters", (testComplete: any) => {
      supertest(app)
        .post("/raw-data")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200)
        .end(testComplete);
    });
  });

  describe("pinboard endpoint", () => {
    it("should validate split", (testComplete: any) => {
      supertest(app)
        .post("/pinboard")
        .set("Content-Type", "application/json")
        .send({ dataCube: "wiki", viewDefinition: total })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400)
        .expect({ error: "Parameter split is required" })
        .end(testComplete);
    });

    it("should fail with faulty split definition", (testComplete: any) => {
      supertest(app)
        .post("/pinboard")
        .set("Content-Type", "application/json")
        // NOTE: weird TS error without `any`, like "split" was some kind of keyword
        .send({
          dataCube: "wiki",
          viewDefinition: total,
          split: true
        } as any)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400)
        .expect({ error: "Dimension undefined not found in data cube wiki." })
        .end(testComplete);
    });

    it("should return 200 for valid parameters", (testComplete: any) => {
      const split = serializeSplit(stringSplitCombine("channel", { sort: { reference: "count" } }));

      supertest(app)
        .post("/pinboard")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total,
          split
        } as any)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200)
        .end(testComplete);
    });
  });

  describe("boolean filter endpoint", () => {
    it("should validate dimension", (testComplete: any) => {
      supertest(app)
        .post("/boolean-filter")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400)
        .expect({ error: "Parameter dimension is required" })
        .end(testComplete);
    });

    it("should validate non-existent dimension", (testComplete: any) => {
      supertest(app)
        .post("/boolean-filter")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total,
          dimension: "foobar"
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400)
        .expect({ error: "Unknown dimension: foobar" })
        .end(testComplete);
    });

    it("should return 200 for valid parameters", (testComplete: any) => {
      supertest(app)
        .post("/boolean-filter")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total,
          dimension: "isRobot"
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200)
        .end(testComplete);
    });
  });

  describe("number-filter endpoint", () => {
    it("should validate dimension", (testComplete: any) => {
      supertest(app)
        .post("/number-filter")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400)
        .expect({ error: "Parameter dimension is required" })
        .end(testComplete);
    });

    it("should validate non-existent dimension", (testComplete: any) => {
      supertest(app)
        .post("/number-filter")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total,
          dimension: "foobar"
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400)
        .expect({ error: "Unknown dimension: foobar" })
        .end(testComplete);
    });

    it("should return 200 for valid parameters", (testComplete: any) => {
      supertest(app)
        .post("/number-filter")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total,
          dimension: "commentLength"
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200)
        .end(testComplete);
    });
  });

  describe("string-filter endpoint", () => {

    it("should validate clause", (testComplete: any) => {
      supertest(app)
        .post("/string-filter")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400)
        .expect({ error: "Parameter clause is required" })
        .end(testComplete);
    });

    it("should validate incorrect clause", (testComplete: any) => {
      supertest(app)
        .post("/string-filter")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total,
          clause: "foobar"
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(400)
        .expect({ error: "Dimension name cannot be empty." })
        .end(testComplete);
    });

    it("should return 200 for valid parameters", (testComplete: any) => {
      const clause = serializeClause(stringContains("channel", "e"));
      supertest(app)
        .post("/string-filter")
        .set("Content-Type", "application/json")
        .send({
          dataCube: "wiki",
          viewDefinition: total,
          clause
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200)
        .end(testComplete);
    });
  });
});
