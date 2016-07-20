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

import { Class, Instance, isInstanceOf } from 'immutable-class';

export type Iframe = "allow" | "deny";
export type TrustProxy = "none" | "always";
export type StrictTransportSecurity = "none" | "always";

export interface ServerSettingsValue {
  port?: number;
  serverHost?: string;
  serverRoot?: string;
  pageMustLoadTimeout?: number;
  iframe?: Iframe;
  trustProxy?: TrustProxy;
  strictTransportSecurity?: StrictTransportSecurity;
}

export interface ServerSettingsJS {
  port?: number;
  serverHost?: string;
  serverRoot?: string;
  pageMustLoadTimeout?: number;
  iframe?: Iframe;
  trustProxy?: TrustProxy;
  strictTransportSecurity?: StrictTransportSecurity;
}

function parseIntFromPossibleString(x: any) {
  return typeof x === 'string' ? parseInt(x, 10) : x;
}

function ensureOneOfOrNull<T>(name: string, thing: T, things: T[]): void {
  if (thing == null) return;
  if (things.indexOf(thing) === -1) {
    throw new Error(`'${thing}' is not a valid value for ${name}, must be one of: ${things.join(', ')}`);
  }
}

var check: Class<ServerSettingsValue, ServerSettingsJS>;
export class ServerSettings implements Instance<ServerSettingsValue, ServerSettingsJS> {
  static DEFAULT_PORT = 9090;
  static DEFAULT_SERVER_ROOT = '/pivot';
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

  static fromJS(parameters: ServerSettingsJS, configFileDir?: string): ServerSettings {
    var {
      port,
      serverHost,
      serverRoot,
      pageMustLoadTimeout,
      iframe,
      trustProxy,
      strictTransportSecurity
    } = parameters;

    if (serverRoot && serverRoot[0] !== '/') serverRoot = '/' + serverRoot;
    if (serverRoot === '/') serverRoot = null;

    return new ServerSettings({
      port: parseIntFromPossibleString(port),
      serverHost,
      serverRoot,
      pageMustLoadTimeout,
      iframe,
      trustProxy,
      strictTransportSecurity
    });
  }

  public port: number;
  public serverHost: string;
  public serverRoot: string;
  public pageMustLoadTimeout: number;
  public iframe: Iframe;
  public trustProxy: TrustProxy;
  public strictTransportSecurity: StrictTransportSecurity;
  public druidRequestDecorator: string;

  constructor(parameters: ServerSettingsValue) {
    var port = parameters.port || ServerSettings.DEFAULT_PORT;
    if (typeof port !== 'number') throw new Error(`port must be a number`);
    this.port = port;

    this.serverHost = parameters.serverHost;
    this.serverRoot = parameters.serverRoot;
    this.pageMustLoadTimeout = parameters.pageMustLoadTimeout;

    this.iframe = parameters.iframe;
    ensureOneOfOrNull('iframe', this.iframe, ServerSettings.IFRAME_VALUES);

    this.trustProxy = parameters.trustProxy;
    ensureOneOfOrNull('trustProxy', this.trustProxy, ServerSettings.TRUST_PROXY_VALUES);

    this.strictTransportSecurity = parameters.strictTransportSecurity;
    ensureOneOfOrNull('strictTransportSecurity', this.strictTransportSecurity, ServerSettings.STRICT_TRANSPORT_SECURITY_VALUES);
  }

  public valueOf(): ServerSettingsValue {
    return {
      port: this.port,
      serverHost: this.serverHost,
      serverRoot: this.serverRoot,
      pageMustLoadTimeout: this.pageMustLoadTimeout,
      iframe: this.iframe,
      trustProxy: this.trustProxy,
      strictTransportSecurity: this.strictTransportSecurity
    };
  }

  public toJS(): ServerSettingsJS {
    var js: ServerSettingsJS = {
      port: this.port
    };
    if (this.serverHost) js.serverHost = this.serverHost;
    if (this.serverRoot) js.serverRoot = this.serverRoot;
    if (this.pageMustLoadTimeout) js.pageMustLoadTimeout = this.pageMustLoadTimeout;
    if (this.iframe) js.iframe = this.iframe;
    if (this.trustProxy) js.trustProxy = this.trustProxy;
    if (this.strictTransportSecurity) js.strictTransportSecurity = this.strictTransportSecurity;
    return js;
  }

  public toJSON(): ServerSettingsJS {
    return this.toJS();
  }

  public toString(): string {
    return `[ServerSettings ${this.port}]`;
  }

  public equals(other: ServerSettings): boolean {
    return ServerSettings.isServerSettings(other) &&
      this.port === other.port &&
      this.serverHost === other.serverHost &&
      this.serverRoot === other.serverRoot &&
      this.pageMustLoadTimeout === other.pageMustLoadTimeout &&
      this.iframe === other.iframe &&
      this.trustProxy === other.trustProxy &&
      this.strictTransportSecurity === other.strictTransportSecurity;
  }

  public getServerHost(): string {
    return this.serverHost;
  }

  public getServerRoot(): string {
    return this.serverRoot || ServerSettings.DEFAULT_SERVER_ROOT;
  }

  public getPageMustLoadTimeout(): number {
    return this.pageMustLoadTimeout || ServerSettings.DEFAULT_PAGE_MUST_LOAD_TIMEOUT;
  }

  public getIframe(): Iframe {
    return this.iframe || ServerSettings.DEFAULT_IFRAME;
  }

  public getTrustProxy(): TrustProxy {
    return this.trustProxy || ServerSettings.DEFAULT_TRUST_PROXY;
  }

  public getStrictTransportSecurity(): StrictTransportSecurity {
    return this.strictTransportSecurity || ServerSettings.DEFAULT_STRICT_TRANSPORT_SECURITY;
  }

}
check = ServerSettings;
