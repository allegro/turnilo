/*
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
import * as Q from "q";
import * as supertest from "supertest";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { AppSettingsFixtures } from "../../../common/models/app-settings/app-settings.fixtures";
import { Customization } from "../../../common/models/customization/customization";
import { FailUrlShortenerJS, SuccessUrlShortenerJS } from "../../../common/models/url-shortener/url-shortener.fixtures";
import { SwivRequest } from "../../utils/general/general";
import { GetSettingsOptions } from "../../utils/settings-manager/settings-manager";
import * as shortenRoute from "./shorten";

let getSettings: (opts?: GetSettingsOptions) => Q.Promise<AppSettings>;
let app = express();

app.use(bodyParser.json());

const appSettings = AppSettingsFixtures.wikiOnly();

app.use((req: SwivRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = "0.9.4";
  req.getSettings = getSettings;
  next();
});

const shortenPath = "/shorten";
app.use(shortenPath, shortenRoute);

describe("url shortener", () => {
  it("shortens url", (testComplete: any) => {
    const appSettingsWithSuccessShortener = appSettings
      .changeCustomization(Customization.fromJS({
        urlShortener: SuccessUrlShortenerJS
      }));

    getSettings = () => Q(appSettingsWithSuccessShortener);

    supertest(app)
      .get(shortenPath)
      .set("Content-Type", "application/json")
      .send({ url: "http://foobar.com?bazz=quvx" })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200)
      .expect({ shortUrl: "http://foobar" }, testComplete);
  });

  it("should return error if shortener fails", (testComplete: any) => {
    const appSettingsWithFailingShortener = appSettings
      .changeCustomization(Customization.fromJS({
        urlShortener: FailUrlShortenerJS
      }));

    getSettings = () => Q(appSettingsWithFailingShortener);

    supertest(app)
      .get(shortenPath)
      .set("Content-Type", "application/json")
      .send({ url: "http://foobar.com?bazz=quvx" })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(500)
      .expect({ error: "could not shorten url", message: "error message" }, testComplete);
  });
});
