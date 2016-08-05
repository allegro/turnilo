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

import { DataCube, Dimension, Measure, Cluster } from './index';

export const DIMENSION = {
  name: {
    label: `Name (you won't be able to change this later)`,
    description: `The name of the dimension. This does not have to correspond to the
      attribute name (but the auto generated dimensions do). This should be a
      URL safe string. Changing this property will break any URLs that someone
      might have generated that include this dimension, that's why you can only
      set it once`
  },
  title: {
    label: `Title`,
    description: `The title for this dimension in the UI. Can be anything and is safe
    to change at any time.`
  },
  kind: {
    label: `Kind`,
    description: `The dimension's kind`
  },
  formula: {
    label: `Formula`,
    description: `The formula for this dimension. By default it is <code>$name</code> where <em>name</em> is
      the name of the dimension. You can create derived dimensions by using
      non-trivial formulas.`
  },
  url: {
    label: `URL`,
    description: `A url associated with the dimension, with optional token '%s' that
    is replaced by the dimension value to generate a link specific to each value.`
  },
  granularities: {
    label: `Granularities`,
    description: `A set of exactly 5 granularities that you want to be available for bucketing.`
  }
};

export const MEASURE = {
  name: {
    label: `Name (you won't be able to change this later)`,
    description: `The name of the measure. This should be a
      URL safe string. Changing this property will break any URLs that someone
      might have generated that include this dimension, that's why you can only
      set it once`
  },
  title: {
    label: `Title`,
    description: `The title for this measure in the UI. Can be anything and is safe
    to change at any time.`
  },
  units: {
    label: `Units`,
    description: `The units for this measure. To be shown alongside the title.`
  },
  formula: {
    label: `Formula`,
    description: `The <a href="http://plywood.imply.io/expressions" target="_blank">
      Plywood expression</a> for this dimension. By default it is
      <code>$main.sum($name)</code> where <em>name</em> is the name of the measure.`
  }
};

export const CLUSTER = {
  name: {
    label: 'Name',
    description: `The name of the cluster (to be referenced later from the data cube)`
  },
  type: {
    label: 'Type',
    description: 'The database type of the cluster'
  },
  host: {
    label: 'Host',
    description: 'The host (hostname:port) of the cluster. In the Druid case this must be the broker.'
  },
  version: {
    label: 'Version',
    description: 'The explicit version to use for this cluster. This does not need to be defined ' +
    'as the version will naturally be determined through introspection.'
  },
  timeout: {
    label: 'Timeout',
    description: `The timeout to set on the queries in ms. Default is <code>${Cluster.DEFAULT_TIMEOUT}</code>`
  },
  sourceListScan: {
    label: 'Source List Scan',
    description: `Should the sources of this cluster be automatically scanned and new
      sources added as data cubes. Default: <code>${Cluster.DEFAULT_SOURCE_LIST_SCAN}</code>`
  },
  sourceListRefreshOnLoad: {
    label: 'Source List Refresh On Load',
    description: `Should the list of sources be reloaded every time that Pivot is
    loaded. This will put additional load on the data store but will ensure that
    sources are visible in the UI as soon as they are created.`
  },
  sourceListRefreshInterval: {
    label: 'Source List Refresh Interval',
    description: `How often should sources be reloaded in ms. Default: <code>${Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL}</code>`
  },
  sourceReintrospectOnLoad: {
    label: 'Source Reintrospect On Load',
    description: `Should sources be scanned for additional dimensions every time that
      Pivot is loaded. This will put additional load on the data store but will
      ensure that dimension are visible in the UI as soon as they are created. Default: <code>${Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL}</code>`
  },
  sourceReintrospectInterval: {
    label: 'Source Reintrospect Interval',
    description: 'How often should source schema be reloaded in ms.'
  },

  // Druid specific
  introspectionStrategy: {
    label: 'Introspection Strategy',
    description: 'The introspection strategy for the Druid external.'
  },

  // PostGres + MySQL specific
  database: {
    label: 'Database',
    description: 'The database to which to connect to.'
  },
  user: {
    label: 'User',
    description: 'The user to connect as. This user needs no permissions other than SELECT.'
  },
  password: {
    label: 'Password',
    description: 'The password to use with the provided user.'
  }
};


export const GENERAL = {
  'customization.title': {
    label: 'Title',
    description: 'What will appear as the tab\'s title in your browser. Use <code>%v</code> as a placeholder for Pivot\'s version.'
  },
  'customization.timezones': {
    label: 'Timezones',
    description: `You can customize the timezones that appear in the header bar
      dropdown by providing an array of timezone strings.`
  }
};

export const DATA_CUBE = {
  name: {
    label: 'Name',
    description: `The name of the data cube as used internally in Pivot and used in the
      URLs. This should be a URL safe string. Changing this property for a given
      data cube will break any URLs that someone might have generated for that
      data cube in the past.`
  },
  title: {
    label: 'Title',
    description: `The user visible name that will be used to describe this data cube in
      the UI. It is always safe to change this.`
  },
  description: {
    label: 'Description',
    description: 'The description of the data cube shown in the homepage.'
  },
  introspection: {
    label: 'Introspection',
    description: `How will this cube be introspected. Default: <code>${DataCube.DEFAULT_INTROSPECTION}</code>`
  },
  clusterName: {
    label: 'Cluster',
    description: `The cluster that the data cube belongs to (or <code>native</code>
      if this is a file based data cube)`
  },
  source: {
    label: 'Source',
    description: 'The name of cube\'s source. The dataSource, table, of filename of the data for this cube'
  },
  subsetFormula: {
    label: 'Subset Formula',
    description: 'A row level filter that is applied to the cube. This filter is never represented in the UI'
  },
  defaultDuration: {
    label: 'Default duration',
    description: `The time period, expressed as an
      <a href="https://en.wikipedia.org/wiki/ISO_8601#Durations" target="_blank">
      ISO 8601 Duration</a>, that will be shown when the user first opens this
      cube. Default: <code>${DataCube.DEFAULT_DEFAULT_DURATION}</code>.`
  },
  defaultTimezone: {
    label: 'Default timezone',
    description: `The default timezone, expressed as an
      <a href="https://en.wikipedia.org/wiki/Tz_database" target="_blank">
      Olsen Timezone</a>, that will be selected when the user first opens this
      cube. Default: <code>${DataCube.DEFAULT_DEFAULT_TIMEZONE}</code>.`
  },
  defaultSortMeasure: {
    label: 'Default sort measure',
    description: `The name of the measure that will be used for default sorting.
      It is commonly set to the measure that represents the count of events.
      Default: the first measure.`
  },
  attributeOverrides: {
    label: `Attribute overrides`,
    description: `While Pivot tries to learn as much as it can from your data cube
      from Druid directly. It can not (yet) do a perfect job.
      The attributeOverrides: section of the data cube is there for you to fix that.`
  }
};
