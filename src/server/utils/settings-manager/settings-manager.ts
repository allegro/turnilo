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

import { Dataset, External } from "plywood";
import { Logger } from "../../../common/logger/logger";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { Cluster } from "../../../common/models/cluster/cluster";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { noop } from "../../../common/utils/functional/functional";
import { pluralIfNeeded } from "../../../common/utils/general/general";
import { timeout } from "../../../common/utils/promise/promise";
import { TimeMonitor } from "../../../common/utils/time-monitor/time-monitor";
import { ClusterManager } from "../cluster-manager/cluster-manager";
import { FileManager } from "../file-manager/file-manager";
import { SettingsStore } from "../settings-store/settings-store";

export interface SettingsManagerOptions {
  logger: Logger;
  verbose?: boolean;
  initialLoadTimeout?: number;
  anchorPath: string;
}

export interface GetSettingsOptions {
  timeout?: number;
}

export type SettingsGetter = (opts?: GetSettingsOptions) => Promise<AppSettings>;

export class SettingsManager {
  public logger: Logger;
  public verbose: boolean;
  public anchorPath: string;
  public settingsStore: SettingsStore;
  public appSettings: AppSettings;
  public timeMonitor: TimeMonitor;
  public fileManagers: FileManager[];
  public clusterManagers: ClusterManager[];
  public currentWork: Promise<void>;
  public initialLoadTimeout: number;

  constructor(settingsStore: SettingsStore, options: SettingsManagerOptions) {
    const logger = options.logger;
    this.logger = logger;
    this.verbose = Boolean(options.verbose);
    this.anchorPath = options.anchorPath;

    this.timeMonitor = new TimeMonitor(logger);
    this.settingsStore = settingsStore;
    this.fileManagers = [];
    this.clusterManagers = [];

    this.initialLoadTimeout = options.initialLoadTimeout || 30000;
    this.appSettings = AppSettings.BLANK;

    this.currentWork = settingsStore.readSettings()
      .then(appSettings => this.reviseSettings(appSettings))
      .catch(e => {
        logger.error(`Fatal settings load error: ${e.message}`);
        logger.error(e.stack);
        throw e;
      });
  }

  private addClusterManager(cluster: Cluster, dataCubes: DataCube[]): Promise<void> {
    const { verbose, logger, anchorPath } = this;

    const initialExternals = dataCubes.map(dataCube => {
      return {
        name: dataCube.name,
        external: dataCube.toExternal(),
        suppressIntrospection: dataCube.getIntrospection() === "none"
      };
    });

    // Make a cluster manager for each cluster and assign the correct initial externals to it.
    logger.log(`Adding cluster manager for '${cluster.name}' with ${pluralIfNeeded(dataCubes.length, "dataCube")}`);
    const clusterManager = new ClusterManager(cluster, {
      logger,
      verbose,
      anchorPath,
      initialExternals,
      onExternalChange: (name, external) => this.onExternalChange(cluster, name, external),
      onExternalRemoved: (name, external) => this.onExternalRemoved(cluster, name, external),
      generateExternalName: this.generateDataCubeName
    });

    this.clusterManagers.push(clusterManager);
    return clusterManager.init();
  }

  private addFileManager(dataCube: DataCube): Promise<void> {
    if (dataCube.clusterName !== "native") throw new Error(`data cube '${dataCube.name}' must be native to have a file manager`);
    if (Array.isArray(dataCube.source)) throw new Error(`native data cube can't have multiple sources: ${dataCube.source.join(", ")}`);
    const { verbose, logger, anchorPath } = this;

    var fileManager = new FileManager({
      logger,
      verbose,
      anchorPath,
      uri: dataCube.source,
      subsetExpression: dataCube.subsetExpression,
      onDatasetChange: dataset => this.onDatasetChange(dataCube.name, dataset)
    });

    this.fileManagers.push(fileManager);
    return fileManager.init();
  }

  getTimekeeper(): Timekeeper {
    return this.timeMonitor.timekeeper;
  }

  getSettings(opts: GetSettingsOptions = {}): Promise<AppSettings> {
    let currentWork = this.currentWork;

    // Refresh all clusters
    currentWork = currentWork.then(() => {
      return Promise.all(this.clusterManagers.map(clusterManager => clusterManager.refresh())) as any;
    });

    const timeoutPeriod = opts.timeout || this.initialLoadTimeout;
    if (timeoutPeriod !== 0) {
      currentWork = Promise.race([currentWork, timeout(timeoutPeriod)])
        .catch(e => {
          this.logger.error("Settings load timeout hit, continuing");
        });
    }

    return currentWork.then(() => this.appSettings);
  }

  reviseSettings(newSettings: AppSettings): Promise<void> {
    const tasks = [
      this.reviseClusters(newSettings),
      this.reviseDataCubes(newSettings)
    ];
    this.appSettings = newSettings;

    return Promise.all(tasks).then(noop);
  }

  reviseClusters(settings: AppSettings): Promise<void> {
    const { clusters } = settings;
    const tasks: Array<Promise<void>> = clusters.map(cluster => this.addClusterManager(cluster, settings.getDataCubesForCluster(cluster.name)));
    return Promise.all(tasks).then(noop);
  }

  reviseDataCubes(settings: AppSettings): Promise<void> {
    const nativeDataCubes = settings.getDataCubesForCluster("native");
    const tasks: Array<Promise<void>> = nativeDataCubes.map(dc => this.addFileManager(dc));
    return Promise.all(tasks).then(noop);
  }

  generateDataCubeName = (external: External): string => {
    const { appSettings } = this;
    const source = String(external.source);

    let candidateName = source;
    let i = 0;
    while (appSettings.getDataCube(candidateName)) {
      i++;
      candidateName = source + i;
    }
    return candidateName;
  }

  onDatasetChange = (dataCubeName: string, changedDataset: Dataset): void => {
    const { logger } = this;

    logger.log(`Got native dataset update for ${dataCubeName}`);

    let dataCube = this.appSettings.getDataCube(dataCubeName);
    if (!dataCube) throw new Error(`Unknown dataset ${dataCubeName}`);
    dataCube = dataCube.updateWithDataset(changedDataset);

    if (dataCube.refreshRule.isQuery()) {
      this.timeMonitor.addCheck(dataCube.name, () => {
        return DataCube.queryMaxTime(dataCube);
      });
    }

    this.appSettings = this.appSettings.addOrUpdateDataCube(dataCube);
  }

  onExternalChange = (cluster: Cluster, dataCubeName: string, changedExternal: External): Promise<void>  => {
    if (!changedExternal.attributes || !changedExternal.requester) return Promise.resolve(null);
    const { logger } = this;

    logger.log(`Got queryable external dataset update for ${dataCubeName} in cluster ${cluster.name}`);

    let dataCube = this.appSettings.getDataCube(dataCubeName);
    if (!dataCube) {
      dataCube = DataCube.fromClusterAndExternal(dataCubeName, cluster, changedExternal);
    }
    dataCube = dataCube.updateWithExternal(changedExternal);

    if (dataCube.refreshRule.isQuery()) {
      this.timeMonitor.addCheck(dataCube.name, () => {
        return DataCube.queryMaxTime(dataCube);
      });
    }

    this.appSettings = this.appSettings.addOrUpdateDataCube(dataCube);
    return Promise.resolve(null);
  }

  onExternalRemoved = (cluster: Cluster, dataCubeName: string, changedExternal: External): Promise<void>  => {
    if (!changedExternal.attributes || !changedExternal.requester) return Promise.resolve(null);
    const { logger } = this;

    logger.log(`Got external dataset removal for ${dataCubeName} in cluster ${cluster.name}`);

    let dataCube = this.appSettings.getDataCube(dataCubeName);
    if (dataCube) {
      this.appSettings = this.appSettings.deleteDataCube(dataCube);
      this.timeMonitor.removeCheck(dataCube.name);
    }
    return Promise.resolve(null);
  }
}
