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

import { Class, Instance, isInstanceOf, immutableArraysEqual, immutableEqual } from 'immutable-class';
import { Executor, helper } from 'plywood';
import { hasOwnProperty } from '../../utils/general/general';
import { Cluster, ClusterJS } from '../cluster/cluster';
import { Customization, CustomizationJS } from '../customization/customization';
import { DataSource, DataSourceJS } from  '../data-source/data-source';
import { LinkViewConfig, LinkViewConfigJS } from '../link-view-config/link-view-config';
import { Manifest } from '../manifest/manifest';

export interface AppSettingsValue {
  clusters?: Cluster[];
  customization?: Customization;
  dataSources?: DataSource[];
  linkViewConfig?: LinkViewConfig;
}

export interface AppSettingsJS {
  clusters?: ClusterJS[];
  customization?: CustomizationJS;
  dataSources?: DataSourceJS[];
  linkViewConfig?: LinkViewConfigJS;
}

export interface AppSettingsContext {
  visualizations: Manifest[];
  executorFactory?: (dataSource: DataSource) => Executor;
}

var check: Class<AppSettingsValue, AppSettingsJS>;
export class AppSettings implements Instance<AppSettingsValue, AppSettingsJS> {
  static BLANK = AppSettings.fromJS({}, { visualizations: [] });

  static isAppSettings(candidate: any): candidate is AppSettings {
    return isInstanceOf(candidate, AppSettings);
  }

  static fromJS(parameters: AppSettingsJS, context?: AppSettingsContext): AppSettings {
    if (!context) throw new Error('AppSettings must have context');
    var clusters: Cluster[];
    if (parameters.clusters) {
      clusters = parameters.clusters.map(cluster => Cluster.fromJS(cluster));

    } else if (hasOwnProperty(parameters, 'druidHost') || hasOwnProperty(parameters, 'brokerHost')) {
      var clusterJS: any = JSON.parse(JSON.stringify(parameters));
      clusterJS.name = 'druid';
      clusterJS.type = 'druid';
      clusterJS.host = clusterJS.druidHost || clusterJS.brokerHost;
      clusters = [Cluster.fromJS(clusterJS)];

    } else {
      clusters = [];
    }

    var executorFactory = context.executorFactory;
    var dataSources = (parameters.dataSources || []).map(dataSourceJS => {
      var dataSourceClusterName = dataSourceJS.clusterName || (dataSourceJS as any).engine;
      if (dataSourceClusterName !== 'native') {
        var cluster = helper.findByName(clusters, dataSourceClusterName);
        if (!cluster) throw new Error(`Can not find cluster '${dataSourceClusterName}' for data source '${dataSourceJS.name}'`);
      }

      var dataSourceObject = DataSource.fromJS(dataSourceJS, { cluster });
      if (executorFactory) {
        var executor = executorFactory(dataSourceObject);
        if (executor) dataSourceObject = dataSourceObject.attachExecutor(executor);
      }
      return dataSourceObject;
    });

    var value: AppSettingsValue = {
      clusters,
      customization: Customization.fromJS(parameters.customization || {}),
      dataSources,
      linkViewConfig: parameters.linkViewConfig ? LinkViewConfig.fromJS(parameters.linkViewConfig, { dataSources, visualizations: context.visualizations }) : null
    };

    return new AppSettings(value);
  }

  public clusters: Cluster[];
  public customization: Customization;
  public dataSources: DataSource[];
  public linkViewConfig: LinkViewConfig;

  constructor(parameters: AppSettingsValue) {
    const {
      clusters,
      customization,
      dataSources,
      linkViewConfig
    } = parameters;

    for (var dataSource of dataSources) {
      if (dataSource.clusterName === 'native') continue;
      if (!helper.findByName(clusters, dataSource.clusterName)) {
        throw new Error(`data source ${dataSource.name} refers to an unknown cluster ${dataSource.clusterName}`);
      }
    }

    this.clusters = clusters;
    this.customization = customization;
    this.dataSources = dataSources;
    this.linkViewConfig = linkViewConfig;
  }

  public valueOf(): AppSettingsValue {
    return {
      clusters: this.clusters,
      customization: this.customization,
      dataSources: this.dataSources,
      linkViewConfig: this.linkViewConfig
    };
  }

  public toJS(): AppSettingsJS {
    var js: AppSettingsJS = {};
    js.clusters = this.clusters.map(cluster => cluster.toJS());
    js.customization = this.customization.toJS();
    js.dataSources = this.dataSources.map(dataSource => dataSource.toJS());
    if (this.linkViewConfig) js.linkViewConfig = this.linkViewConfig.toJS();
    return js;
  }

  public toJSON(): AppSettingsJS {
    return this.toJS();
  }

  public toString(): string {
    return `[AppSettings dataSources=${this.dataSources.length}]`;
  }

  public equals(other: AppSettings): boolean {
    return AppSettings.isAppSettings(other) &&
      immutableArraysEqual(this.clusters, other.clusters) &&
      immutableEqual(this.customization, other.customization) &&
      immutableArraysEqual(this.dataSources, other.dataSources) &&
      Boolean(this.linkViewConfig) === Boolean(other.linkViewConfig);
  }

  public toClientSettings(): AppSettings {
    var value = this.valueOf();

    value.clusters = value.clusters.map((c) => c.toClientCluster());

    value.dataSources = value.dataSources
      .filter((ds) => ds.isQueryable())
      .map((ds) => ds.toClientDataSource());

    return new AppSettings(value);
  }

  public getDataSourcesForCluster(clusterName: string): DataSource[] {
    return this.dataSources.filter(dataSource => dataSource.clusterName === clusterName);
  }

  public getDataSource(dataSourceName: string): DataSource {
    return helper.findByName(this.dataSources, dataSourceName);
  }

  public addOrUpdateDataSource(dataSource: DataSource): AppSettings {
    var value = this.valueOf();
    value.dataSources = helper.overrideByName(value.dataSources, dataSource);
    return new AppSettings(value);
  }

  public attachExecutors(executorFactory: (dataSource: DataSource) => Executor): AppSettings {
    var value = this.valueOf();
    value.dataSources = value.dataSources.map((ds) => {
      var executor = executorFactory(ds);
      if (executor) ds = ds.attachExecutor(executor);
      return ds;
    });
    return new AppSettings(value);
  }

  changeCustomization(customization: Customization): AppSettings {
    var value = this.valueOf();
    value.customization = customization;
    return new AppSettings(value);
  }

  changeClusters(clusters: Cluster[]): AppSettings {
    var value = this.valueOf();
    value.clusters = clusters;
    return new AppSettings(value);
  }

  addCluster(cluster: Cluster): AppSettings {
    return this.changeClusters(helper.overrideByName(this.clusters, cluster));
  }

  changeDataSources(dataSources: DataSource[]): AppSettings {
    var value = this.valueOf();
    value.dataSources = dataSources;
    return new AppSettings(value);
  }

  addDataSource(dataSource: DataSource): AppSettings {
    return this.changeDataSources(helper.overrideByName(this.dataSources, dataSource));
  }

  filterDataSources(fn: (dataSource: DataSource, index?: number, dataSources?: DataSource[]) => boolean): AppSettings {
    var value = this.valueOf();
    value.dataSources = value.dataSources.filter(fn);
    return new AppSettings(value);
  }

}
check = AppSettings;
