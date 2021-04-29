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
import { Customization, CustomizationJS } from "../customization/customization";
import { deserialize as oauthDeserialize, fromConfig as oauthFromConfig, Oauth, OauthJS, serialize as oauthSerialize, SerializedOauth } from "../oauth/oauth";

const DEFAULT_CLIENT_TIMEOUT = 0;

export interface AppSettings {
  readonly version: number;
  readonly clientTimeout: number;
  readonly customization: Customization;
  readonly oauth?: Oauth;
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
  readonly customization: CustomizationJS; // SerializedCustomization
  readonly oauth: SerializedOauth;
}

export function fromConfig(config: AppSettingsJS): AppSettings {
  const clientTimeout = config.clientTimeout === undefined ? DEFAULT_CLIENT_TIMEOUT : config.clientTimeout;
  const version = config.version || 0;
  const customization = Customization.fromJS(config.customization || {});
  const oauth = oauthFromConfig(config.oauth);

  // make part of Customization server side smart constructor
  customization.validate();

  return {
    clientTimeout,
    version,
    customization,
    oauth
  };
}

export const EMPTY_APP_SETTINGS = fromConfig({});

export function serialize({ oauth, clientTimeout, customization, version }: AppSettings): SerializedAppSettings {
  return {
    clientTimeout,
    version,
    customization: customization.toJS(),
    oauth: oauthSerialize(oauth)
  };
}

export function deserialize({ oauth, clientTimeout, customization, version }: SerializedAppSettings): AppSettings {
  return {
    clientTimeout,
    version,
    customization: Customization.fromJS(customization),
    oauth: oauthDeserialize(oauth)
  };
}

export interface AppSettingsContext {
  executorFactory?: (dataCubeName: string) => Executor;
}
