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

import * as bodyParser from "body-parser";
import * as express from "express";
import { Response } from "express";
import { $ } from "plywood";
import * as Q from "q";
import * as supertest from "supertest";
import { AppSettingsFixtures } from "../../../common/models/app-settings/app-settings.fixtures";
import { AppSettings } from "../../../common/models/index";
import { UrlHashConverterFixtures } from "../../../common/utils/url-hash-converter/url-hash-converter.fixtures";
import { SwivRequest } from "../../utils/index";
import { GetSettingsOptions } from "../../utils/settings-manager/settings-manager";

import * as mkurlRouter from "./mkurl";

var app = express();

app.use(bodyParser.json());

var appSettings: AppSettings = AppSettingsFixtures.wikiOnlyWithExecutor();
app.use((req: SwivRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = "0.9.4";
  req.getSettings = (dataCubeOfInterest?: GetSettingsOptions) => Q(appSettings);
  next();
});

const mkurlPath = "/mkurl";
app.use(mkurlPath, mkurlRouter);

describe("mkurl router", () => {
  it("gets a simple url back", (testComplete: any) => {
    supertest(app)
      .post(mkurlPath)
      .set("Content-Type", "application/json")
      .send({
        dataCubeName: "wiki",
        viewDefinitionVersion: "2",
        viewDefinition: {
          visualization: "totals",
          timezone: "Etc/UTC",
          filter: {
            op: "literal",
            value: true
          },
          pinnedDimensions: [],
          singleMeasure: "count",
          selectedMeasures: [],
          splits: []
        }
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200)
      .expect(
        {
          hash: "#wiki/3/N4IgbglgzgrghgGwgLzgFwgewHYgFwhqZqJQgA0hEAtgKbI634gCiaAxgPQCqAKgMIUQAMwgI0tAE5k8AbQC6l" +
          "KAAckaGQsp04sSbRmhoAWRjiI+YaVpKI2AOYImBdphjY0Q6qYz4FAX0plW2xaABMAERpabCgsGN9FECDsENCAZUxJD2dXdyFHO2jQ/GxTBEoACwg7CqQa7NKEBD8gA"
        },
        testComplete
      );
  });

  it("gets a complex url back", (testComplete: any) => {
    supertest(app)
      .post(mkurlPath)
      .set("Content-Type", "application/json")
      .send({
        dataCubeName: "wiki",
        viewDefinitionVersion: "2",
        viewDefinition: {
          visualization: "table",
          timezone: "Etc/UTC",
          filter:
            $("time")
              .overlap(new Date("2015-09-12Z"), new Date("2015-09-13Z"))
              .and($("channel").overlap(["en"]))
              .and($("isRobot").overlap([true]).not())
              .and($("page").contains("Jeremy"))
              .and($("userChars").match("^A$"))
              .and($("commentLength").overlap([{ start: 3, end: null, type: "NUMBER_RANGE" }]))
              .toJS(),
          pinnedDimensions: ["channel", "namespace", "isRobot"],
          pinnedSort: "delta",
          singleMeasure: "delta",
          selectedMeasures: ["count", "added"],
          multiMeasureMode: true,
          splits: [
            {
              expression: {
                op: "ref",
                name: "channel"
              },
              sortAction: {
                op: "sort",
                expression: {
                  op: "ref",
                  name: "delta"
                },
                direction: "descending"
              },
              limitAction: {
                op: "limit",
                value: 50
              }
            },
            {
              expression: {
                op: "ref",
                name: "isRobot"
              },
              sortAction: {
                op: "sort",
                expression: {
                  op: "ref",
                  name: "delta"
                },
                direction: "descending"
              },
              limitAction: {
                op: "limit",
                value: 5
              }
            },
            {
              expression: {
                op: "ref",
                name: "commentLength"
              },
              bucketAction: {
                op: "numberBucket",
                size: 10,
                offset: 0
              },
              sortAction: {
                op: "sort",
                expression: {
                  op: "ref",
                  name: "delta"
                },
                direction: "descending"
              },
              limitAction: {
                op: "limit",
                value: 5
              }
            },
            {
              expression: {
                op: "ref",
                name: "time"
              },
              bucketAction: {
                op: "timeBucket",
                duration: "PT1H"
              },
              sortAction: {
                op: "sort",
                expression: {
                  op: "ref",
                  name: "delta"
                },
                direction: "descending"
              }
            }

          ]
        }
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200)
      .expect(
        {
          hash: "#wiki/" + UrlHashConverterFixtures.tableHashVersion3()
        },
        testComplete
      );
  });

});
