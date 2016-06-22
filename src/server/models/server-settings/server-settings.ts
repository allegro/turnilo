import * as path from 'path';
import { Class, Instance, isInstanceOf } from 'immutable-class';

export type Iframe = "allow" | "deny";

export interface ServerSettingsValue {
  port?: number;
  serverHost?: string;
  serverRoot?: string;
  pageMustLoadTimeout?: number;
  iframe?: Iframe;
}

export interface ServerSettingsJS {
  port?: number;
  serverHost?: string;
  serverRoot?: string;
  pageMustLoadTimeout?: number;
  iframe?: Iframe;
}

function parseIntFromPossibleString(x: any) {
  return typeof x === 'string' ? parseInt(x, 10) : x;
}

var check: Class<ServerSettingsValue, ServerSettingsJS>;
export class ServerSettings implements Instance<ServerSettingsValue, ServerSettingsJS> {
  static DEFAULT_PORT = 9090;
  static DEFAULT_SERVER_ROOT = '/pivot';
  static DEFAULT_PAGE_MUST_LOAD_TIMEOUT = 800;
  static DEFAULT_IFRAME: Iframe = "allow";

  static isServerSettings(candidate: any): candidate is ServerSettings {
    return isInstanceOf(candidate, ServerSettings);
  }

  static fromJS(parameters: ServerSettingsJS, configFileDir?: string): ServerSettings {
    var {
      port,
      serverHost,
      serverRoot,
      pageMustLoadTimeout,
      iframe
    } = parameters;

    if (serverRoot && serverRoot[0] !== '/') serverRoot = '/' + serverRoot;
    if (serverRoot === '/') serverRoot = null;

    return new ServerSettings({
      port: parseIntFromPossibleString(port),
      serverHost,
      serverRoot,
      pageMustLoadTimeout,
      iframe
    });
  }

  public port: number;
  public serverHost: string;
  public serverRoot: string;
  public pageMustLoadTimeout: number;
  public iframe: Iframe;
  public druidRequestDecorator: string;

  constructor(parameters: ServerSettingsValue) {
    var port = parameters.port || ServerSettings.DEFAULT_PORT;
    if (typeof port !== 'number') throw new Error(`port must be a number`);
    this.port = port;

    this.serverHost = parameters.serverHost;
    this.serverRoot = parameters.serverRoot || ServerSettings.DEFAULT_SERVER_ROOT;
    this.pageMustLoadTimeout = parameters.pageMustLoadTimeout || ServerSettings.DEFAULT_PAGE_MUST_LOAD_TIMEOUT;
    this.iframe = parameters.iframe || ServerSettings.DEFAULT_IFRAME;
  }

  public valueOf(): ServerSettingsValue {
    return {
      port: this.port,
      serverHost: this.serverHost,
      serverRoot: this.serverRoot,
      pageMustLoadTimeout: this.pageMustLoadTimeout,
      iframe: this.iframe
    };
  }

  public toJS(): ServerSettingsJS {
    var js: ServerSettingsJS = {
      port: this.port
    };
    if (this.serverHost) js.serverHost = this.serverHost;
    if (this.serverRoot !== ServerSettings.DEFAULT_SERVER_ROOT) js.serverRoot = this.serverRoot;
    if (this.pageMustLoadTimeout !== ServerSettings.DEFAULT_PAGE_MUST_LOAD_TIMEOUT) js.pageMustLoadTimeout = this.pageMustLoadTimeout;
    if (this.iframe !== ServerSettings.DEFAULT_IFRAME) js.iframe = this.iframe;
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
      this.iframe === other.iframe;
  }

}
check = ServerSettings;
