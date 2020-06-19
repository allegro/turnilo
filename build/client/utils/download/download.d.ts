import { Dataset, TabulatorOptions } from "plywood";
import { Filter } from "../../../common/models/filter/filter";
import { DataSetWithTabOptions } from "../../views/cube-view/cube-view";
export declare type FileFormat = "csv" | "tsv" | "json";
export declare function getMIMEType(fileType: string): "text/csv" | "text/tsv" | "application/json";
export declare function download({ dataset, options }: DataSetWithTabOptions, fileFormat: FileFormat, fileName?: string): void;
export declare function datasetToFileString(dataset: Dataset, fileFormat: FileFormat, options?: TabulatorOptions): string;
export declare function dateFromFilter(filter: Filter): string;
export declare function makeFileName(...nameComponents: string[]): string;
