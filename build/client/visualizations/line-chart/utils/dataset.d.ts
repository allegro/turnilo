import { Dataset, Datum } from "plywood";
export declare const selectMainDatum: (dataset: Dataset) => Datum;
export declare const selectSplitDataset: (datum: Datum) => Dataset;
export declare const selectSplitDatums: (datum: Datum) => Datum[];
export declare const selectFirstSplitDataset: (dataset: Dataset) => Dataset;
export declare const selectFirstSplitDatums: (dataset: Dataset) => Datum[];
