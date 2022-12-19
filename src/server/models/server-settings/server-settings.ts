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

import { Record } from "immutable";
import { optionalEnsureOneOf } from "../../../common/utils/general/general";
import { PluginSettings } from "../plugin-settings/plugin-settings";

export type Iframe = "allow" | "deny";
export type TrustProxy = "none" | "always";
export type StrictTransportSecurity = "none" | "always";
export type LoggerFormat = "plain" | "json" | "noop" | "error";

export interface ServerSettingsValue {
  port?: number;
  serverHost?: string;
  serverRoot?: string;
  serverTimeout?: number;
  readinessEndpoint?: string;
  livenessEndpoint?: string;
  requestLogFormat?: string;
  pageMustLoadTimeout?: number;
  verbose?: boolean;
  iframe?: Iframe;
  trustProxy?: TrustProxy;
  strictTransportSecurity?: StrictTransportSecurity;
  plugins?: PluginSettings[];
  loggerFormat?: LoggerFormat;
}

export type ServerSettingsJS = ServerSettingsValue & {
  port?: number | string;
  healthEndpoint?: string;
};

export const DEFAULT_PORT = 9090;
export const DEFAULT_SERVER_ROOT = "";
export const DEFAULT_SERVER_HOST: string = null;
const DEFAULT_READINESS_ENDPOINT = "/health/ready";
const DEFAULT_LIVENESS_ENDPOINT = "/health/alive";
const DEFAULT_SERVER_TIMEOUT = 0;
const DEFAULT_REQUEST_LOG_FORMAT = "common";
const DEFAULT_PAGE_MUST_LOAD_TIMEOUT = 800;
const IFRAME_VALUES: Iframe[] = ["allow", "deny"];
const DEFAULT_IFRAME: Iframe = "allow";
const TRUST_PROXY_VALUES: TrustProxy[] = ["none", "always"];
const DEFAULT_TRUST_PROXY: TrustProxy = "none";
const STRICT_TRANSPORT_SECURITY_VALUES: StrictTransportSecurity[] = ["none", "always"];
const DEFAULT_STRICT_TRANSPORT_SECURITY: StrictTransportSecurity = "none";
export const DEFAULT_LOGGER_FORMAT: LoggerFormat = "plain";
export const LOGGER_FORMAT_VALUES: LoggerFormat[] = ["plain", "json"];

const defaultServerSettings: ServerSettingsValue = {
  iframe: DEFAULT_IFRAME,
  livenessEndpoint: DEFAULT_LIVENESS_ENDPOINT,
  pageMustLoadTimeout: DEFAULT_PAGE_MUST_LOAD_TIMEOUT,
  plugins: [],
  port: DEFAULT_PORT,
  readinessEndpoint: DEFAULT_READINESS_ENDPOINT,
  requestLogFormat: DEFAULT_REQUEST_LOG_FORMAT,
  serverHost: DEFAULT_SERVER_HOST,
  serverRoot: DEFAULT_SERVER_ROOT,
  serverTimeout: DEFAULT_SERVER_TIMEOUT,
  strictTransportSecurity: DEFAULT_STRICT_TRANSPORT_SECURITY,
  trustProxy: DEFAULT_TRUST_PROXY,
  verbose: false,
  loggerFormat: DEFAULT_LOGGER_FORMAT
};

export class ServerSettings extends Record<ServerSettingsValue>(defaultServerSettings) {

  static fromJS(parameters: ServerSettingsJS): ServerSettings {
    const {
      iframe,
      trustProxy,
      strictTransportSecurity,
      livenessEndpoint,
      pageMustLoadTimeout,
      requestLogFormat,
      serverRoot,
      serverTimeout,
      serverHost,
      loggerFormat
    } = parameters;
    optionalEnsureOneOf(iframe, IFRAME_VALUES, "ServerSettings: iframe");
    optionalEnsureOneOf(trustProxy, TRUST_PROXY_VALUES, "ServerSettings: trustProxy");
    optionalEnsureOneOf(strictTransportSecurity, STRICT_TRANSPORT_SECURITY_VALUES, "ServerSettings: strictTransportSecurity");
    optionalEnsureOneOf(loggerFormat, LOGGER_FORMAT_VALUES, "ServerSettings: loggerFormat");

    const readinessEndpoint = !parameters.readinessEndpoint && !!parameters.healthEndpoint ? parameters.healthEndpoint : parameters.readinessEndpoint;
    const verbose = Boolean(parameters.verbose);
    const plugins = parameters.plugins && parameters.plugins.map(pluginDefinition => PluginSettings.fromJS(pluginDefinition));

    return new ServerSettings({
      port: typeof parameters.port === "string" ? parseInt(parameters.port, 10) : parameters.port,
      loggerFormat,
      plugins,
      readinessEndpoint,
      livenessEndpoint,
      verbose,
      iframe,
      trustProxy,
      strictTransportSecurity,
      pageMustLoadTimeout,
      requestLogFormat,
      serverHost,
      serverTimeout,
      serverRoot
    });
  }
}
