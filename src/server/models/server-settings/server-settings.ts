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

import { BackCompat, BaseImmutable } from "immutable-class";
import { SettingsLocation } from "../settings-location/settings-location";

export type Iframe = "allow" | "deny";
export type TrustProxy = "none" | "always";
export type StrictTransportSecurity = "none" | "always";

export interface ServerSettingsValue {
  port?: number;
  serverHost?: string;
  serverRoot?: string;
  readinessEndpoint?: string;
  livenessEndpoint?: string;
  requestLogFormat?: string;
  pageMustLoadTimeout?: number;
  iframe?: Iframe;
  trustProxy?: TrustProxy;
  strictTransportSecurity?: StrictTransportSecurity;
  auth?: string;
  settingsLocation?: SettingsLocation;
}

export interface ServerSettingsJS extends ServerSettingsValue {
  healthEndpoint?: string;
}

export class ServerSettings extends BaseImmutable<ServerSettingsValue, ServerSettingsJS> {
  static DEFAULT_PORT = 9090;
  static DEFAULT_SERVER_ROOT = "";
  static DEFAULT_READINESS_ENDPOINT = "/health/ready";
  static DEFAULT_LIVENESS_ENDPOINT = "/health/alive";
  static DEFAULT_REQUEST_LOG_FORMAT = "common";
  static DEFAULT_PAGE_MUST_LOAD_TIMEOUT = 800;
  static IFRAME_VALUES: Iframe[] = ["allow", "deny"];
  static DEFAULT_IFRAME: Iframe = "allow";
  static TRUST_PROXY_VALUES: TrustProxy[] = ["none", "always"];
  static DEFAULT_TRUST_PROXY: TrustProxy = "none";
  static STRICT_TRANSPORT_SECURITY_VALUES: StrictTransportSecurity[] = ["none", "always"];
  static DEFAULT_STRICT_TRANSPORT_SECURITY: StrictTransportSecurity = "none";

  static fromJS(parameters: ServerSettingsJS): ServerSettings {
    if (typeof parameters.port === "string") parameters.port = parseInt(parameters.port, 10);
    return new ServerSettings(BaseImmutable.jsToValue(ServerSettings.PROPERTIES, parameters, ServerSettings.BACK_COMPATS));
  }

  // TODO, back to: static PROPERTIES: Property[] = [
  static PROPERTIES: any[] = [
    { name: "port", defaultValue: ServerSettings.DEFAULT_PORT, validate: BaseImmutable.ensure.number },
    { name: "serverHost", defaultValue: null },
    { name: "serverRoot", defaultValue: ServerSettings.DEFAULT_SERVER_ROOT },
    { name: "readinessEndpoint", defaultValue: ServerSettings.DEFAULT_READINESS_ENDPOINT },
    { name: "livenessEndpoint", defaultValue: ServerSettings.DEFAULT_LIVENESS_ENDPOINT },
    { name: "requestLogFormat", defaultValue: ServerSettings.DEFAULT_REQUEST_LOG_FORMAT },
    { name: "pageMustLoadTimeout", defaultValue: ServerSettings.DEFAULT_PAGE_MUST_LOAD_TIMEOUT },
    { name: "iframe", defaultValue: ServerSettings.DEFAULT_IFRAME, possibleValues: ServerSettings.IFRAME_VALUES },
    { name: "trustProxy", defaultValue: ServerSettings.DEFAULT_TRUST_PROXY, possibleValues: ServerSettings.TRUST_PROXY_VALUES },
    {
      name: "strictTransportSecurity",
      defaultValue: ServerSettings.DEFAULT_STRICT_TRANSPORT_SECURITY,
      possibleValues: ServerSettings.STRICT_TRANSPORT_SECURITY_VALUES
    },
    { name: "auth", defaultValue: null },
    { name: "settingsLocation", defaultValue: null, immutableClass: SettingsLocation }
  ];

  static BACK_COMPATS: BackCompat[] = [{
    condition: (settings: ServerSettingsJS) =>
      !settings.readinessEndpoint && !!settings.healthEndpoint,
    action: (settings: ServerSettingsJS) => {
      settings.readinessEndpoint = settings.healthEndpoint;
    }
  }];

  public port: number;
  public serverHost: string;
  public serverRoot: string;
  public readinessEndpoint: string;
  public livenessEndpoint: string;
  public requestLogFormat: string;
  public pageMustLoadTimeout: number;
  public iframe: Iframe;
  public trustProxy: TrustProxy;
  public strictTransportSecurity: StrictTransportSecurity;
  public auth: string;
  public settingsLocation: SettingsLocation;

  constructor(parameters: ServerSettingsValue) {
    super(parameters);
  }

  public getPort: () => number;
  public getServerHost: () => string;
  public getServerRoot: () => string;
  public getReadinessEndpoint: () => string;
  public getLivenessEndpoint: () => string;
  public getPageMustLoadTimeout: () => number;
  public getIframe: () => Iframe;
  public getTrustProxy: () => TrustProxy;
  public getStrictTransportSecurity: () => StrictTransportSecurity;
  public getSettingsLocation: () => SettingsLocation;
}

BaseImmutable.finalize(ServerSettings);
