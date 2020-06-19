import { Record } from "immutable";
import { Unary } from "../../utils/functional/functional";
import { Measure } from "../measure/measure";
export declare enum SeriesFormatType {
    DEFAULT = "default",
    EXACT = "exact",
    PERCENT = "percent",
    CUSTOM = "custom"
}
declare type FormatString = string;
interface SeriesFormatValue {
    type: SeriesFormatType;
    value: FormatString;
}
declare const SeriesFormat_base: Record.Factory<SeriesFormatValue>;
export declare class SeriesFormat extends SeriesFormat_base {
    static fromJS(params: any): SeriesFormat;
}
export declare const DEFAULT_FORMAT: SeriesFormat;
export declare const EXACT_FORMAT: SeriesFormat;
export declare const PERCENT_FORMAT: SeriesFormat;
export declare const customFormat: (value: string) => SeriesFormat;
export declare function formatFnFactory(format: string): (n: number) => string;
export declare const exactFormat = "0,0";
export declare const percentFormat = "0[.]00%";
export declare const measureDefaultFormat = "0,0.0 a";
export declare const defaultFormatter: (n: number) => string;
export declare function seriesFormatter(format: SeriesFormat, measure: Measure): Unary<number, string>;
export {};
