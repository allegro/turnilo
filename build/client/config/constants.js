"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TITLE_HEIGHT = 36;
exports.DIMENSION_HEIGHT = 27;
exports.MEASURE_HEIGHT = 27;
exports.CORE_ITEM_WIDTH = 192;
exports.CORE_ITEM_GAP = 8;
exports.BAR_TITLE_WIDTH = 66;
exports.PANEL_TOGGLE_WIDTH = 15;
exports.ADD_TILE_WIDTH = 25;
exports.PIN_TITLE_HEIGHT = 36;
exports.PIN_ITEM_HEIGHT = 25;
exports.PIN_PADDING_BOTTOM = 12;
exports.VIS_H_PADDING = 10;
exports.VIS_SELECTOR_WIDTH = 79;
exports.OVERFLOW_WIDTH = 40;
exports.SPLIT = "SPLIT";
exports.MAX_SEARCH_LENGTH = 300;
exports.SEARCH_WAIT = 900;
exports.STRINGS = {
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
exports.DATA_CUBES_STRATEGIES_LABELS = {
    "none": "None",
    "no-autofill": "No autofill",
    "autofill-dimensions-only": "Autofill dimensions only",
    "autofill-measures-only": "Autofill measures only",
    "autofill-all": "Autofill all"
};
var EN_US = {
    shortDays: ["S", "M", "T", "W", "T", "F", "S"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
    weekStart: 0
};
function getLocale() {
    return EN_US;
}
exports.getLocale = getLocale;
exports.exportOptions = [
    { label: exports.STRINGS.exportToCSV, fileFormat: "csv" },
    { label: exports.STRINGS.exportToTSV, fileFormat: "tsv" }
];
//# sourceMappingURL=constants.js.map