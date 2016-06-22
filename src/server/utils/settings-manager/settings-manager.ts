import * as Q from 'q';
import { External, Dataset, basicExecutorFactory } from 'plywood';
import { inlineVars, pluralIfNeeded } from '../../../common/utils/general/general';
import { AppSettings, Cluster, DataSource } from '../../../common/models/index';
import { Logger } from '../logger/logger';
import { loadFileSync } from '../file/file';
import { FileManager } from '../file-manager/file-manager';
import { ClusterManager } from '../cluster-manager/cluster-manager';
import { updater } from '../updater/updater';

export interface SettingsLocation {
  location: 'local' | 'transient';
  readOnly: boolean;
  uri?: string;
  initAppSettings?: AppSettings;
}

export interface SettingsManagerOptions {
  logger: Logger;
  verbose?: boolean;
  initialLoadTimeout?: number;
  anchorPath: string;
}

export interface GetSettingsOptions {
  dataSourceOfInterest?: string;
  timeout?: number;
}

export class SettingsManager {
  public logger: Logger;
  public verbose: boolean;
  public anchorPath: string;
  public settingsLocation: SettingsLocation;
  public appSettings: AppSettings;
  public fileManagers: FileManager[];
  public clusterManagers: ClusterManager[];
  public currentWork: Q.Promise<any>;
  public initialLoadTimeout: number;

  constructor(settingsLocation: SettingsLocation, options: SettingsManagerOptions) {
    var logger = options.logger;
    this.logger = logger;
    this.verbose = Boolean(options.verbose);
    this.anchorPath = options.anchorPath;

    this.settingsLocation = settingsLocation;
    this.fileManagers = [];
    this.clusterManagers = [];

    this.initialLoadTimeout = options.initialLoadTimeout || 30000;
    this.appSettings = AppSettings.BLANK;

    switch (settingsLocation.location) {
      case 'transient':
        this.currentWork = settingsLocation.initAppSettings ? this.reviseSettings(settingsLocation.initAppSettings) : Q(null);
        break;

      case 'local':
        this.currentWork = Q.fcall(() => {
          var appSettingsJS = loadFileSync(settingsLocation.uri, 'yaml');
          appSettingsJS = inlineVars(appSettingsJS, process.env);
          return AppSettings.fromJS(appSettingsJS);
        })
          .then((appSettings) => {
            return this.reviseSettings(appSettings);
          })
          .catch(e => {
            logger.error(`Fatal settings load error: ${e.message}`);
            throw e;
          });

        break;

      default:
        throw new Error(`unknown location ${settingsLocation.location}`);
    }

    this.makeMaxTimeCheckTimer();
  }

  private addClusterManager(cluster: Cluster, dataSources: DataSource[]): Q.Promise<any> {
    const { verbose, logger, anchorPath } = this;

    var initialExternals = dataSources.map(dataSource => {
      return {
        name: dataSource.name,
        external: dataSource.toExternal(),
        suppressIntrospection: dataSource.introspection === 'none'
      };
    });

    // Make a cluster manager for each cluster and assign the correct initial externals to it.
    logger.log(`Adding cluster manager for '${cluster.name}' with ${pluralIfNeeded(dataSources.length, 'dataSource')}`);
    var clusterManager = new ClusterManager(cluster, {
      logger,
      verbose,
      anchorPath,
      initialExternals,
      onExternalChange: this.onExternalChange.bind(this, cluster),
      generateExternalName: this.generateDataSourceName.bind(this)
    });

    this.clusterManagers.push(clusterManager);
    return clusterManager.init();
  }

  private removeClusterManager(cluster: Cluster): void {
    this.clusterManagers = this.clusterManagers.filter((clusterManager) => {
      if (clusterManager.cluster.name !== cluster.name) return true;
      clusterManager.destroy();
      return false;
    });
  }

  private addFileManager(dataSource: DataSource): Q.Promise<any> {
    if (dataSource.engine !== 'native') throw new Error(`data source '${dataSource.name}' must be native to have a file manager`);
    const { verbose, logger, anchorPath } = this;

    var fileManager = new FileManager({
      logger,
      verbose,
      anchorPath,
      uri: dataSource.source,
      onDatasetChange: this.onDatasetChange.bind(this, dataSource.name)
    });

    this.fileManagers.push(fileManager);
    return fileManager.init();
  }

  private removeFileManager(dataSource: DataSource): void {
    if (dataSource.engine !== 'native') throw new Error(`data source '${dataSource.name}' must be native to have a file manager`);

    this.fileManagers = this.fileManagers.filter((fileManager) => {
      if (fileManager.uri !== dataSource.source) return true;
      fileManager.destroy();
      return false;
    });
  }

  getSettings(opts: GetSettingsOptions = {}): Q.Promise<AppSettings> {
    var currentWork = this.currentWork;

    var timeout = opts.timeout || this.initialLoadTimeout;
    if (timeout !== 0) {
      currentWork = currentWork.timeout(timeout)
        .catch(e => {
          this.logger.error(`Initial load timeout hit, continuing`);
        });
    }

    return currentWork
      .then(() => {
        // ToDo: utilize dataSourceOfInterest
        return Q.all(this.clusterManagers.map(clusterManager => clusterManager.refresh()));
      })
      .then(() => this.appSettings);
  }

  reviseSettings(newSettings: AppSettings): Q.Promise<any> {
    var tasks = [
      this.reviseClusters(newSettings),
      this.reviseDataSources(newSettings)
    ];
    this.appSettings = newSettings;

    return Q.all(tasks);
  }

  reviseClusters(newSettings: AppSettings): Q.Promise<any> {
    const { verbose, logger } = this;
    var oldSettings = this.appSettings;
    var tasks: Q.Promise<any>[] = [];

    updater(oldSettings.clusters, newSettings.clusters, {
      onExit: (oldCluster) => {
        this.removeClusterManager(oldCluster);
      },
      onUpdate: (newCluster) => {
        logger.log(`${newCluster.name} UPDATED cluster`);
      },
      onEnter: (newCluster) => {
        tasks.push(this.addClusterManager(newCluster, newSettings.getDataSourcesForCluster(newCluster.name)));
      }
    });

    return Q.all(tasks);
  }

  reviseDataSources(newSettings: AppSettings): Q.Promise<any> {
    const { verbose, logger } = this;
    var oldSettings = this.appSettings;
    var tasks: Q.Promise<any>[] = [];

    var oldNativeDataSources = oldSettings.getDataSourcesForCluster('native');
    var newNativeDataSources = newSettings.getDataSourcesForCluster('native');
    updater(oldNativeDataSources, newNativeDataSources, {
      onExit: (oldDataSource) => {
        if (oldDataSource.engine === 'native') {
          this.removeFileManager(oldDataSource);
        } else {
          throw new Error(`only native datasources work for now`); // ToDo: fix
        }
      },
      onUpdate: (newDataSource) => {
        logger.log(`${newDataSource.name} UPDATED datasource`);
      },
      onEnter: (newDataSource) => {
        if (newDataSource.engine === 'native') {
          tasks.push(this.addFileManager(newDataSource));
        } else {
          throw new Error(`only native datasources work for now`); // ToDo: fix
        }
      }
    });

    return Q.all(tasks);
  }

  updateSettings(newSettings: AppSettings): Q.Promise<any> {
    if (this.settingsLocation.readOnly) return Q.reject(new Error('must be writable'));

    var clusterManagers = this.clusterManagers;
    this.appSettings = newSettings.attachExecutors((dataSource) => {
      if (dataSource.engine === 'native') {
        return null; // ToDo: fix this.
      } else {
        for (var clusterManager of clusterManagers) {
          if (clusterManager.cluster.name === dataSource.engine) {
            var external = clusterManager.getExternalByName(dataSource.name);
            if (!external) return null;
            return basicExecutorFactory({
              datasets: { main: external }
            });
          }
        }
      }
      return null;
    });

    return Q(null); // ToDo: actually save settings
  }

  generateDataSourceName(external: External): string {
    const { appSettings } = this;
    var source = String(external.source);

    var candidateName = source;
    var i = 0;
    while (appSettings.getDataSource(candidateName)) {
      i++;
      candidateName = source + i;
    }
    return candidateName;
  }

  onDatasetChange(dataSourceName: string, changedDataset: Dataset): void {
    const { logger, verbose } = this;

    if (verbose) logger.log(`Got native dataset update for ${dataSourceName}`);

    var dataSource = this.appSettings.getDataSource(dataSourceName);
    if (!dataSource) throw new Error(`Unknown dataset ${dataSourceName}`);
    this.appSettings = this.appSettings.addOrUpdateDataSource(dataSource.updateWithDataset(changedDataset));
  }

  onExternalChange(cluster: Cluster, dataSourceName: string, changedExternal: External): void {
    if (!changedExternal.attributes) return;
    const { logger, verbose } = this;

    if (verbose) logger.log(`Got external dataset update for ${dataSourceName} in cluster ${cluster.name}`);

    var dataSource = this.appSettings.getDataSource(dataSourceName);
    if (!dataSource) {
       dataSource = DataSource.fromClusterAndExternal(dataSourceName, cluster, changedExternal);
    }
    this.appSettings = this.appSettings.addOrUpdateDataSource(dataSource.updateWithExternal(changedExternal));
  }

  makeMaxTimeCheckTimer() {
    const { logger } = this;

    // Periodically check if max time needs to be updated
    setInterval(() => {
      this.appSettings.dataSources.forEach((dataSource) => {
        if (dataSource.refreshRule.isQuery() && dataSource.shouldUpdateMaxTime()) {
          DataSource.updateMaxTime(dataSource)
            .then(
              (updatedDataSource) => {
                logger.log(`Getting the latest MaxTime for '${updatedDataSource.name}'`);
                this.appSettings = this.appSettings.addOrUpdateDataSource(updatedDataSource);
              },
              (e) => {
                logger.error(`Error getting MaxTime for ${dataSource.name}: ${e.message}`);
              }
            );
        }
      });
    }, 1000).unref();
  }

}
