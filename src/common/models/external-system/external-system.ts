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

import { Instance } from "immutable-class";
import { isURL } from "validator";

export interface ExternalSystemValue {
   redirectLink?: string;
   enabled?: boolean;
   exportTimeout?: number;
}

export class ExternalSystem implements Instance<ExternalSystemValue, ExternalSystemValue> {

  static DEFAULT_EXPORT_TIMEOUT = 1000;
  static isExternalSystem(candidate: any): candidate is ExternalSystem {
    return candidate instanceof ExternalSystem;
  }

  static fromJS(parameters: ExternalSystemValue): ExternalSystem {
    const { redirectLink, enabled } = parameters;
    return new ExternalSystem({
      redirectLink,
      enabled
    });
  }

  enabled: boolean;
  exportTimeout: number;
  redirectLink: string;

  constructor(parameters: ExternalSystemValue) {
    const { enabled, exportTimeout, redirectLink } = parameters;

    if (redirectLink && !isURL(redirectLink)) {
      throw new Error(`External system URL is malformed: ${redirectLink}`);
    }

    this.enabled = !!(redirectLink || enabled);
    this.redirectLink = redirectLink;
    this.exportTimeout = Boolean(exportTimeout) ? exportTimeout : ExternalSystem.DEFAULT_EXPORT_TIMEOUT;
  }

  equals(other: ExternalSystem): boolean {
    return ExternalSystem.isExternalSystem(other) &&
      this.redirectLink === other.redirectLink &&
      this.enabled === other.enabled &&
      this.exportTimeout === other.exportTimeout;
  }

  toJS(): ExternalSystemValue {
    const js: ExternalSystemValue = {
      enabled: this.enabled,
      exportTimeout: this.exportTimeout
    };
    if (this.redirectLink) js.redirectLink = this.redirectLink;
    return js;
  }

  toJSON(): ExternalSystemValue {
    return this.toJS();
  }

  valueOf(): ExternalSystemValue {
    const value: ExternalSystemValue = {
      enabled: this.enabled,
      exportTimeout: this.exportTimeout
    };
    if (this.redirectLink) value.redirectLink = this.redirectLink;
    return value;
  }
}
