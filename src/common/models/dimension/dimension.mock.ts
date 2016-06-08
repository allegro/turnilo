import { Dimension, DimensionJS } from './dimension';
export class DimensionMock {
  public static get COUNTRY_STRING_JS(): DimensionJS {
    return {
      name: 'country',
      title: 'important countries',
      'expression': {
        'op': 'literal',
        'value': { 'setType': 'STRING', 'elements': ['en'] },
        'type': 'SET'
      },
      kind: 'string'
    };
  }

  public static get COUNTRY_URL_JS(): DimensionJS {
    return {
      name: 'country',
      title: 'important countries',
      'expression': {
        'op': 'literal',
        'value': { 'setType': 'STRING', 'elements': ['en'] },
        'type': 'SET'
      },
      kind: 'string',
      url: 'https://www.country.com/%s' // country.com redirects to a CMT.com. Could've been worse.
    };
  }

  public static get TIME_JS(): DimensionJS {
    return {
      name: 'time',
      title: 'time',
      'expression': {
        'op': 'literal',
        'value': { 'start': new Date('2013-02-26T19:00:00.000Z'), 'end': new Date('2013-02-26T22:00:00.000Z') },
        'type': 'TIME_RANGE'
      },
      kind: 'time',
      url: 'http://www.time.com/%s'
    };
  }

  public static get NUMBER_JS(): DimensionJS {
    return {
      name: 'numeric',
      title: 'Numeric',
      'expression': {
        'op': 'literal',
        'value': { 'setType': 'NUMBER', 'elements': [1] },
        'type': 'SET'
      },
      kind: 'number'
    };
  }

  static countryString() {
    return Dimension.fromJS(DimensionMock.COUNTRY_STRING_JS);
  }

  static countryURL() {
    return Dimension.fromJS(DimensionMock.COUNTRY_URL_JS);
  }

  static time() {
    return Dimension.fromJS(DimensionMock.TIME_JS);
  }

  static number() {
    return Dimension.fromJS(DimensionMock.NUMBER_JS);
  }
}
