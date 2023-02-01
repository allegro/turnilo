/*
 * Copyright 2017-2022 Allegro.pl
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

import { Response } from "express";
import { errorToMessage, Logger } from "../../../common/logger/logger";
import { isAccessDeniedError, isInvalidRequestError } from "./request-errors";

export function handleRequestErrors(error: Error, res: Response, logger: Logger): void {
  if (isInvalidRequestError(error)) {
    res.status(error.code).send({ error: error.message });
    return;
  }

  if (isAccessDeniedError(error)) {
    res.status(error.code).send({ error: error.message });
    return;
  }

  logger.error(errorToMessage(error));

  res.status(500).send({
    error: "Unexpected error",
    message: error.message
  });
}
