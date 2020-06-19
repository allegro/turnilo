import { DataCube, DataCubeJS } from "./data-cube";
export declare class DataCubeFixtures {
    static readonly WIKI_JS: DataCubeJS;
    static readonly TWITTER_JS: DataCubeJS;
    static wiki(): DataCube;
    static twitter(): DataCube;
    static customCube(title: string, description: string, extendedDescription?: string): DataCube;
    static customCubeWithGuard(): DataCube;
}
