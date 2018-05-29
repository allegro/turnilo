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

import { Response, Router } from "express";
import { MANIFESTS } from "../../../common/manifests/index";
import { AppSettings } from "../../../common/models/index";
import { SETTINGS_MANAGER } from "../../config";
import { SwivRequest } from "../../utils/index";

var router = Router();

router.get("/", (req: SwivRequest, res: Response) => {
  SETTINGS_MANAGER.getSettings()
    .then(
      appSettings => {
        res.send({ appSettings });
      },
      (e: Error) => {
        console.log("error:", e.message);
        if (e.hasOwnProperty("stack")) {
          console.log((<any> e).stack);
        }
        res.status(500).send({
          error: "could not compute",
          message: e.message
        });
      }
    )
    .done();

});

router.post("/", (req: SwivRequest, res: Response) => {
  var { appSettings } = req.body;

  try {
    var appSettingsObject = AppSettings.fromJS(appSettings, { visualizations: MANIFESTS });
  } catch (e) {
    res.status(400).send({
      error: "bad settings",
      message: e.message
    });
    return;
  }

  SETTINGS_MANAGER.updateSettings(appSettingsObject)
    .then(
      () => {
        res.send({ status: "ok" });
      },
      (e: Error) => {
        console.log("error:", e.message);
        if (e.hasOwnProperty("stack")) {
          console.log((<any> e).stack);
        }
        res.status(500).send({
          error: "could not compute",
          message: e.message
        });
      }
    )
    .done();

});

export = router;
