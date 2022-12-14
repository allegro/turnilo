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
import { getLogger, Logger } from "../../../common/logger/logger";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { Cluster, DEFAULT_SOURCE_TIME_BOUNDARY_REFRESH_INTERVAL } from "../../../common/models/cluster/cluster";
import { DataCube, fromClusterAndExternal } from "../../../common/models/data-cube/data-cube";
import { attachDatasetExecutor, attachExternalExecutor } from "../../../common/models/data-cube/queryable-data-cube";
import {
  addOrUpdateDataCube,
  deleteDataCube,
  getDataCube,
  getDataCubesForCluster,
  Sources
} from "../../../common/models/sources/sources";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import dataCubeToExternal from "../../../common/utils/external/datacube-to-external";
import { noop, Unary } from "../../../common/utils/functional/functional";
import { pluralIfNeeded } from "../../../common/utils/general/general";
import { timeout } from "../../../common/utils/promise/promise";
import { TimeMonitor } from "../../../common/utils/time-monitor/time-monitor";
import { LoggerFormat } from "../../models/server-settings/server-settings";
import { ClusterManager } from "../cluster-manager/cluster-manager";
import { FileManager } from "../file-manager/file-manager";

export interface SettingsManagerOptions {
  logger: LoggerFormat;
  verbose?: boolean;
  initialLoadTimeout?: number;
  anchorPath: string;
}

export interface GetSourcesOptions {
  timeout?: number;
}

export type SourcesGetter = (opts?: GetSourcesOptions) => Promise<Sources>;

export class SettingsManager {
  public logger: Logger;
  public verbose: boolean;
  public anchorPath: string;
  public appSettings: AppSettings;
  public sources: Sources;
  public timeMonitor: TimeMonitor;
  public fileManagers: FileManager[];
  public clusterManagers: ClusterManager[];
  public settingsLoaded: Promise<void>;
  public initialLoadTimeout: number;

  constructor(appSettings: AppSettings,
              sources: Sources,
              options: SettingsManagerOptions) {
    const logger = getLogger(options.logger);
    this.logger = logger;
    this.verbose = Boolean(options.verbose);
    this.anchorPath = options.anchorPath;

    this.timeMonitor = new TimeMonitor(logger);
    this.appSettings = appSettings;
    this.fileManagers = [];
    this.clusterManagers = [];

    this.initialLoadTimeout = options.initialLoadTimeout || 30000;
    this.sources = sources;

    this.settingsLoaded = this.reviseSources()
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
        external: dataCubeToExternal(dataCube),
        suppressIntrospection: dataCube.introspection === "none"
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

    const fileManager = new FileManager({
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

  handleSourcesTask(task: Promise<void>, opts: GetSourcesOptions = {}): Promise<Sources> {
    const timeoutMs = opts.timeout || this.initialLoadTimeout;
    if (timeoutMs === 0) {
      return task.then(() => this.sources);
    }
    return Promise.race([task, timeout(timeoutMs)])
      .catch(() => {
        this.logger.warn(`Settings load timeout (${timeoutMs}ms) hit, continuing`);
      })
      .then(() => this.sources);
  }

  getFreshSources(opts: GetSourcesOptions = {}): Promise<Sources> {
    const task = this.settingsLoaded.then(() => {
      return Promise.all(this.clusterManagers.map(clusterManager => clusterManager.refresh())) as any;
    });
    return this.handleSourcesTask(task, opts);
  }

  getSources(opts: GetSourcesOptions = {}): Promise<Sources> {
    return this.handleSourcesTask(this.settingsLoaded, opts);
  }

  sourcesGetter: Unary<GetSourcesOptions, Promise<Sources>> = opts => this.getSources(opts);

  reviseSources(): Promise<void> {
    const { sources } = this;
    const tasks = [
      this.reviseClusters(sources),
      this.reviseDataCubes(sources)
    ];

    return Promise.all(tasks).then(noop);
  }

  reviseClusters(sources: Sources): Promise<void> {
    const { clusters } = sources;
    const tasks: Array<Promise<void>> = clusters.map(cluster => this.addClusterManager(cluster, getDataCubesForCluster(sources, cluster.name)));
    return Promise.all(tasks).then(noop);
  }

  reviseDataCubes(sources: Sources): Promise<void> {
    const nativeDataCubes = getDataCubesForCluster(sources, "native");
    const tasks: Array<Promise<void>> = nativeDataCubes.map(dc => this.addFileManager(dc));
    return Promise.all(tasks).then(noop);
  }

  generateDataCubeName = (external: External): string => {
    const { sources } = this;
    const source = String(external.source);

    let candidateName = source;
    let i = 0;
    while (getDataCube(sources, candidateName)) {
      i++;
      candidateName = source + i;
    }
    return candidateName;
  };

  onDatasetChange = (dataCubeName: string, changedDataset: Dataset): void => {
    const { logger, sources } = this;

    logger.log(`Got native dataset update for ${dataCubeName}`);

    const dataCube = getDataCube(sources, dataCubeName);
    if (!dataCube) throw new Error(`Unknown dataset ${dataCubeName}`);
    const queryableDataCube = attachDatasetExecutor(dataCube, changedDataset);

    if (queryableDataCube.refreshRule.isQuery()) {
      // TODO: Maybe we have better default for native clusters?
      this.timeMonitor.addCheck(queryableDataCube, DEFAULT_SOURCE_TIME_BOUNDARY_REFRESH_INTERVAL);
    }

    this.sources = addOrUpdateDataCube(sources, queryableDataCube);
  };

  onExternalChange = (cluster: Cluster, dataCubeName: string, changedExternal: External): Promise<void> => {
    if (!changedExternal.attributes || !changedExternal.requester) return Promise.resolve(null);
    const { sources, logger } = this;

    logger.log(`Got queryable external dataset update for ${dataCubeName} in cluster ${cluster.name}`);

    let dataCube = getDataCube(sources, dataCubeName);
    if (!dataCube) {
      dataCube = fromClusterAndExternal(dataCubeName, cluster, changedExternal, this.logger);
    }
    const queryableDataCube = attachExternalExecutor(dataCube, changedExternal);

    if (queryableDataCube.refreshRule.isQuery()) {
      this.timeMonitor.addCheck(queryableDataCube, cluster.sourceTimeBoundaryRefreshInterval);
    }

    this.sources = addOrUpdateDataCube(sources, queryableDataCube);
    return Promise.resolve(null);
  };

  onExternalRemoved = (cluster: Cluster, dataCubeName: string, changedExternal: External): Promise<void> => {
    if (!changedExternal.attributes || !changedExternal.requester) return Promise.resolve(null);
    const { sources, logger } = this;

    logger.log(`Got external dataset removal for ${dataCubeName} in cluster ${cluster.name}`);

    const dataCube = getDataCube(sources, dataCubeName);
    if (dataCube) {
      this.sources = deleteDataCube(sources, dataCube);
      this.timeMonitor.removeCheck(dataCube);
    }
    return Promise.resolve(null);
  };
}
