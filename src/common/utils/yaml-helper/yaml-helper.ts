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

import { AttributeInfo } from "plywood";
import { Logger } from "../../logger/logger";
import { AppSettings } from "../../models/app-settings/app-settings";
import {
  Cluster, DEFAULT_INTROSPECTION_STRATEGY,
  DEFAULT_SOURCE_LIST_REFRESH_INTERVAL, DEFAULT_SOURCE_LIST_SCAN,
  DEFAULT_SOURCE_REINTROSPECT_INTERVAL
} from "../../models/cluster/cluster";
import { Customization } from "../../models/customization/customization";
import { DataCube, DEFAULT_DEFAULT_DURATION, DEFAULT_DEFAULT_TIMEZONE, Source } from "../../models/data-cube/data-cube";
import { Dimension } from "../../models/dimension/dimension";
import { allDimensions } from "../../models/dimension/dimensions";
import { CLUSTER, CUSTOMIZATION, DATA_CUBE } from "../../models/labels";
import { Measure } from "../../models/measure/measure";
import { allMeasures } from "../../models/measure/measures";
import { Sources } from "../../models/sources/sources";

function spaces(n: number) {
  return (new Array(n + 1)).join(" ");
}

function extend(a: any, b: any): any {
  for (const key in a) {
    b[key] = a[key];
  }

  return b;
}

function yamlObject(lines: string[], indent = 2): string[] {
  const pad = spaces(indent);
  return lines.map((line, i) => {
    if (line === "") return "";
    return pad + (i ? "  " : "- ") + line;
  });
}

function yamlMap(map: Record<string, string>, indent = 2): string[] {
  const pad = spaces(indent);
  return Object.keys(map).map(key => {
    return `${pad}${key}: "${map[key]}"`;
  });
}

interface PropAdderOptions {
  object: any;
  propName: string;
  comment?: string;
  defaultValue?: any;
}

function commentLines(comment: string): string[] {
  return comment.split("\n").map(line => `# ${line}`);
}

function yamlPropAdder(lines: string[], withComments: boolean, options: PropAdderOptions): void {
  const { object, propName, defaultValue, comment } = options;

  const value = object[propName];
  if (value == null) {
    if (withComments && typeof defaultValue !== "undefined") {
      lines.push(
        "",
        ...commentLines(comment),
        `#${propName}: ${defaultValue} # <- default`
      );
    }
  } else {
    if (withComments) {
      lines.push(
        "",
        ...commentLines(comment)
      );
    }
    lines.push(`${propName}: ${value}`);
  }
}

function getYamlPropAdder(object: any, labels: any, lines: string[], withComments: boolean, logger: Logger) {
  const adder = (propName: string, additionalOptions?: { defaultValue?: any }) => {
    const propVerbiage = labels[propName];
    let comment: string;

    if (!propVerbiage) {
      logger.warn(`No labels for ${propName}, please fix this in 'common/models/labels.ts'`);
      comment = "";
    } else {
      comment = propVerbiage.description;
    }

    let options = { object, propName, comment };

    if (additionalOptions) options = extend(additionalOptions, options);

    yamlPropAdder(lines, withComments, options);

    return { add: adder };
  };

  return { add: adder };
}

function customizationToYAML(customization: Customization, withComments: boolean, logger: Logger): string[] {
  const { timezones, externalViews, cssVariables } = customization;
  const lines: string[] = [];

  getYamlPropAdder(customization, CUSTOMIZATION, lines, withComments, logger)
    .add("customLogoSvg")
    .add("headerBackground")
    .add("sentryDSN")
    .add("urlShortener");

  if (timezones && timezones.length) {
    lines.push("timezones:");
    lines.push(...timezones.map(tz => `- ${tz.toString()}`));
  }

  if (externalViews && externalViews.length) {
    lines.push("externalViews:");
    externalViews.forEach(({ title, linkGenerator }) => {
      lines.push(...yamlObject([
        `title: ${title}`,
        `linkGenerator: ${linkGenerator}`
      ]));
    });
  }

  if (cssVariables && Object.keys(cssVariables).length > 0) {
    if (withComments) {
      lines.push(...commentLines(CUSTOMIZATION.cssVariables.description));
    }
    lines.push("cssVariables:");
    lines.push(...yamlMap(cssVariables));
  }

  const pad = spaces(2);
  return lines.map(line => `${pad}${line}`);
}

function clusterToYAML(cluster: Cluster, withComments: boolean, logger: Logger): string[] {
  const lines: string[] = [
    `name: ${cluster.name}`
  ];

  const props = getYamlPropAdder(cluster, CLUSTER, lines, withComments, logger);

  props
    .add("url")
    .add("version")
    .add("timeout", { defaultValue: undefined })
    .add("sourceListScan", { defaultValue: DEFAULT_SOURCE_LIST_SCAN })
    .add("sourceListRefreshOnLoad", { defaultValue: false })
    .add("sourceListRefreshInterval", { defaultValue: DEFAULT_SOURCE_LIST_REFRESH_INTERVAL })
    .add("sourceReintrospectOnLoad", { defaultValue: false })
    .add("sourceReintrospectInterval", { defaultValue: DEFAULT_SOURCE_REINTROSPECT_INTERVAL })
  ;

  if (withComments) {
    lines.push(
      "",
      `# Database specific (${cluster.type}) ===============`
    );
  }
  switch (cluster.type) {
    case "druid":
      props
        .add("introspectionStrategy", { defaultValue: DEFAULT_INTROSPECTION_STRATEGY })
        .add("requestDecorator")
      ;
      break;
  }

  lines.push("");
  return yamlObject(lines);
}

function attributeToYAML(attribute: AttributeInfo): string[] {
  const lines: string[] = [
    `name: ${attribute.name}`,
    `type: ${attribute.type}`
  ];

  if (attribute.nativeType) {
    lines.push(`nativeType: ${attribute.nativeType}`);
  }

  lines.push("");
  return yamlObject(lines);
}

function dimensionToYAML(dimension: Dimension): string[] {
  const lines: string[] = [
    `name: ${dimension.name}`,
    `title: ${dimension.title}`
  ];

  if (dimension.kind !== "string") {
    lines.push(`kind: ${dimension.kind}`);
  }

  if (dimension.kind === "string" && dimension.multiValue) {
    lines.push("multiValue: true");
  }

  // TODO: We don't have proper formula! Maybe we should keep it in Dimension for yaml-helper? Seems weird :/
  lines.push(`formula: ${dimension.expression.toString()}`);

  lines.push("");
  return yamlObject(lines);
}

function measureToYAML(measure: Measure): string[] {
  const lines: string[] = [
    `name: ${measure.name}`,
    `title: ${measure.title}`
  ];

  if (measure.units) {
    lines.push(`units: ${measure.units}`);
  }

  // TODO: We don't have proper formula! Maybe we should keep it in Measure for yaml-helper? Seems weird :/
  lines.push(`formula: ${measure.expression.toString()}`);

  const format = measure.format;
  if (!!format) {
    lines.push(`format: ${format}`);
  }

  lines.push("");
  return yamlObject(lines);
}

function yamlArray(values: string[]) {
  return `[${values.map(s => `"${s}"`).join(", ")}]`;
}

function sourceToYAML(source: Source): string {
  if (!Array.isArray(source)) return source;
  return yamlArray(source);
}

function dataCubeToYAML(dataCube: DataCube, withComments: boolean, logger: Logger): string[] {
  let lines: string[] = [
    `name: ${dataCube.name}`,
    `title: ${dataCube.title}`,
    `clusterName: ${dataCube.clusterName}`,
    `source: ${sourceToYAML(dataCube.source)}`
  ];

  if (withComments) {
    lines.push("# The primary time attribute of the data refers to the attribute that must always be filtered on");
    lines.push("# This is particularly useful for Druid data cubes as they must always have a time filter.");
  }
  lines.push(`timeAttribute: ${dataCube.timeAttribute.name}`, "");

  const refreshRule = dataCube.refreshRule;
  if (withComments) {
    lines.push("# The refresh rule describes how often the data cube looks for new data. Default: 'query'/PT1M (every minute)");
  }
  lines.push("refreshRule:");
  lines.push(`  rule: ${refreshRule.rule}`);
  if (refreshRule.time) {
    lines.push(`  time: ${refreshRule.time.toISOString()}`);
  }
  lines.push("");

  const addProps = getYamlPropAdder(dataCube, DATA_CUBE, lines, withComments, logger);

  addProps
    .add("defaultTimezone", { defaultValue: DEFAULT_DEFAULT_TIMEZONE })
    .add("defaultDuration", { defaultValue: DEFAULT_DEFAULT_DURATION })
    .add("defaultSortMeasure", { defaultValue: dataCube.defaultSortMeasure })
  ;

  const defaultSelectedMeasures = dataCube.defaultSelectedMeasures ? dataCube.defaultSelectedMeasures : null;
  if (withComments) {
    lines.push("", "# The names of measures that are selected by default");
  }
  if (defaultSelectedMeasures) {
    lines.push(`defaultSelectedMeasures: ${JSON.stringify(defaultSelectedMeasures)}`);
  } else if (withComments) {
    lines.push("#defaultSelectedMeasures: []");
  }

  const defaultPinnedDimensions = dataCube.defaultPinnedDimensions ? dataCube.defaultPinnedDimensions : null;
  if (withComments) {
    lines.push("", "# The names of dimensions that are pinned by default (in order that they will appear in the pin bar)");
  }
  if (defaultPinnedDimensions) {
    lines.push("", `defaultPinnedDimensions: ${JSON.stringify(defaultPinnedDimensions)}`);
  } else if (withComments) {
    lines.push("", "#defaultPinnedDimensions: []");
  }

  const introspection = dataCube.introspection;
  if (withComments) {
    lines.push(
      "",
      "# How the dataset should be introspected",
      "# possible options are:",
      "# * none - Do not do any introspection, take what is written in the config as the rule of law.",
      "# * no-autofill - Introspect the datasource but do not automatically generate dimensions or measures",
      "# * autofill-dimensions-only - Introspect the datasource, automatically generate dimensions only",
      "# * autofill-measures-only - Introspect the datasource, automatically generate measures only",
      "# * autofill-all - (default) Introspect the datasource, automatically generate dimensions and measures"
    );
  }
  lines.push(`introspection: ${introspection}`);

  const attributeOverrides = dataCube.attributeOverrides;
  if (withComments) {
    lines.push("", "# The list of attribute overrides in case introspection get something wrong");
  }
  lines.push("attributeOverrides:");
  if (withComments) {
    lines.push(
      "  # A general attribute override looks like so:",
      "  #",
      "  # name: user_unique",
      "  # ^ the name of the attribute (the column in the database)",
      "  #",
      "  # type: STRING",
      "  # ^ (optional) plywood type of the attribute",
      "  #",
      "  # special: unique",
      "  # ^ (optional) any kind of special significance associated with this attribute",
      ""
    );
  }
  lines = lines.concat.apply(lines, attributeOverrides.map(attributeToYAML));

  if (withComments) {
    lines.push("", "# The list of dimensions defined in the UI. The order here will be reflected in the UI");
  }
  lines.push("dimensions:");
  if (withComments) {
    lines.push(
      "  # A general dimension looks like so:",
      "  #",
      "  # name: channel",
      "  # ^ the name of the dimension as used in the URL (you should try not to change these)",
      "  #",
      "  # title: The Channel",
      "  # ^ (optional) the human readable title. If not set a title is generated from the 'name'",
      "  #",
      "  # kind: string",
      "  # ^ (optional) the kind of the dimension. Can be 'string', 'time', 'number', or 'boolean'. Defaults to 'string'",
      "  #",
      "  # formula: $channel",
      "  # ^ (optional) the Plywood bucketing expression for this dimension. Defaults to '$name'",
      "  #   if, say, channel was called 'cnl' in the data you would put '$cnl' here",
      "  #   See also the expressions API reference: https://plywood.imply.io/expressions",
      "  #",
      "  # url: string",
      "  # ^ (optional) a url (including protocol) associated with the dimension, with optional token '%s'",
      "  #   that is replaced by the dimension value to generate links specific to each value.",
      ""
    );
  }
  lines = lines.concat.apply(lines, allDimensions(dataCube.dimensions).map(dimensionToYAML));
  if (withComments) {
    lines.push(
      "  # This is the place where you might want to add derived dimensions.",
      "  #",
      "  # Here are some examples of possible derived dimensions:",
      "  #",
      "  # - name: is_usa",
      "  #   title: Is USA?",
      "  #   formula: $country == 'United States'",
      "  #",
      "  # - name: file_version",
      "  #   formula: $filename.extract('(\\d+\\.\\d+\\.\\d+)')",
      ""
    );
  }

  if (withComments) {
    lines.push("", "# The list of measures defined in the UI. The order here will be reflected in the UI");
  }
  lines.push("measures:");
  if (withComments) {
    lines.push(
      "  # A general measure looks like so:",
      "  #",
      "  # name: avg_revenue",
      "  # ^ the name of the dimension as used in the URL (you should try not to change these)",
      "  #",
      "  # title: Average Revenue",
      "  # ^ (optional) the human readable title. If not set a title is generated from the 'name'",
      "  #",
      "  # formula: $main.sum($revenue) / $main.sum($volume) * 10",
      "  # ^ (optional) the Plywood bucketing expression for this dimension.",
      "  #   Usually defaults to '$main.sum($name)' but if the name contains 'min' or 'max' will use that as the aggregate instead of sum.",
      "  #   this is the place to define your fancy formulas",
      ""
    );
  }
  lines = lines.concat.apply(lines, allMeasures(dataCube.measures).map(measureToYAML));
  if (withComments) {
    lines.push(
      "  # This is the place where you might want to add derived measures (a.k.a Post Aggregators).",
      "  #",
      "  # Here are some examples of possible derived measures:",
      "  #",
      "  # - name: ecpm",
      "  #   title: eCPM",
      "  #   formula: $main.sum($revenue) / $main.sum($impressions) * 1000",
      "  #",
      "  # - name: usa_revenue",
      "  #   title: USA Revenue",
      "  #   formula: $main.filter($country == 'United States').sum($revenue)",
      ""
    );
  }

  lines.push("");
  return yamlObject(lines);
}

interface Extra {
  header?: boolean;
  version?: string;
  verbose?: boolean;
  port?: number;
}

export function printExtra(extra: Extra, withComments: boolean): string {
  const lines = [];

  if (extra.header && extra.version) {
    lines.push(
      `# generated by Turnilo version ${extra.version}`,
      `# for a more detailed walk-through go to: https://github.com/allegro/turnilo/blob/${extra.version}/docs/configuration.md`,
      ""
    );
  }

  if (extra.verbose) {
    if (withComments) {
      lines.push("# Run Turnilo in verbose mode so it prints out the queries that it issues");
    }
    lines.push("verbose: true", "");
  }

  if (extra.port) {
    if (withComments) {
      lines.push("# The port on which the Turnilo server will listen on");
    }
    lines.push(`port: ${extra.port}`, "");
  }

  return lines.join("\n");
}

export function sourcesToYaml(sources: Sources, withComments: boolean, logger: Logger): string {
  const { dataCubes, clusters } = sources;

  if (!dataCubes.length) throw new Error("Could not find any data cubes, please verify network connectivity");

  let lines: string[] = [];

  if (clusters.length) {
    lines.push("clusters:");
    lines = lines.concat.apply(lines, clusters.map(c => clusterToYAML(c, withComments, logger)));
  }

  lines.push("dataCubes:");
  lines = lines.concat.apply(lines, dataCubes.map(d => dataCubeToYAML(d, withComments, logger)));

  return lines.join("\n");
}

export function appSettingsToYaml(settings: AppSettings, withComments: boolean, logger: Logger): string {
  // TODO: shouldn't we print oauth and clientTimeout?
  const { customization, oauth, clientTimeout } = settings;

  const lines = [];

  if (customization) {
    lines.push("customization:");
    lines.push(...customizationToYAML(customization, withComments, logger));
  }

  return lines.join("\n");
}
