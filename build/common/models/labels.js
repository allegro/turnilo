"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cluster_1 = require("./cluster/cluster");
var data_cube_1 = require("./data-cube/data-cube");
exports.DIMENSION = {
    name: {
        label: "Name (you won't be able to change this later)",
        description: "The name of the dimension. This does not have to correspond to the\n      attribute name (but the auto generated dimensions do). This should be a\n      URL safe string. Changing this property will break any URLs that someone\n      might have generated that include this dimension, that's why you can only\n      set it once"
    },
    title: {
        label: "Title",
        description: "The title for this dimension in the UI. Can be anything and is safe\n    to change at any time."
    },
    kind: {
        label: "Kind",
        description: "The dimension's kind"
    },
    formula: {
        label: "Formula",
        description: "The formula for this dimension. By default it is <code>$name</code> where <em>name</em> is\n      the name of the dimension. You can create derived dimensions by using\n      non-trivial formulas."
    },
    url: {
        label: "URL",
        description: "A url associated with the dimension, with optional token '%s' that\n    is replaced by the dimension value to generate a link specific to each value."
    },
    granularities: {
        label: "Granularities",
        description: "A set of exactly 5 granularities that you want to be available for bucketing."
    },
    bucketingStrategy: {
        label: "Default Bucketing",
        description: "Specify whether or not the dimension should be bucketed by default."
    }
};
exports.COLLECTION = {
    name: {
        label: "Name (you won't be able to change this later)",
        description: "The name of the collection. This should be a\n      URL safe string. Changing this property will break any URLs that someone\n      might have generated that include this dimension, that's why you can only\n      set it once"
    },
    title: {
        label: "Title",
        description: "The title for this collection in the UI. Can be anything and is safe\n    to change at any time."
    },
    description: {
        label: "Description",
        description: "The description of the collection (shown the home view)."
    }
};
exports.COLLECTION_ITEM = {
    name: {
        label: "Name (you won't be able to change this later)",
        description: "The name of the collection item. This should be a\n      URL safe string. Changing this property will break any URLs that someone\n      might have generated that include this dimension, that's why you can only\n      set it once"
    },
    title: {
        label: "Title",
        description: "The title for this item in the UI. Can be anything and is safe\n    to change at any time."
    },
    description: {
        label: "Description",
        description: "The description of the collection item (shown in both the\n    overview and the detailed view."
    }
};
exports.MEASURE = {
    name: {
        label: "Name (you won't be able to change this later)",
        description: "The name of the measure. This should be a\n      URL safe string. Changing this property will break any URLs that someone\n      might have generated that include this dimension, that's why you can only\n      set it once"
    },
    title: {
        label: "Title",
        description: "The title for this measure in the UI. Can be anything and is safe\n    to change at any time."
    },
    units: {
        label: "Units",
        description: "The units for this measure. To be shown alongside the title."
    },
    formula: {
        label: "Formula",
        description: "The <a href=\"http://plywood.imply.io/expressions\" target=\"_blank\">\n      Plywood expression</a> for this dimension. By default it is\n      <code>$main.sum($name)</code> where <em>name</em> is the name of the measure."
    }
};
exports.CUSTOMIZATION = {
    customLogoSvg: {
        label: "Custom Logo",
        description: "Custom Logo icon."
    },
    headerBackground: {
        label: "Background Color",
        description: "Custom color of header background."
    },
    urlShortener: {
        label: "Url Shortener",
        description: "Code for request call to url shortener service. If provided, additional options would show in share menu."
    },
    externalViews: {
        label: "External Views",
        description: "Code that generates links to external views that will appear in share menu."
    },
    timezones: {
        label: "Timezones",
        description: "These timezones will appear in the dropdown instead of the default."
    },
    cssVariables: {
        label: "CSS Variables",
        description: "Override CSS variables for theming purposes"
    }
};
exports.CLUSTER = {
    title: {
        label: "Title",
        description: "The title of the Cluster in the UI. Can be anything and is\n    safe to change at anytime"
    },
    name: {
        label: "Name",
        description: "The name of the cluster (to be referenced later from the data cube)"
    },
    url: {
        label: "Host",
        description: "The url address (http[s]://hostname[:port]) of the cluster. If no port, 80 is assumed for plain http, and 443 for secure https."
    },
    version: {
        label: "Version",
        description: "The explicit version to use for this cluster. This does not need to be defined " +
            "as the version will naturally be determined through introspection."
    },
    timeout: {
        label: "Timeout",
        description: "The timeout to set on the queries in ms. Default is <code>" + cluster_1.Cluster.DEFAULT_TIMEOUT + "</code>"
    },
    sourceListScan: {
        label: "Source List Scan",
        description: "Should the sources of this cluster be automatically scanned and new\n      sources added as data cubes. Default: <code>" + cluster_1.Cluster.DEFAULT_SOURCE_LIST_SCAN + "</code>"
    },
    sourceListRefreshOnLoad: {
        label: "Source List Refresh On Load",
        description: "Should the list of sources be reloaded every time that Turnilo is\n    loaded. This will put additional load on the data store but will ensure that\n    sources are visible in the UI as soon as they are created."
    },
    sourceListRefreshInterval: {
        label: "Source List Refresh Interval",
        description: "How often should sources be reloaded in ms. Default: <code>" + cluster_1.Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL + "</code>"
    },
    sourceReintrospectOnLoad: {
        label: "Source Reintrospect On Load",
        description: "Should sources be scanned for additional dimensions every time that\n      Turnilo is loaded. This will put additional load on the data store but will\n      ensure that dimension are visible in the UI as soon as they are created. Default: <code>" + cluster_1.Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL + "</code>"
    },
    sourceReintrospectInterval: {
        label: "Source Reintrospect Interval",
        description: "How often should source schema be reloaded in ms."
    },
    introspectionStrategy: {
        label: "Introspection Strategy",
        description: "The introspection strategy for the Druid external."
    },
    requestDecorator: {
        label: "Request decorator",
        description: "The request decorator module filepath to load."
    },
    database: {
        label: "Database",
        description: "The database to which to connect to."
    },
    user: {
        label: "User",
        description: "The user to connect as. This user needs no permissions other than SELECT."
    },
    password: {
        label: "Password",
        description: "The password to use with the provided user."
    }
};
exports.GENERAL = {
    "customization.title": {
        label: "Title",
        description: "What will appear as the tab's title in your browser. Use <code>%v</code> as a placeholder for Turnilo's version."
    },
    "customization.timezones": {
        label: "Timezones",
        description: "You can customize the timezones that appear in the header bar\n      dropdown by providing an array of timezone strings."
    }
};
exports.DATA_CUBE = {
    name: {
        label: "Name",
        description: "The name of the data cube as used internally in Turnilo and used in the\n      URLs. This should be a URL safe string. Changing this property for a given\n      data cube will break any URLs that someone might have generated for that\n      data cube in the past."
    },
    title: {
        label: "Title",
        description: "The user visible name that will be used to describe this data cube in\n      the UI. It is always safe to change this."
    },
    description: {
        label: "Description",
        description: "The description of the data cube shown in the homepage."
    },
    introspection: {
        label: "Introspection",
        description: "How will this cube be introspected. Default: <code>" + data_cube_1.DataCube.DEFAULT_INTROSPECTION + "</code>"
    },
    clusterName: {
        label: "Cluster",
        description: "The cluster that the data cube belongs to (or <code>native</code>\n      if this is a file based data cube)"
    },
    source: {
        label: "Source",
        description: "The name of cube's source. The dataSource, table, or filename of the data for this cube"
    },
    subsetFormula: {
        label: "Subset Formula",
        description: "A row level filter that is applied to the cube. This filter is never represented in the UI"
    },
    defaultDuration: {
        label: "Default duration",
        description: "The time period, expressed as an\n      <a href=\"https://en.wikipedia.org/wiki/ISO_8601#Durations\" target=\"_blank\">\n      ISO 8601 Duration</a>, that will be shown when the user first opens this\n      cube. Default: <code>" + data_cube_1.DataCube.DEFAULT_DEFAULT_DURATION + "</code>."
    },
    defaultTimezone: {
        label: "Default timezone",
        description: "The default timezone, expressed as an\n      <a href=\"https://en.wikipedia.org/wiki/Tz_database\" target=\"_blank\">\n      Olsen Timezone</a>, that will be selected when the user first opens this\n      cube. Default: <code>" + data_cube_1.DataCube.DEFAULT_DEFAULT_TIMEZONE + "</code>."
    },
    defaultSortMeasure: {
        label: "Default sort measure",
        description: "The name of the measure that will be used for default sorting.\n      It is commonly set to the measure that represents the count of events.\n      Default: the first measure."
    },
    attributeOverrides: {
        label: "Attribute overrides",
        description: "While Turnilo tries to learn as much as it can from your data cube\n      from Druid directly. It can not (yet) do a perfect job.\n      The attributeOverrides: section of the data cube is there for you to fix that."
    }
};
//# sourceMappingURL=labels.js.map