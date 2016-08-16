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

import * as yaml from 'js-yaml';

import { $, AttributeInfo, RefExpression } from 'plywood';
import { DataCube, Dimension, Measure, Cluster, AppSettings, Collection, CollectionItem } from '../../../common/models/index';
import { DATA_CUBE, DIMENSION, MEASURE, CLUSTER, COLLECTION, COLLECTION_ITEM } from '../../../common/models/labels';

function spaces(n: number) {
  return (new Array(n + 1)).join(' ');
}

function extend(a: any, b: any): any {
  for (let key in a) {
    b[key] = a[key];
  }

  return b;
}

function yamlObject(lines: string[], indent = 2): string[] {
  var pad = spaces(indent);
  return lines.map((line, i) => {
    if (line === '') return '';
    return pad + (i ? '  ' : '- ') + line;
  });
}

interface PropAdderOptions {
  object: any;
  propName: string;
  comment?: string;
  defaultValue?: any;
}

function yamlPropAdder(lines: string[], withComments: boolean, options: PropAdderOptions): void {
  const { object, propName, defaultValue, comment } = options;

  var value = object[propName];
  if (value == null) {
    if (withComments && typeof defaultValue !== "undefined") {
      lines.push(
        '',
        `# ${comment}`,
        `#${propName}: ${defaultValue} # <- default`
      );
    }
  } else {
    if (withComments) lines.push(
      '',
      `# ${comment}`
    );
    lines.push(`${propName}: ${value}`);
  }
}

function getYamlPropAdder(object: any, labels: any, lines: string[], withComments = false) {
  var adder = (propName: string, additionalOptions?: {defaultValue?: any}) => {
    let propVerbiage = labels[propName];
    let comment: string;

    if (!propVerbiage) {
      console.warn(`No labels for ${propName}, please fix this in 'common/models/labels.ts'`);
      comment = '';
    } else {
      comment = propVerbiage.description;
    }

    let options = {object, propName, comment};

    if (additionalOptions) options = extend(additionalOptions, options);

    yamlPropAdder(lines, withComments, options);

    return {add: adder};
  };

  return {add: adder};
}

export function clusterToYAML(cluster: Cluster, withComments: boolean): string[] {
  var lines: string[] = [
    `name: ${cluster.name}`
  ];

  var props = getYamlPropAdder(cluster, CLUSTER, lines, withComments);

  props
    .add('type')
    .add('host')
    .add('version')
    .add('timeout', {defaultValue: Cluster.DEFAULT_TIMEOUT})
    .add('sourceListScan', {defaultValue: Cluster.DEFAULT_SOURCE_LIST_SCAN})
    .add('sourceListRefreshOnLoad', {defaultValue: false})
    .add('sourceListRefreshInterval', {defaultValue: Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL})
    .add('sourceReintrospectOnLoad', {defaultValue: false})
    .add('sourceReintrospectInterval', {defaultValue: Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL})
    ;


  if (withComments) {
    lines.push(
      '',
      `# Database specific (${cluster.type}) ===============`
    );
  }
  switch (cluster.type) {
    case 'druid':
      props
        .add('introspectionStrategy', {defaultValue: Cluster.DEFAULT_INTROSPECTION_STRATEGY})
        .add('requestDecorator')
        ;
      break;

    case 'postgres':
    case 'mysql':
      props
        .add('database')
        .add('user')
        .add('password')
        ;

      break;
  }

  lines.push('');
  return yamlObject(lines);
}

export function collectionToYAML(collection: Collection, withComments: boolean): string[] {
  var lines: string[] = [
    `name: ${collection.name}`
  ];

  var addProps = getYamlPropAdder(collection, COLLECTION, lines, withComments);

  addProps
    .add('title')
    .add('description')
    ;

  lines.push('items:');
  lines = lines.concat.apply(lines, collection.items.map(collectionItemToYAML));

  lines.push('');
  return yamlObject(lines);
}

export function collectionItemToYAML(item: CollectionItem): string[] {
  var lines: string[] = [
    `name: ${item.name}`
  ];

  var addProps = getYamlPropAdder(item, COLLECTION_ITEM, lines);

  addProps
    .add('title')
    .add('description')
    .add('group')
    .add('dataCube')
    ;

  lines.push(`essence:`);
  lines.push(yaml.safeDump(item.essence.toJSON()));

  lines.push('');
  return yamlObject(lines);
}


export function attributeToYAML(attribute: AttributeInfo): string[] {
  var lines: string[] = [
    `name: ${attribute.name}`,
    `type: ${attribute.type}`
  ];

  if (attribute.special) {
    lines.push(`special: ${attribute.special}`);
  }

  lines.push('');
  return yamlObject(lines);
}

export function dimensionToYAML(dimension: Dimension): string[] {
  var lines: string[] = [
    `name: ${dimension.name}`,
    `title: ${dimension.title}`
  ];

  if (dimension.kind !== 'string') {
    lines.push(`kind: ${dimension.kind}`);
  }

  lines.push(`formula: ${dimension.formula}`);

  lines.push('');
  return yamlObject(lines);
}

export function measureToYAML(measure: Measure): string[] {
  var lines: string[] = [
    `name: ${measure.name}`,
    `title: ${measure.title}`
  ];

  if (measure.units) {
    lines.push(`units: ${measure.units}`);
  }

  lines.push(`formula: ${measure.formula}`);

  var format = measure.format;
  if (!!format) {
    lines.push(`format: ${format}`);
  }

  lines.push('');
  return yamlObject(lines);
}

export function dataCubeToYAML(dataCube: DataCube, withComments: boolean): string[] {
  var lines: string[] = [
    `name: ${dataCube.name}`,
    `title: ${dataCube.title}`,
    `clusterName: ${dataCube.clusterName}`,
    `source: ${dataCube.source}`
  ];

  var timeAttribute = dataCube.timeAttribute;
  if (timeAttribute && !(dataCube.clusterName === 'druid' && timeAttribute.name === '__time')) {
    if (withComments) {
      lines.push(`# The primary time attribute of the data refers to the attribute that must always be filtered on`);
      lines.push(`# This is particularly useful for Druid data cubes as they must always have a time filter.`);
    }
    lines.push(`timeAttribute: ${timeAttribute.name}`, '');
  }


  var refreshRule = dataCube.refreshRule;
  if (withComments) {
    lines.push("# The refresh rule describes how often the data cube looks for new data. Default: 'query'/PT1M (every minute)");
  }
  lines.push(`refreshRule:`);
  lines.push(`  rule: ${refreshRule.rule}`);
  if (refreshRule.time) {
    lines.push(`  time: ${refreshRule.time.toISOString()}`);
  }
  if (refreshRule.refresh) {
    lines.push(`  refresh: ${refreshRule.refresh.toString()}`);
  }
  lines.push('');

  var addProps = getYamlPropAdder(dataCube, DATA_CUBE, lines, withComments);

  addProps
    .add('defaultTimezone', {defaultValue: DataCube.DEFAULT_DEFAULT_TIMEZONE})
    .add('defaultDuration', {defaultValue: DataCube.DEFAULT_DEFAULT_DURATION})
    .add('defaultSortMeasure', {defaultValue: dataCube.getDefaultSortMeasure()})
    ;


  var defaultSelectedMeasures = dataCube.defaultSelectedMeasures ? dataCube.defaultSelectedMeasures.toArray() : null;
  if (withComments) {
    lines.push('', "# The names of measures that are selected by default");
  }
  if (defaultSelectedMeasures) {
    lines.push(`defaultSelectedMeasures: ${JSON.stringify(defaultSelectedMeasures)}`);
  } else if (withComments) {
    lines.push(`#defaultSelectedMeasures: []`);
  }


  var defaultPinnedDimensions = dataCube.defaultPinnedDimensions ? dataCube.defaultPinnedDimensions.toArray() : null;
  if (withComments) {
    lines.push('', "# The names of dimensions that are pinned by default (in order that they will appear in the pin bar)");
  }
  if (defaultPinnedDimensions) {
    lines.push('', `defaultPinnedDimensions: ${JSON.stringify(defaultPinnedDimensions)}`);
  } else if (withComments) {
    lines.push('', `#defaultPinnedDimensions: []`);
  }


  var introspection = dataCube.getIntrospection();
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


  var attributeOverrides = dataCube.attributeOverrides;
  if (withComments) {
    lines.push('', "# The list of attribute overrides in case introspection get something wrong");
  }
  lines.push('attributeOverrides:');
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


  var dimensions = dataCube.dimensions.toArray();
  if (withComments) {
    lines.push('', "# The list of dimensions defined in the UI. The order here will be reflected in the UI");
  }
  lines.push('dimensions:');
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
  lines = lines.concat.apply(lines, dimensions.map(dimensionToYAML));
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


  var measures = dataCube.measures.toArray();
  if (withComments) {
    lines.push('', "# The list of measures defined in the UI. The order here will be reflected in the UI");
  }
  lines.push(`measures:`);
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
  lines = lines.concat.apply(lines, measures.map(measureToYAML));
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

  lines.push('');
  return yamlObject(lines);
}


export interface Extra {
  header?: boolean;
  version?: string;
  verbose?: boolean;
  port?: number;
}

export function appSettingsToYAML(appSettings: AppSettings, withComments: boolean, extra: Extra = {}): string {
  var { dataCubes, clusters, collections } = appSettings;

  if (!dataCubes.length) throw new Error('Could not find any data cubes, please verify network connectivity');

  var lines: string[] = [];

  if (extra.header && extra.version) {
    lines.push(
      `# generated by Pivot version ${extra.version}`,
      `# for a more detailed walk-through go to: https://github.com/implydata/pivot/blob/v${extra.version}/docs/configuration.md`,
      ''
    );
  }

  if (extra.verbose) {
    if (withComments) {
      lines.push("# Run Pivot in verbose mode so it prints out the queries that it issues");
    }
    lines.push(`verbose: true`, '');
  }

  if (extra.port) {
    if (withComments) {
      lines.push("# The port on which the Pivot server will listen on");
    }
    lines.push(`port: ${extra.port}`, '');
  }

  if (clusters.length) {
    lines.push('clusters:');
    lines = lines.concat.apply(lines, clusters.map(c => clusterToYAML(c, withComments)));
  }

  lines.push('dataCubes:');
  lines = lines.concat.apply(lines, dataCubes.map(d => dataCubeToYAML(d, withComments)));

  // if (collections.length) {
  //   lines.push('collections:');
  //   lines = lines.concat.apply(lines, collections.map(c => collectionToYAML(c, withComments)));

  // }

  return lines.join('\n');
}
