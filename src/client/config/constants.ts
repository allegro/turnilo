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

export const STRINGS = {
  home: 'Home',
  settings: 'Settings',
  dimensions: 'Dimensions',
  measures: 'Measures',
  filter: 'Filter',
  split: 'Split',
  subsplit: 'Split',
  sortBy: 'Sort by',
  limit: 'Limit',
  pin: 'Pin',
  pinboard: 'Pinboard',
  pinboardPlaceholder: 'Click or drag dimensions to pin them',
  granularity: 'Granularity',
  relative: 'Relative',
  specific: 'Specific',
  noFilter: 'No filter',
  latest: 'Latest',
  current: 'Current',
  previous: 'Previous',
  start: 'Start',
  end: 'End',
  ok: 'OK',
  select: 'Select',
  cancel: 'Cancel',
  close: 'Close',
  queryError: 'Query error',
  autoUpdate: 'Auto update',
  download: 'Download',
  copyUrl: 'Copy URL',
  viewRawData: 'View raw data',
  rawData: 'Raw Data',
  copySpecificUrl: 'Copy URL - fixed time',
  logout: 'Logout',
  infoAndFeedback: 'Info & Feedback',
  copyValue: 'Copy value',
  goToUrl: 'Go to URL',
  openIn: 'Open in',
  segment: 'segment',
  exportToCSV: 'Export to CSV',
  updateTimezone: 'Update Timezone',
  timezone: 'Timezone',
  splitDelimiter: 'by',
  any: 'any'
};


const EN_US: Locale = {
  shortDays: [ "S", "M", "T", "W", "T", "F", "S" ],
  shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ],
  weekStart: 0
};

export function getLocale(): Locale {
  return EN_US;
}
