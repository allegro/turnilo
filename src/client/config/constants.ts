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

import { $, SortAction } from 'plywood';
import { Locale } from '../../common/utils/time/time';

export const TITLE_HEIGHT = 36;

// Core = filter + split
export const DIMENSION_HEIGHT = 27;
export const MEASURE_HEIGHT = 27;
export const CORE_ITEM_WIDTH = 192;
export const CORE_ITEM_GAP = 8;
export const BAR_TITLE_WIDTH = 66;

export const PIN_TITLE_HEIGHT = 36;
export const PIN_ITEM_HEIGHT = 25;
export const PIN_PADDING_BOTTOM = 12;
export const VIS_H_PADDING = 10;

export const VIS_SELECTOR_WIDTH = 79;
export const OVERFLOW_WIDTH = 40;

export const SPLIT = 'SPLIT';

export const MAX_SEARCH_LENGTH = 300;
export const SEARCH_WAIT = 900;

export const STRINGS: any = {
  any: 'any',
  autoUpdate: 'Auto update',
  cancel: 'Cancel',
  close: 'Close',
  copySpecificUrl: 'Copy URL - fixed time',
  copyUrl: 'Copy URL',
  copyValue: 'Copy value',
  current: 'Current',
  dataCubes: 'Data Cubes',
  dimensions: 'Dimensions',
  download: 'Download',
  editThisCube: 'Edit this cube',
  end: 'End',
  exclude: 'Exclude',
  exportToCSV: 'Export to CSV',
  filter: 'Filter',
  generalSettings: 'General settings',
  goToUrl: 'Go to URL',
  granularity: 'Granularity',
  home: 'Pivot',
  include: 'Include',
  infoAndFeedback: 'Info & Feedback',
  intersection: 'Intersection',
  latest: 'Latest',
  limit: 'Limit',
  logout: 'Logout',
  measures: 'Measures',
  noDescription: 'No description',
  noFilter: 'No filter',
  noQueryableDataCubes: 'There are no queryable data cubes configured',
  ok: 'OK',
  openIn: 'Open in',
  pin: 'Pin',
  pinboard: 'Pinboard',
  pinboardPlaceholder: 'Click or drag dimensions to pin them',
  previous: 'Previous',
  queryError: 'Query error',
  rawData: 'Raw Data',
  regex: 'Regex',
  relative: 'Relative',
  segment: 'segment',
  select: 'Select',
  settings: 'Settings',
  sortBy: 'Sort by',
  specific: 'Specific',
  split: 'Split',
  splitDelimiter: 'by',
  start: 'Start',
  stringSearch: 'String search',
  subsplit: 'Split',
  timezone: 'Timezone',
  updateTimezone: 'Update Timezone',
  viewRawData: 'View raw data'
};

// Data cubes introspection strategies
export const DATA_CUBES_STRATEGIES_LABELS = {
  none: 'None',
  'no-autofill': 'No autofill',
  'autofill-dimensions-only': 'Autofill dimensions only',
  'autofill-measures-only': 'Autofill measures only',
  'autofill-all': 'Autofill all'
};


const EN_US: Locale = {
  shortDays: [ "S", "M", "T", "W", "T", "F", "S" ],
  shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ],
  weekStart: 0
};

export function getLocale(): Locale {
  return EN_US;
}
