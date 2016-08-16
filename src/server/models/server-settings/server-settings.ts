/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { BaseImmutable, Property, isInstanceOf } from 'immutable-class';
import { SettingsLocation, SettingsLocationJS } from '../settings-location/settings-location';

export type Iframe = "allow" | "deny";
export type TrustProxy = "none" | "always";
export type StrictTransportSecurity = "none" | "always";

export interface ServerSettingsValue {
  port?: number;
  serverHost?: string;
  serverRoot?: string;
  requestLogFormat?: string;
  trackingUrl?: string;
  trackingContext?: Lookup<string>;
  pageMustLoadTimeout?: number;
  iframe?: Iframe;
  trustProxy?: TrustProxy;
  strictTransportSecurity?: StrictTransportSecurity;
  auth?: string;
  settingsLocation?: SettingsLocation;
}

export type ServerSettingsJS = ServerSettingsValue;

function ensureOneOfOrNull<T>(name: string, thing: T, things: T[]): void {
  if (thing == null) return;
  if (things.indexOf(thing) === -1) {
    throw new Error(`'${thing}' is not a valid value for ${name}, must be one of: ${things.join(', ')}`);
  }
}

function ensureNumber(n: any): void {
  if (typeof n !== 'number') throw new Error(`must be a number`);
}

function basicEqual(a: any, b: any): boolean {
  return Boolean(a) === Boolean(b);
}

export class ServerSettings extends BaseImmutable<ServerSettingsValue, ServerSettingsJS> {
  static DEFAULT_PORT = 9090;
  static DEFAULT_SERVER_ROOT = '/pivot';
  static DEFAULT_REQUEST_LOG_FORMAT = 'common';
  static DEFAULT_PAGE_MUST_LOAD_TIMEOUT = 800;
  static IFRAME_VALUES: Iframe[] = ["allow", "deny"];
  static DEFAULT_IFRAME: Iframe = "allow";
  static TRUST_PROXY_VALUES: TrustProxy[] = ["none", "always"];
  static DEFAULT_TRUST_PROXY: TrustProxy = "none";
  static STRICT_TRANSPORT_SECURITY_VALUES: StrictTransportSecurity[] = ["none", "always"];
  static DEFAULT_STRICT_TRANSPORT_SECURITY: StrictTransportSecurity = "none";

  static isServerSettings(candidate: any): candidate is ServerSettings {
    return isInstanceOf(candidate, ServerSettings);
  }

  static fromJS(parameters: ServerSettingsJS): ServerSettings {
    if (typeof parameters.port === 'string') parameters.port = parseInt(parameters.port, 10);
    if (parameters.serverRoot && parameters.serverRoot[0] !== '/') parameters.serverRoot = '/' + parameters.serverRoot;
    if (parameters.serverRoot === '/') parameters.serverRoot = null;
    return new ServerSettings(BaseImmutable.jsToValue(ServerSettings.PROPERTIES, parameters));
  }

  static PROPERTIES: Property[] = [
    { name: 'port', defaultValue: ServerSettings.DEFAULT_PORT, validate: ensureNumber },
    { name: 'serverHost', defaultValue: null },
    { name: 'serverRoot', defaultValue: ServerSettings.DEFAULT_SERVER_ROOT },
    { name: 'requestLogFormat', defaultValue: ServerSettings.DEFAULT_REQUEST_LOG_FORMAT },
    { name: 'trackingUrl', defaultValue: null },
    { name: 'trackingContext', defaultValue: null, equal: basicEqual },
    { name: 'pageMustLoadTimeout', defaultValue: ServerSettings.DEFAULT_PAGE_MUST_LOAD_TIMEOUT },
    { name: 'iframe', defaultValue: ServerSettings.DEFAULT_IFRAME, possibleValues: ServerSettings.IFRAME_VALUES },
    { name: 'trustProxy', defaultValue: ServerSettings.DEFAULT_TRUST_PROXY, possibleValues: ServerSettings.TRUST_PROXY_VALUES },
    { name: 'strictTransportSecurity', defaultValue: ServerSettings.DEFAULT_STRICT_TRANSPORT_SECURITY, possibleValues: ServerSettings.STRICT_TRANSPORT_SECURITY_VALUES },
    { name: 'auth', defaultValue: null },
    { name: 'settingsLocation', defaultValue: null, immutableClass: SettingsLocation }
  ];

  public port: number;
  public serverHost: string;
  public serverRoot: string;
  public requestLogFormat: string;
  public trackingUrl: string;
  public trackingContext: Lookup<string>;
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
  public getRequestLogFormat: () => string;
  public getTrackingUrl: () => string;
  public getTrackingContext: () => Lookup<string>;
  public getPageMustLoadTimeout: () => number;
  public getIframe: () => Iframe;
  public getTrustProxy: () => TrustProxy;
  public getStrictTransportSecurity: () => StrictTransportSecurity;
  public getSettingsLocation: () => SettingsLocation;
}
BaseImmutable.finalize(ServerSettings);
