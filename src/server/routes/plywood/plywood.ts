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

import { Timezone } from "chronoshift";
import { Response, Router } from "express";
import { Dataset, Expression, PlywoodValue } from "plywood";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { SwivRequest } from "../../utils/general/general";
import { GetSettingsOptions } from "../../utils/settings-manager/settings-manager";

let router = Router();

router.post("/", (req: SwivRequest, res: Response) => {
  const { dataSource, expression, timezone } = req.body;
  const dataCube = req.body.dataCube || dataSource; // back compat

  if (typeof dataCube !== "string") {
    res.status(400).send({
      error: "must have a dataCube"
    });
    return;
  }

  let queryTimezone: Timezone = null;
  if (typeof timezone === "string") {
    try {
      queryTimezone = Timezone.fromJS(timezone);
    } catch (e) {
      res.status(400).send({
        error: "bad timezone",
        message: e.message
      });
      return;
    }
  }

  let ex: Expression = null;
  try {
    ex = Expression.fromJS(expression);
  } catch (e) {
    res.status(400).send({
      error: "bad expression",
      message: e.message
    });
    return;
  }

  req.getSettings(<GetSettingsOptions> { dataCubeOfInterest: dataCube }) // later: , settingsVersion)
    .then((appSettings: AppSettings) => {
      // var settingsBehind = false;
      // if (appSettings.getVersion() < settingsVersion) {
      //   settingsBehind = true;
      // }
      const myDataCube = appSettings.getDataCube(dataCube);
      if (!myDataCube) {
        res.status(400).send({ error: "unknown data cube" });
        return null;
      }

      if (!myDataCube.executor) {
        res.status(400).send({ error: "un queryable data cube" });
        return null;
      }

      // "native" clusters are not defined, maybe they should be defined as some stub object
      if (myDataCube.cluster) {
        req.setTimeout(myDataCube.cluster.getTimeout(), null);
      }
      const maxQueries = myDataCube.getMaxQueries();
      return myDataCube.executor(ex, { maxQueries, timezone: queryTimezone }).then(
        (data: PlywoodValue) => {
          const reply: any = {
            result: Dataset.isDataset(data) ? data.toJS() : data
          };
          // if (settingsBehind) reply.action = 'update';
          res.json(reply);
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
      );
    });

});

export = router;
