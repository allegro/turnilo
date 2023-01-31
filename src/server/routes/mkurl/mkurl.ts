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

import { Request, Response, Router } from "express";
import { errorToMessage } from "../../../common/logger/logger";
import { urlHashConverter } from "../../../common/utils/url-hash-converter/url-hash-converter";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";
import {
  createEssence,
  isValidationError,
  parseDataCube,
  parseViewDefinition,
  parseViewDefinitionConverter
} from "../../utils/validation/validators";

export function mkurlRouter(settings: Pick<SettingsManager, "getSources" | "appSettings" | "logger">) {

  const router = Router();

  router.post("/", async (req: Request, res: Response) => {

    try {
      const dataCube = await parseDataCube(req, settings.getSources);
      const viewDefinition = parseViewDefinition(req);
      const converter = parseViewDefinitionConverter(req);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);

      const hash = `#${dataCube.name}/${urlHashConverter.toHash(essence)}`;
      res.json({ hash });
    } catch (error) {
      if (isValidationError(error)) {
        res.status(error.code).send({ error: error.message });
        return;
      }

      settings.logger.error(errorToMessage(error));

      res.status(500).send({
        error: "could not compute",
        message: error.message
      });
    }
  });
  return router;
}
