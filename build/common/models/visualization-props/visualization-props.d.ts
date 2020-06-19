import { Dataset } from "plywood";
import { Clicker } from "../clicker/clicker";
import { Essence } from "../essence/essence";
import { Stage } from "../stage/stage";
import { Timekeeper } from "../timekeeper/timekeeper";
export interface VisualizationProps {
    clicker: Clicker;
    essence: Essence;
    timekeeper: Timekeeper;
    stage: Stage;
    registerDownloadableDataset?: (dataset: Dataset) => void;
    refreshRequestTimestamp: number;
}
declare enum DatasetLoadStatus {
    LOADED = 0,
    LOADING = 1,
    ERROR = 2
}
interface DatasetLoadBase {
    status: DatasetLoadStatus;
}
interface DatasetLoading extends DatasetLoadBase {
    status: DatasetLoadStatus.LOADING;
}
interface DatasetLoaded extends DatasetLoadBase {
    status: DatasetLoadStatus.LOADED;
    dataset: Dataset;
}
interface DatasetLoadError extends DatasetLoadBase {
    status: DatasetLoadStatus.ERROR;
    error: Error;
}
export declare const loading: DatasetLoading;
export declare const error: (error: Error) => DatasetLoadError;
export declare const loaded: (dataset: Dataset) => DatasetLoaded;
export declare const isLoading: (dl: DatasetLoad) => dl is DatasetLoading;
export declare const isLoaded: (dl: DatasetLoad) => dl is DatasetLoaded;
export declare const isError: (dl: DatasetLoad) => dl is DatasetLoadError;
export declare type DatasetLoad = DatasetLoading | DatasetLoaded | DatasetLoadError;
export {};
