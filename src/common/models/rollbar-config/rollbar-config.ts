import { Class, Instance } from "immutable-class";
import * as Rollbar from "rollbar";

export interface RollbarConfigValue {
  server_token?: string;
  client_token?: string;
  report_level?: Rollbar.Level;
  environment?: string;
}

var check: Class<RollbarConfigValue, RollbarConfigValue>;

export class RollbarConfig implements Instance<RollbarConfigValue, RollbarConfigValue> {
  static DEFAULT_REPORT_LEVEL = "error" as Rollbar.Level;
  static DEFAULT_ENVIRONMENT = "production";

  static isRollbarConfig(candidate: any): candidate is RollbarConfig {
    return candidate instanceof RollbarConfig;
  }

  static fromJS(parameters: RollbarConfigValue): RollbarConfig {
    var value: RollbarConfigValue = {
      server_token: parameters.server_token,
      client_token: parameters.client_token,
      report_level: parameters.report_level,
      environment: parameters.environment
    };

    return new RollbarConfig(value);
  }

  public server_token: string;
  public client_token: string;
  public report_level: Rollbar.Level;
  public environment: string;

  constructor(parameters: RollbarConfigValue) {
    this.server_token = parameters.server_token || null;
    this.client_token = parameters.client_token || null;
    this.report_level = parameters.report_level || RollbarConfig.DEFAULT_REPORT_LEVEL;
    this.environment = parameters.environment || RollbarConfig.DEFAULT_ENVIRONMENT;
  }

  public valueOf(): RollbarConfigValue {
    return {
      server_token: this.server_token,
      client_token: this.client_token,
      report_level: this.report_level,
      environment: this.environment
    };
  }

  public toJS(): RollbarConfigValue {
    var js: RollbarConfigValue = {};
    if (this.server_token) js.server_token = this.server_token;
    if (this.client_token) js.client_token = this.client_token;
    if (this.report_level) js.report_level = this.report_level;
    if (this.environment) js.environment = this.environment;
    return js;
  }

  public toJSON(): RollbarConfigValue {
    return this.toJS();
  }

  public toString(): string {
    return `Rollbar logging enabled for (${this.environment}) environment at ${this.report_level} level`;
  }

  public equals(other: RollbarConfig): boolean {
    return RollbarConfig.isRollbarConfig(other) &&
      this.server_token === other.server_token &&
      this.client_token === other.client_token &&
      this.report_level === other.report_level &&
      this.environment === other.environment;
  }
}

check = RollbarConfig;
