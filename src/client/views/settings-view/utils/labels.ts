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

export const DIMENSION_EDIT = {
  name: {
    label: `Name (you won't be able to change this later)`,
    help: `The name of the dimension. This does not have to correspond to the
      attribute name (but the auto generated dimensions do). This should be a
      URL safe string. Changing this property will break any URLs that someone
      might have generated that include this dimension, that's why you can only
      set it once`,
    error: ``
  },
  title: {
    label: `Title`,
    help: `The title for this dimension in the UI. Can be anything and is safe
    to change at any time.`,
    error: ``
  },
  kind: {
    label: `Kind`,
    help: `The dimension's kind`,
    error: ``
  },
  formula: {
    label: `Formula`,
    help: `The formula for this dimension. By default it is <code>$name</code> where <em>name</em> is
      the name of the dimension. You can create derived dimensions by using
      non-trivial formulas.`,
    error: ``
  },
  url: {
    label: `URL`,
    help: `A url associated with the dimension, with optional token '%s' that
    is replaced by the dimension value to generate a link specific to each value.`,
    error: ``
  },
  granularities: {
    label: `Granularities`,
    help: `A set of exactly 5 granularities that you want to be available for bucketing.`,
    error: ``
  }
};

export const MEASURE_EDIT = {
  name: {
    label: `Name (you won't be able to change this later)`,
    help: `The name of the measure. This should be a
      URL safe string. Changing this property will break any URLs that someone
      might have generated that include this dimension, that's why you can only
      set it once`,
    error: ``
  },
  title: {
    label: `Title`,
    help: `The title for this measure in the UI. Can be anything and is safe
    to change at any time.`,
    error: ``
  },
  formula: {
    label: `Formula`,
    help: `The <a href="http://plywood.imply.io/expressions" target="_blank">
      Plywood expression</a> for this dimension. By default it is
      <code>$main.sum($name)</code> where <em>name</em> is the name of the measure.`,
    error: ``
  }
};

export const CLUSTER_EDIT = {
  type: {
    label: 'Type',
    help: 'The database type of the cluster',
    error: ''
  },
  host: {
    label: 'Host',
    help: 'The host (hostname:port) of the cluster. In the Druid case this must be the broker.',
    error: 'An IP address must be compliant with the IPv4 standard. It should look like this: 127.0.0.1:8080'
  },
  version: {
    label: 'Version',
    help: 'The explicit version to use for this cluster. This does not need to be defined ' +
    'as the version will naturally be determined through introspection.',
    error: ''
  },
  timeout: {
    label: 'Timeout',
    help: 'The timeout to set on the queries in ms. Default: 40000',
    error: 'The timeout can only contain numbers. It should look like this: 30000'
  },
  sourceListScan: {
    label: 'Source List Scan',
    help: 'Should the sources of this cluster be automatically scanned and new sources added as data cubes. Default: \'disable\'',
    error: ''
  },
  sourceListRefreshOnLoad: {
    label: 'Source List Refresh On Load',
    help: `Should the list of sources be reloaded every time that Pivot is
    loaded. This will put additional load on the data store but will ensure that
    sources are visible in the UI as soon as they are created.`,
    error: 'The refresh interval can only contain numbers. It should look like this: 15000'
  },
  sourceListRefreshInterval: {
    label: 'Source List Refresh Interval',
    help: 'How often should sources be reloaded in ms.',
    error: 'should be a number'
  },
  sourceReintrospectOnLoad: {
    label: 'Source Reintrospect On Load',
    help: `Should sources be scanned for additional dimensions every time that
      Pivot is loaded. This will put additional load on the data store but will
      ensure that dimension are visible in the UI as soon as they are created.`,
    error: ''
  },
  sourceReintrospectInterval: {
    label: 'Source Reintrospect Interval',
    help: 'How often should source schema be reloaded in ms.',
    error: 'should be a number'
  },

  // Druid specific
  introspectionStrategy: {
    label: 'Introspection Strategy',
    help: 'The introspection strategy for the Druid external.',
    error: ''
  },

  // PostGres + MySQL specific
  database: {
    label: 'Database',
    help: 'The database to which to connect to.',
    error: ''
  },
  user: {
    label: 'User',
    help: 'The user to connect as. This user needs no permissions other than SELECT.',
    error: ''
  },
  password: {
    label: 'Password',
    help: 'The password to use with the provided user.',
    error: ''
  }
};


export const GENERAL = {
  title: {
    error: 'The title should not be empty',
    help: 'What will appear as the tab\'s title in your browser. Use \'%v\' as a placeholder for Pivot\'s version.'
  },
  timezones: {
    error: 'The timezones should be an array',
    help: 'The possible timezones'
  }
};

export const DATA_CUBE_EDIT = {
  title: {
    label: 'Title',
    help: 'What will appear as the tab\'s title in your browser. Use \'%v\' as a placeholder for Pivot\'s version.',
    error: 'The title should not be empty'
  },
  description: {
    label: 'Description',
    help: 'A description shown in the homepage',
    error: ''
  },
  introspection: {
    label: 'Introspection',
    help: 'How will this cube be introspected. Default is \'no-autofill\'',
    error: ''
  },
  clusterName: {
    label: 'Cluster',
    help: 'The cluster that this cube comes from',
    error: 'The cluster name should not be empty'
  },
  source: {
    label: 'Source',
    help: 'The name of cube\'s source. The dataSource, table, of filename of the data for this cube',
    error: 'The source should not be empty'
  },
  subsetFormula: {
    label: 'Subset Formula',
    help: 'A row level filter that is applied to the cube. This filter is never represented in the UI',
    error: ''
  },
  defaultDuration: {
    label: 'Default duration',
    help: `The time period, expressed as an
      <a href="https://en.wikipedia.org/wiki/ISO_8601#Durations" target="_blank">
      ISO 8601 Duration</a>, that will be shown when the user first opens this
      cube. Default P1D (1 day).`,
    error: 'Must be an ISO 8601 Duration'
  },
  defaultTimezone: {
    label: 'Default timezone',
    help: `The default timezone, expressed as an
      <a href="https://en.wikipedia.org/wiki/Tz_database" target="_blank">
      Olsen Timezone</a>, that will be selected when the user first opens this
      cube. Default Etc/UTC.`,
    error: 'Must be a valid timezone'
  },
  defaultSortMeasure: {
    label: 'Default sort measure',
    help: `The name of the measure that will be used for default sorting.
      It is commonly set to the measure that represents the count of events.
      Default: the first measure.`,
    error: ''
  },
  attributeOverrides: {
    label: `Attribute overrides`,
    help: `While Pivot tries to learn as much as it can from your data cube
      from Druid directly. It can not (yet) do a perfect job.
      The attributeOverrides: section of the data cube is there for you to fix that.`
  }
};
