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

import { Response, Router } from "express";
import * as request from "request-promise-native";
import { SwivRequest } from "../../utils/general/general";

let router = Router();

router.get("/", (req: SwivRequest, res: Response) => {
  const { url } = req.query;
  req.getSettings()
    .then(settings => settings.customization.urlShortener)
    .then(shortener => shortener.shortenerFunction(url, request))
    .then(shortUrl => res.json({ shortUrl }))
    .catch(error => {
      console.log("error:", error.message);
      if (error.hasOwnProperty("stack")) {
        console.log((<any> error).stack);
      }
      res.status(500).send({
        error: "could not shorten url",
        message: error.message
      });
    });
});

export = router;
