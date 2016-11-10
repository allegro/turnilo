import { BaseImmutable, Property, isInstanceOf } from 'immutable-class';


export type Location = 'file' | 'mysql' | 'postgres';
export type Format = 'json' | 'yaml';

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
  static LOCATION_VALUES: Location[] = ['file', 'mysql', 'postgres'];
  static DEFAULT_FORMAT: Format = 'json';
  static FORMAT_VALUES: Format[] = ['json', 'yaml'];

  static isSettingsLocation(candidate: any): candidate is SettingsLocation {
    return isInstanceOf(candidate, SettingsLocation);
  }

  static fromJS(parameters: SettingsLocationJS): SettingsLocation {
    return new SettingsLocation(BaseImmutable.jsToValue(SettingsLocation.PROPERTIES, parameters));
  }

  static PROPERTIES: Property[] = [
    { name: 'location', possibleValues: SettingsLocation.LOCATION_VALUES },
    { name: 'uri' },
    { name: 'table', defaultValue: null },
    { name: 'format', defaultValue: SettingsLocation.DEFAULT_FORMAT, possibleValues: SettingsLocation.FORMAT_VALUES },
    { name: 'readOnly', defaultValue: false }
  ];

  public location: Location;
  public uri: string;
  public table: string;
  public format: Format;
  public readOnly: boolean;

  constructor(parameters: SettingsLocationValue) {
    super(parameters);

    // remove table if file
    if (this.location === 'file' && this.table) this.table = null;
  }

  public getLocation: () => Location;
  public getUri: () => string;
  public getTable: () => string;

  public getFormat(): Format {
    if (this.format) return this.format;

    // derive format from extension if not set, and possible
    if (this.location === 'file') {
      if (/\.json$/.test(this.uri)) {
        return 'json';
      } else if (/\.yaml$/.test(this.uri)) {
        return 'yaml';
      }
    }

    return SettingsLocation.DEFAULT_FORMAT;
  }

  public getReadOnly: () => boolean;

}
BaseImmutable.finalize(SettingsLocation);
