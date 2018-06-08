/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { BaseImmutable, Property } from "immutable-class";

export type Location = "file" | "mysql" | "postgres";
export type Format = "json" | "yaml";

export interface SettingsLocationValue {
  location: Location;
  uri: string;
  table?: string;
  format?: Format;
  readOnly?: boolean;
}

export interface SettingsLocationJS {
  location: Location;
  uri: string;
  table?: string;
  format?: Format;
  readOnly?: boolean;
}

export class SettingsLocation extends BaseImmutable<SettingsLocationValue, SettingsLocationJS> {
  static LOCATION_VALUES: Location[] = ["file", "mysql", "postgres"];
  static DEFAULT_FORMAT: Format = "json";
  static FORMAT_VALUES: Format[] = ["json", "yaml"];

  static isSettingsLocation(candidate: any): candidate is SettingsLocation {
    return candidate instanceof SettingsLocation;
  }

  static fromJS(parameters: SettingsLocationJS): SettingsLocation {
    return new SettingsLocation(BaseImmutable.jsToValue(SettingsLocation.PROPERTIES, parameters));
  }

  static PROPERTIES: Property[] = [
    { name: "location", possibleValues: SettingsLocation.LOCATION_VALUES },
    { name: "uri" },
    { name: "table", defaultValue: null },
    { name: "format", defaultValue: SettingsLocation.DEFAULT_FORMAT, possibleValues: SettingsLocation.FORMAT_VALUES },
    { name: "readOnly", defaultValue: false }
  ];

  public location: Location;
  public uri: string;
  public table: string;
  public format: Format;
  public readOnly: boolean;

  constructor(parameters: SettingsLocationValue) {
    super(parameters);

    // remove table if file
    if (this.location === "file" && this.table) this.table = null;
  }

  public getLocation: () => Location;
  public getUri: () => string;
  public getTable: () => string;

  public getFormat(): Format {
    if (this.format) return this.format;

    // derive format from extension if not set, and possible
    if (this.location === "file") {
      if (/\.json$/.test(this.uri)) {
        return "json";
      } else if (/\.yaml$/.test(this.uri)) {
        return "yaml";
      }
    }

    return SettingsLocation.DEFAULT_FORMAT;
  }

  public getReadOnly: () => boolean;

}

BaseImmutable.finalize(SettingsLocation);
