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
import { $ } from "plywood";
import supertest from "supertest";
import { NOOP_LOGGER } from "../../../common/logger/logger";
import { wikiSourcesWithExecutor } from "../../../common/models/sources/sources.fixtures";
import { plywoodRouter } from "./plywood";

const settingsManagerFixture = {
  getSources: () => Promise.resolve(wikiSourcesWithExecutor),
  anchorPath: ".",
  logger: NOOP_LOGGER
};

const app = express();

app.use(bodyParser.json());

app.use("/", plywoodRouter(settingsManagerFixture));

describe("plywood router", () => {
  it("must have dataCube", (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({
        version: "0.9.4",
        expression: $("main").toJS()
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(400)
      .expect({ error: "Parameter dataCube is required" }, testComplete);
  });

  it("does a query (value)", (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({
        version: "0.9.4",
        expression: $("main").count().toJS(),
        dataCube: "wiki"
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200)
      .expect({ result: 10 }, testComplete);
  });

  it("does a query (dataset)", (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({
        version: "0.9.4",
        expression: $("main")
          .split("$channel", "Channel")
          .apply("Count", $("main").count())
          .sort("$Count", "descending")
          .limit(2)
          .toJS(),
        dataSource: "wiki" // back compat
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200)
      .expect(
        {
          result: {
            attributes: [
              {
                name: "Channel",
                type: "STRING"
              },
              {
                name: "main",
                type: "DATASET"
              },
              {
                name: "Count",
                type: "NUMBER"
              }
            ],
            data: [
              {
                Channel: "en",
                Count: 4
              },
              {
                Channel: "vi",
                Count: 4
              }
            ],
            keys: [
              "Channel"
            ]
          }
        },
        testComplete
      );
  });

});
