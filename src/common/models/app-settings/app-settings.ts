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

import { Executor } from "plywood";
import { Logger } from "../../logger/logger";
import {
  ClientCustomization,
  Customization,
  CustomizationJS,
  fromConfig as customizationFromConfig,
  serialize as serializeCustomization,
  SerializedCustomization
} from "../customization/customization";
import {
  fromConfig as oauthFromConfig,
  Oauth,
  OauthJS,
  serialize as serializeOauth,
  SerializedOauth
} from "../oauth/oauth";

const DEFAULT_CLIENT_TIMEOUT = 0;

export interface AppSettings {
  readonly version: number;
  readonly clientTimeout: number;
  readonly customization: Customization;
  readonly oauth: Oauth;
}

export interface AppSettingsJS {
  version?: number;
  clientTimeout?: number;
  customization?: CustomizationJS;
  oauth?: OauthJS;
}

export interface SerializedAppSettings {
  readonly version: number;
  readonly clientTimeout: number;
  readonly customization: SerializedCustomization;
  readonly oauth: SerializedOauth;
}

export interface ClientAppSettings {
  readonly version: number;
  readonly clientTimeout: number;
  readonly customization: ClientCustomization;
  readonly oauth: Oauth;
}

export function fromConfig(config: AppSettingsJS, logger: Logger): AppSettings {
  const clientTimeout = config.clientTimeout === undefined ? DEFAULT_CLIENT_TIMEOUT : config.clientTimeout;
  const version = config.version || 0;
  const customization = customizationFromConfig(config.customization, logger);
  const oauth = oauthFromConfig(config.oauth);

  return {
    clientTimeout,
    version,
    customization,
    oauth
  };
}

export const emptySettings = (logger: Logger) => fromConfig({}, logger);

export function serialize({ oauth, clientTimeout, customization, version }: AppSettings): SerializedAppSettings {
  return {
    clientTimeout,
    version,
    customization: serializeCustomization(customization),
    oauth: serializeOauth(oauth)
  };
}

export interface AppSettingsContext {
  executorFactory?: (dataCubeName: string) => Executor;
}
