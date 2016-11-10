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

import { Dimension, DimensionJS } from './dimension';
export class DimensionMock {
  public static get COUNTRY_STRING_JS(): DimensionJS {
    return {
      name: 'country',
      title: 'important countries',
      formula: '$country',
      kind: 'string'
    };
  }

  public static get COUNTRY_URL_JS(): DimensionJS {
    return {
      name: 'country',
      title: 'important countries',
      formula: '$country',
      kind: 'string',
      url: 'https://www.country.com/%s' // country.com redirects to a CMT.com. Could've been worse.
    };
  }

  public static get TIME_JS(): DimensionJS {
    return {
      name: 'time',
      title: 'time',
      formula: '$time',
      kind: 'time',
      url: 'http://www.time.com/%s'
    };
  }

  public static get NUMBER_JS(): DimensionJS {
    return {
      name: 'numeric',
      title: 'Numeric',
      formula: '$n',
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
