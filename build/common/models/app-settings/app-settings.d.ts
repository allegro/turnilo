import { Instance } from "immutable-class";
import { Executor } from "plywood";
import { Cluster, ClusterJS } from "../cluster/cluster";
import { Customization, CustomizationJS } from "../customization/customization";
import { DataCube, DataCubeJS } from "../data-cube/data-cube";
export interface AppSettingsValue {
    version?: number;
    clusters?: Cluster[];
    customization?: Customization;
    dataCubes?: DataCube[];
}
export interface AppSettingsJS {
    version?: number;
    clusters?: ClusterJS[];
    customization?: CustomizationJS;
    dataCubes?: DataCubeJS[];
}
export interface AppSettingsContext {
    executorFactory?: (dataCube: DataCube) => Executor;
}
export declare class AppSettings implements Instance<AppSettingsValue, AppSettingsJS> {
    static BLANK: AppSettings;
    static isAppSettings(candidate: any): candidate is AppSettings;
    static fromJS(parameters: AppSettingsJS, context?: AppSettingsContext): AppSettings;
    version: number;
    clusters: Cluster[];
    customization: Customization;
    dataCubes: DataCube[];
    constructor(parameters: AppSettingsValue);
    valueOf(): AppSettingsValue;
    toJS(): AppSettingsJS;
    toJSON(): AppSettingsJS;
    toString(): string;
    equals(other: AppSettings): boolean;
    toClientSettings(): AppSettings;
    getVersion(): number;
    getDataCubesForCluster(clusterName: string): DataCube[];
    getDataCube(dataCubeName: string): DataCube;
    addOrUpdateDataCube(dataCube: DataCube): AppSettings;
    deleteDataCube(dataCube: DataCube): AppSettings;
    attachExecutors(executorFactory: (dataCube: DataCube) => Executor): AppSettings;
    getSuggestedCubes(): DataCube[];
    validate(): boolean;
    changeCustomization(customization: Customization): AppSettings;
    changeClusters(clusters: Cluster[]): AppSettings;
    addCluster(cluster: Cluster): AppSettings;
    change(propertyName: string, newValue: any): AppSettings;
    changeDataCubes(dataCubes: DataCube[]): AppSettings;
    addDataCube(dataCube: DataCube): AppSettings;
    filterDataCubes(fn: (dataCube: DataCube, index?: number, dataCubes?: DataCube[]) => boolean): AppSettings;
}
