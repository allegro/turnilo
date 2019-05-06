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

import * as Rollbar from "rollbar";
import { RollbarConfig, RollbarConfigValue } from "../../../common/models/rollbar-config/rollbar-config";

var rollbar: Rollbar;

export function reportError(error: Error): string {
  if (rollbar) {
    return rollbar.error(error).uuid;
  }
  return error.name;
}

export function init(config: RollbarConfigValue) {
   rollbar = new Rollbar({
    accessToken: config.client_token,
    captureUncaught: true,
    captureUnhandledRejections: true,
    reportLevel: config.report_level || RollbarConfig.DEFAULT_REPORT_LEVEL,
    payload: {
      environment: config.environment ||  RollbarConfig.DEFAULT_ENVIRONMENT
    }
  });
}
