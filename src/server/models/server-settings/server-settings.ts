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

import { PluginSettings } from "../plugin-settings/plugin-settings";

export type Iframe = "allow" | "deny";
export type TrustProxy = "none" | "always";
export type StrictTransportSecurity = "none" | "always";

export type ServerSettings = Readonly<ServerSettingsBase>;

export interface ServerSettingsBase {
  port: number;
  serverHost?: string;
  serverRoot: string;
  serverTimeout: number;
  readinessEndpoint: string;
  livenessEndpoint: string;
  requestLogFormat: string;
  pageMustLoadTimeout: number;
  verbose: boolean;
  iframe: Iframe;
  trustProxy: TrustProxy;
  strictTransportSecurity: StrictTransportSecurity;
  plugins: PluginSettings[];
}

interface LegacyServerSettings {
  healthEndpoint?: string;
}

export const DEFAULT_PORT = 9090;
export const DEFAULT_SERVER_ROOT = "";
const DEFAULT_READINESS_ENDPOINT = "/health/ready";
const DEFAULT_LIVENESS_ENDPOINT = "/health/alive";
const DEFAULT_SERVER_TIMEOUT = 0;
const DEFAULT_REQUEST_LOG_FORMAT = "common";
const DEFAULT_PAGE_MUST_LOAD_TIMEOUT = 800;
// TODO: After upgrading to Typescript 3.4 we can write `as const` and typescript understands constant assertion
const IFRAME_VALUES: Set<Iframe> = new Set(["allow", "deny"] as Iframe[]);
const DEFAULT_IFRAME: Iframe = "allow";
const TRUST_PROXY_VALUES: Set<TrustProxy> = new Set(["none", "always"] as TrustProxy[]);
const DEFAULT_TRUST_PROXY: TrustProxy = "none";
const STRICT_TRANSPORT_SECURITY_VALUES: Set<StrictTransportSecurity> = new Set(["none", "always"] as StrictTransportSecurity[]);
const DEFAULT_STRICT_TRANSPORT_SECURITY: StrictTransportSecurity = "none";

function oneOf<T>(value: T, values: Set<T>): value is T {
  return values.has(value);
}

export function readServerSettings(parameters: Partial<ServerSettingsBase> & LegacyServerSettings): ServerSettings {
  const port = typeof parameters.port === "string" ? parseInt(parameters.port, 10) : (parameters.port || DEFAULT_PORT);
  const serverHost = parameters.serverHost;
  const serverRoot = parameters.serverRoot || DEFAULT_SERVER_ROOT;
  const serverTimeout = parameters.serverTimeout || DEFAULT_SERVER_TIMEOUT;
  const readinessEndpoint = parameters.readinessEndpoint || parameters.healthEndpoint || DEFAULT_READINESS_ENDPOINT;
  const livenessEndpoint = parameters.livenessEndpoint || DEFAULT_LIVENESS_ENDPOINT;
  const requestLogFormat = parameters.requestLogFormat || DEFAULT_REQUEST_LOG_FORMAT;
  const pageMustLoadTimeout = parameters.pageMustLoadTimeout === undefined ?  DEFAULT_PAGE_MUST_LOAD_TIMEOUT : parameters.pageMustLoadTimeout;
  const verbose = !!parameters.verbose;
  const iframe = oneOf(parameters.iframe, IFRAME_VALUES) ? parameters.iframe : DEFAULT_IFRAME;
  const trustProxy = oneOf(parameters.trustProxy, TRUST_PROXY_VALUES) ? parameters.trustProxy : DEFAULT_TRUST_PROXY;
  const strictTransportSecurity = oneOf(parameters.strictTransportSecurity, STRICT_TRANSPORT_SECURITY_VALUES) ? parameters.strictTransportSecurity : DEFAULT_STRICT_TRANSPORT_SECURITY;
  const plugins = Array.isArray(parameters.plugins) ? parameters.plugins.map(p => PluginSettings.fromJS(p)) : [];

  return {
    port,
    serverHost,
    serverRoot,
    serverTimeout,
    readinessEndpoint,
    livenessEndpoint,
    requestLogFormat,
    pageMustLoadTimeout,
    verbose,
    iframe,
    trustProxy,
    strictTransportSecurity,
    plugins
  };
}
