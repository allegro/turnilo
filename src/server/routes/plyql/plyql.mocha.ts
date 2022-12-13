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
import mime from "mime";
import supertest from "supertest";
import { wikiSourcesWithExecutor } from "../../../common/models/sources/sources.fixtures";
import { plyqlRouter } from "./plyql";

const app = express();

app.use(bodyParser.json());

app.use("/", plyqlRouter({ getSources: () => Promise.resolve(wikiSourcesWithExecutor) }));

const pageQuery = "SELECT SUM(added) as Added FROM `wiki` GROUP BY page ORDER BY Added DESC LIMIT 10;";
const timeQuery = "SELECT TIME_BUCKET(time, 'PT1H', 'Etc/UTC') as TimeByHour, SUM(added) as Added FROM `wiki` GROUP BY 1 ORDER BY TimeByHour ASC";

interface PlyQLTestQuery {
  outputType: string;
  query: string;
  testName: string;
}

const tests: PlyQLTestQuery[] = [
  {
    outputType: "json",
    query: pageQuery,
    testName: "POST json pages added"
  },
  {
    outputType: "json",
    query: timeQuery,
    testName: "POST json timeseries"
  },
  {
    outputType: "csv",
    query: pageQuery,
    testName: "POST csv pages added"
  },
  {
    outputType: "csv",
    query: timeQuery,
    testName: "POST csv timeseries"
  },
  {
    outputType: "tsv",
    query: pageQuery,
    testName: "POST tsv pages added"
  },
  {
    outputType: "tsv",
    query: timeQuery,
    testName: "POST tsv timeseries"
  }
];

function testPlyqlHelper(testName: string, contentType: string, queryStr: string) {
  it(testName, (testComplete: any) => {
    supertest(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send(queryStr)
      .expect("Content-Type", contentType + "; charset=utf-8")
      .expect(200, testComplete);
  });
}

describe("plyql router", () => {
  tests.forEach(test => {
    testPlyqlHelper(test.testName, mime.getType(test.outputType), JSON.stringify(test, null, 2));
  });
});
