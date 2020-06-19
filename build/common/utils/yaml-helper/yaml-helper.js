"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var labels_1 = require("../../../common/models/labels");
var cluster_1 = require("../../models/cluster/cluster");
var data_cube_1 = require("../../models/data-cube/data-cube");
function spaces(n) {
    return (new Array(n + 1)).join(" ");
}
function extend(a, b) {
    for (var key in a) {
        b[key] = a[key];
    }
    return b;
}
function yamlObject(lines, indent) {
    if (indent === void 0) { indent = 2; }
    var pad = spaces(indent);
    return lines.map(function (line, i) {
        if (line === "")
            return "";
        return pad + (i ? "  " : "- ") + line;
    });
}
function yamlMap(map, indent) {
    if (indent === void 0) { indent = 2; }
    var pad = spaces(indent);
    return Object.keys(map).map(function (key) {
        return "" + pad + key + ": \"" + map[key] + "\"";
    });
}
function commentLines(comment) {
    return comment.split("\n").map(function (line) { return "# " + line; });
}
function yamlPropAdder(lines, withComments, options) {
    var object = options.object, propName = options.propName, defaultValue = options.defaultValue, comment = options.comment;
    var value = object[propName];
    if (value == null) {
        if (withComments && typeof defaultValue !== "undefined") {
            lines.push.apply(lines, [""].concat(commentLines(comment), ["#" + propName + ": " + defaultValue + " # <- default"]));
        }
    }
    else {
        if (withComments) {
            lines.push.apply(lines, [""].concat(commentLines(comment)));
        }
        lines.push(propName + ": " + value);
    }
}
function getYamlPropAdder(object, labels, lines, withComments) {
    if (withComments === void 0) { withComments = false; }
    var adder = function (propName, additionalOptions) {
        var propVerbiage = labels[propName];
        var comment;
        if (!propVerbiage) {
            console.warn("No labels for " + propName + ", please fix this in 'common/models/labels.ts'");
            comment = "";
        }
        else {
            comment = propVerbiage.description;
        }
        var options = { object: object, propName: propName, comment: comment };
        if (additionalOptions)
            options = extend(additionalOptions, options);
        yamlPropAdder(lines, withComments, options);
        return { add: adder };
    };
    return { add: adder };
}
function customizationToYAML(customization, withComments) {
    var timezones = customization.timezones, externalViews = customization.externalViews, cssVariables = customization.cssVariables;
    var lines = [];
    getYamlPropAdder(customization, labels_1.CUSTOMIZATION, lines, withComments)
        .add("customLogoSvg")
        .add("headerBackground")
        .add("sentryDSN")
        .add("urlShortener");
    if (timezones && timezones.length) {
        lines.push("timezones:");
        lines.push.apply(lines, timezones.map(function (tz) { return "- " + tz.toString(); }));
    }
    if (externalViews && externalViews.length) {
        lines.push("externalViews:");
        externalViews.forEach(function (_a) {
            var title = _a.title, linkGenerator = _a.linkGenerator;
            lines.push.apply(lines, yamlObject([
                "title: " + title,
                "linkGenerator: " + linkGenerator
            ]));
        });
    }
    if (cssVariables && Object.keys(cssVariables).length > 0) {
        if (withComments) {
            lines.push.apply(lines, commentLines(labels_1.CUSTOMIZATION.cssVariables.description));
        }
        lines.push("cssVariables:");
        lines.push.apply(lines, yamlMap(cssVariables));
    }
    var pad = spaces(2);
    return lines.map(function (line) { return "" + pad + line; });
}
function clusterToYAML(cluster, withComments) {
    var lines = [
        "name: " + cluster.name
    ];
    var props = getYamlPropAdder(cluster, labels_1.CLUSTER, lines, withComments);
    props
        .add("url")
        .add("version")
        .add("timeout", { defaultValue: cluster_1.Cluster.DEFAULT_TIMEOUT })
        .add("sourceListScan", { defaultValue: cluster_1.Cluster.DEFAULT_SOURCE_LIST_SCAN })
        .add("sourceListRefreshOnLoad", { defaultValue: true })
        .add("sourceListRefreshInterval", { defaultValue: cluster_1.Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL })
        .add("sourceReintrospectOnLoad", { defaultValue: true })
        .add("sourceReintrospectInterval", { defaultValue: cluster_1.Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL });
    if (withComments) {
        lines.push("", "# Database specific (" + cluster.type + ") ===============");
    }
    switch (cluster.type) {
        case "druid":
            props
                .add("introspectionStrategy", { defaultValue: cluster_1.Cluster.DEFAULT_INTROSPECTION_STRATEGY })
                .add("requestDecorator");
            break;
    }
    lines.push("");
    return yamlObject(lines);
}
function attributeToYAML(attribute) {
    var lines = [
        "name: " + attribute.name,
        "type: " + attribute.type
    ];
    if (attribute.nativeType) {
        lines.push("nativeType: " + attribute.nativeType);
    }
    lines.push("");
    return yamlObject(lines);
}
function dimensionToYAML(dimension) {
    var lines = [
        "name: " + dimension.name,
        "title: " + dimension.title
    ];
    if (dimension.kind !== "string") {
        lines.push("kind: " + dimension.kind);
    }
    if (dimension.multiValue) {
        lines.push("multiValue: true");
    }
    lines.push("formula: " + dimension.formula);
    lines.push("");
    return yamlObject(lines);
}
function measureToYAML(measure) {
    var lines = [
        "name: " + measure.name,
        "title: " + measure.title
    ];
    if (measure.units) {
        lines.push("units: " + measure.units);
    }
    lines.push("formula: " + measure.formula);
    var format = measure.format;
    if (!!format) {
        lines.push("format: " + format);
    }
    lines.push("");
    return yamlObject(lines);
}
function yamlArray(values) {
    return "[" + values.map(function (s) { return "\"" + s + "\""; }).join(", ") + "]";
}
function sourceToYAML(source) {
    if (!Array.isArray(source))
        return source;
    return yamlArray(source);
}
function dataCubeToYAML(dataCube, withComments) {
    var lines = [
        "name: " + dataCube.name,
        "title: " + dataCube.title,
        "clusterName: " + dataCube.clusterName,
        "source: " + sourceToYAML(dataCube.source)
    ];
    var timeAttribute = dataCube.timeAttribute;
    if (timeAttribute && !(dataCube.clusterName === "druid" && timeAttribute.name === "__time")) {
        if (withComments) {
            lines.push("# The primary time attribute of the data refers to the attribute that must always be filtered on");
            lines.push("# This is particularly useful for Druid data cubes as they must always have a time filter.");
        }
        lines.push("timeAttribute: " + timeAttribute.name, "");
    }
    var refreshRule = dataCube.refreshRule;
    if (withComments) {
        lines.push("# The refresh rule describes how often the data cube looks for new data. Default: 'query'/PT1M (every minute)");
    }
    lines.push("refreshRule:");
    lines.push("  rule: " + refreshRule.rule);
    if (refreshRule.time) {
        lines.push("  time: " + refreshRule.time.toISOString());
    }
    lines.push("");
    var addProps = getYamlPropAdder(dataCube, labels_1.DATA_CUBE, lines, withComments);
    addProps
        .add("defaultTimezone", { defaultValue: data_cube_1.DataCube.DEFAULT_DEFAULT_TIMEZONE })
        .add("defaultDuration", { defaultValue: data_cube_1.DataCube.DEFAULT_DEFAULT_DURATION })
        .add("defaultSortMeasure", { defaultValue: dataCube.getDefaultSortMeasure() });
    var defaultSelectedMeasures = dataCube.defaultSelectedMeasures ? dataCube.defaultSelectedMeasures.toArray() : null;
    if (withComments) {
        lines.push("", "# The names of measures that are selected by default");
    }
    if (defaultSelectedMeasures) {
        lines.push("defaultSelectedMeasures: " + JSON.stringify(defaultSelectedMeasures));
    }
    else if (withComments) {
        lines.push("#defaultSelectedMeasures: []");
    }
    var defaultPinnedDimensions = dataCube.defaultPinnedDimensions ? dataCube.defaultPinnedDimensions.toArray() : null;
    if (withComments) {
        lines.push("", "# The names of dimensions that are pinned by default (in order that they will appear in the pin bar)");
    }
    if (defaultPinnedDimensions) {
        lines.push("", "defaultPinnedDimensions: " + JSON.stringify(defaultPinnedDimensions));
    }
    else if (withComments) {
        lines.push("", "#defaultPinnedDimensions: []");
    }
    var introspection = dataCube.getIntrospection();
    if (withComments) {
        lines.push("", "# How the dataset should be introspected", "# possible options are:", "# * none - Do not do any introspection, take what is written in the config as the rule of law.", "# * no-autofill - Introspect the datasource but do not automatically generate dimensions or measures", "# * autofill-dimensions-only - Introspect the datasource, automatically generate dimensions only", "# * autofill-measures-only - Introspect the datasource, automatically generate measures only", "# * autofill-all - (default) Introspect the datasource, automatically generate dimensions and measures");
    }
    lines.push("introspection: " + introspection);
    var attributeOverrides = dataCube.attributeOverrides;
    if (withComments) {
        lines.push("", "# The list of attribute overrides in case introspection get something wrong");
    }
    lines.push("attributeOverrides:");
    if (withComments) {
        lines.push("  # A general attribute override looks like so:", "  #", "  # name: user_unique", "  # ^ the name of the attribute (the column in the database)", "  #", "  # type: STRING", "  # ^ (optional) plywood type of the attribute", "  #", "  # special: unique", "  # ^ (optional) any kind of special significance associated with this attribute", "");
    }
    lines = lines.concat.apply(lines, attributeOverrides.map(attributeToYAML));
    if (withComments) {
        lines.push("", "# The list of dimensions defined in the UI. The order here will be reflected in the UI");
    }
    lines.push("dimensions:");
    if (withComments) {
        lines.push("  # A general dimension looks like so:", "  #", "  # name: channel", "  # ^ the name of the dimension as used in the URL (you should try not to change these)", "  #", "  # title: The Channel", "  # ^ (optional) the human readable title. If not set a title is generated from the 'name'", "  #", "  # kind: string", "  # ^ (optional) the kind of the dimension. Can be 'string', 'time', 'number', or 'boolean'. Defaults to 'string'", "  #", "  # formula: $channel", "  # ^ (optional) the Plywood bucketing expression for this dimension. Defaults to '$name'", "  #   if, say, channel was called 'cnl' in the data you would put '$cnl' here", "  #   See also the expressions API reference: https://plywood.imply.io/expressions", "  #", "  # url: string", "  # ^ (optional) a url (including protocol) associated with the dimension, with optional token '%s'", "  #   that is replaced by the dimension value to generate links specific to each value.", "");
    }
    lines = lines.concat.apply(lines, dataCube.dimensions.mapDimensions(dimensionToYAML));
    if (withComments) {
        lines.push("  # This is the place where you might want to add derived dimensions.", "  #", "  # Here are some examples of possible derived dimensions:", "  #", "  # - name: is_usa", "  #   title: Is USA?", "  #   formula: $country == 'United States'", "  #", "  # - name: file_version", "  #   formula: $filename.extract('(\\d+\\.\\d+\\.\\d+)')", "");
    }
    if (withComments) {
        lines.push("", "# The list of measures defined in the UI. The order here will be reflected in the UI");
    }
    lines.push("measures:");
    if (withComments) {
        lines.push("  # A general measure looks like so:", "  #", "  # name: avg_revenue", "  # ^ the name of the dimension as used in the URL (you should try not to change these)", "  #", "  # title: Average Revenue", "  # ^ (optional) the human readable title. If not set a title is generated from the 'name'", "  #", "  # formula: $main.sum($revenue) / $main.sum($volume) * 10", "  # ^ (optional) the Plywood bucketing expression for this dimension.", "  #   Usually defaults to '$main.sum($name)' but if the name contains 'min' or 'max' will use that as the aggregate instead of sum.", "  #   this is the place to define your fancy formulas", "");
    }
    lines = lines.concat.apply(lines, dataCube.measures.mapMeasures(measureToYAML));
    if (withComments) {
        lines.push("  # This is the place where you might want to add derived measures (a.k.a Post Aggregators).", "  #", "  # Here are some examples of possible derived measures:", "  #", "  # - name: ecpm", "  #   title: eCPM", "  #   formula: $main.sum($revenue) / $main.sum($impressions) * 1000", "  #", "  # - name: usa_revenue", "  #   title: USA Revenue", "  #   formula: $main.filter($country == 'United States').sum($revenue)", "");
    }
    lines.push("");
    return yamlObject(lines);
}
function appSettingsToYAML(appSettings, withComments, extra) {
    if (extra === void 0) { extra = {}; }
    var dataCubes = appSettings.dataCubes, clusters = appSettings.clusters, customization = appSettings.customization;
    if (!dataCubes.length)
        throw new Error("Could not find any data cubes, please verify network connectivity");
    var lines = [];
    if (extra.header && extra.version) {
        lines.push("# generated by Turnilo version " + extra.version, "# for a more detailed walk-through go to: https://github.com/allegro/turnilo/blob/" + extra.version + "/docs/configuration.md", "");
    }
    if (extra.verbose) {
        if (withComments) {
            lines.push("# Run Swiv in verbose mode so it prints out the queries that it issues");
        }
        lines.push("verbose: true", "");
    }
    if (extra.port) {
        if (withComments) {
            lines.push("# The port on which the Swiv server will listen on");
        }
        lines.push("port: " + extra.port, "");
    }
    if (clusters.length) {
        lines.push("clusters:");
        lines = lines.concat.apply(lines, clusters.map(function (c) { return clusterToYAML(c, withComments); }));
    }
    if (customization) {
        lines.push("customization:");
        lines.push.apply(lines, customizationToYAML(customization, withComments));
    }
    lines.push("dataCubes:");
    lines = lines.concat.apply(lines, dataCubes.map(function (d) { return dataCubeToYAML(d, withComments); }));
    return lines.join("\n");
}
exports.appSettingsToYAML = appSettingsToYAML;
//# sourceMappingURL=yaml-helper.js.map