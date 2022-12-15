/*
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

import { Request, Response, Router } from "express";
import * as request from "request-promise-native";
import { errorToMessage } from "../../../common/logger/logger";
import { UrlShortenerContext } from "../../../common/models/url-shortener/url-shortener";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";

export function shortenRouter(settings: Pick<SettingsManager, "appSettings" | "logger">, isTrustedProxy: boolean) {
  const logger = settings.logger;

  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    const { url } = req.query;
    try {
      const shortener = settings.appSettings.customization.urlShortener;
      const context: UrlShortenerContext = {
        // If trust proxy is not enabled, app is understood as directly facing the internet
        clientIp: isTrustedProxy ? req.ip : req.connection.remoteAddress
      };
      const shortUrl = await shortener(request, url as string, context);
      res.json({ shortUrl });
    } catch (error) {
      logger.error(errorToMessage(error));

      res.status(500).send({
        error: "could not shorten url",
        message: error.message
      });
    }
  });
  return router;
}
