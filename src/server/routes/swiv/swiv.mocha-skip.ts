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

import { expect } from "chai";
import * as express from "express";
import * as Q from "q";
import * as supertest from "supertest";
import { Response } from "supertest";
import { AppSettingsFixtures } from "../../../common/models/app-settings/app-settings.fixtures";
import { AppSettings } from "../../../common/models/index";
import { SwivRequest } from "../../utils/index";
import { GetSettingsOptions } from "../../utils/settings-manager/settings-manager";

import * as swivRouter from "./swiv";

var app = express();

var appSettings: AppSettings = AppSettingsFixtures.wikiOnlyWithExecutor();
app.use((req: SwivRequest, res: express.Response, next: Function) => {
  req.user = null;
  req.version = "0.9.4";
  req.getSettings = (dataCubeOfInterest?: GetSettingsOptions) => Q(appSettings);
  next();
});

app.use("/", swivRouter);

describe("swiv router", () => {
  it("does a query (value)", (testComplete: any) => {
    supertest(app)
      .get("/")
      .expect(200)
      .end((err: any, res: Response) => {
        if (err) testComplete(err);
        expect(res.text).to.contain("<!DOCTYPE html>");
        expect(res.text).to.contain('<meta name="description" content="Data Explorer">');
        testComplete();
      });
  });

});
