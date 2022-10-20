/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { FileFormat } from "../utils/download/download";

export const TITLE_HEIGHT = 36;

// Core = filter + split
export const DIMENSION_HEIGHT = 27;
export const MEASURE_HEIGHT = 27;
export const CORE_ITEM_WIDTH = 192;
export const CORE_ITEM_GAP = 8;
export const BAR_TITLE_WIDTH = 66;
export const PANEL_TOGGLE_WIDTH = 15;
export const ADD_TILE_WIDTH = 25;

export const PIN_TITLE_HEIGHT = 36;
export const PIN_ITEM_HEIGHT = 25;
export const PIN_PADDING_BOTTOM = 12;
export const VIS_H_PADDING = 10;

export const VIS_SELECTOR_WIDTH = 79;
export const OVERFLOW_WIDTH = 40;

export const SPLIT = "SPLIT";

export const MAX_SEARCH_LENGTH = 300;
export const SEARCH_WAIT = 900;

export const STRINGS: any = {
  add: "Add",
  addFromCube: "Add from Cube",
  addNewCollection: "Add new collection",
  addNewTile: "Add new tile",
  addToCollection: "Add to collection",
  addVisualization: "Add tile",
  any: "any",
  autoFillDimensionsAndMeasures: "Auto-fill dimensions and measures",
  autoUpdate: "Auto update",
  cancel: "Cancel",
  close: "Close",
  collections: "Collections",
  configureCluster: "configure cluster",
  configureDataCube: "configure dataCube",
  connectNewCluster: "Connect new cluster",
  contains: "Contains",
  convertToFixedTime: "Convert to fixed time",
  copied: "Copied!",
  copy: "Copy",
  copyDefinition: "Copy definition",
  copyFixedTimeUrl: "Copy URL - fixed time",
  copyRelativeTimeUrl: "Copy URL - relative time",
  copyUrl: "Copy URL",
  copyValue: "Copy value",
  createDataCube: "Create new cube",
  createCluster: "Create new cluster",
  createCubesFromCluster: "Create cubes from cluster",
  createShortFixedUrl: "Create Short URL - fixed time",
  createShortRelativeUrl: "Create Short URL - relative time",
  createShortUrl: "Create Short URL",
  current: "Current",
  create: "Create",
  cubes: "cubes",
  dataCubes: "Data Cubes",
  noDataCube: "DataCube not found",
  noDataCubes: "No Data Cubes present",
  noDataCubesFound: "No Data Cubes found for query: ",
  delete: "Delete",
  deleteCollection: "Delete this collection",
  deleteCollectionTile: "Delete this tile",
  dimensions: "Dimensions",
  dimension: "Dimension",
  download: "Download",
  dragToReorder: "Drag tiles to reorder",
  duplicateCollectionTile: "Duplicate this tile",
  durationsExamples: "e.g. PT2H or P3D",
  edit: "Edit",
  editCollection: "Edit collection",
  editDataCube: "Edit cube",
  editCluster: "Edit cluster",
  editThisCube: "Edit this cube",
  editTitleAndDesc: "Edit title and description",
  editVisualization: "Edit visualization",
  end: "End",
  exclude: "Exclude",
  explore: "Explore",
  exportToCSV: "Export to CSV",
  exportToTSV: "Export to TSV",
  filter: "Filter",
  floorableDurationsExamples: "e.g. PT2H or P3M",
  format: "Format",
  generalSettings: "General settings",
  goToUrl: "Go to URL",
  granularity: "Granularity",
  home: "Turnilo",
  include: "Include",
  infoAndFeedback: "Info & Feedback",
  intersection: "Intersection",
  invalidDurationFormat: "Invalid duration format",
  invalidNumberFormat: "Invalid number format",
  last5Minutes: "Last 5 minutes",
  lastDay: "Last Day",
  lastHour: "Last Hour",
  lastWeek: "Last Week",
  latest: "Latest",
  limit: "Limit",
  loading: "Loading…",
  logout: "Logout",
  measures: "Measures",
  measure: "Measure",
  mkurlDomainPlaceholder: "CHANGE ME",
  next: "Next",
  no: "No",
  noIllCreateThem: "No, I'll create them myself",
  noClusters: "No clusters",
  noDescription: "No description",
  noFilter: "No filter",
  noQueryableDataCubes: "There are no queryable data cubes configured",
  notFloorableDuration: "Duration is not floorable",
  noTilesInThisCollection: "There are no tiles in this collection",
  ok: "OK",
  openIn: "Open in",
  overlappingPeriods: "Shifted period overlaps with main period",
  pin: "Pin",
  pinboard: "Pinboard",
  pinboardPlaceholder: "Click or drag dimensions to pin them",
  previous: "Previous",
  quarter: "Quarter",
  queryError: "Query error",
  rawData: "Raw Data",
  regex: "Regex",
  relative: "Relative",
  save: "Save",
  select: "Select",
  series: "Measure",
  settings: "Settings",
  sortBy: "Sort by",
  fixed: "Fixed",
  split: "Split",
  splitDelimiter: "by",
  start: "Start",
  stringSearch: "String search",
  subsplit: "Split",
  suggestion: "suggestion",
  timeShift: "Time shift",
  timeShiftExamples: "e.g. P2W or P1Y",
  timezone: "Timezone",
  undo: "Click here to undo",
  updateTimezone: "Update Timezone",
  displayRawData: "Display raw data",
  displayDruidQuery: "Display Druid query",
  displayViewDefinition: "Display view definition",
  viewDefinition: "View definition",
  yes: "Yes"
};

// Data cubes introspection strategies
export const DATA_CUBES_STRATEGIES_LABELS = {
  "none": "None",
  "no-autofill": "No autofill",
  "autofill-dimensions-only": "Autofill dimensions only",
  "autofill-measures-only": "Autofill measures only",
  "autofill-all": "Autofill all"
};

export const exportOptions: Array<{ label: string, fileFormat: FileFormat }> = [
  { label: STRINGS.exportToCSV, fileFormat: "csv" },
  { label: STRINGS.exportToTSV, fileFormat: "tsv" }
];
