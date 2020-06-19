import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesFormat } from "../../../common/models/series/series-format";
import { Unary } from "../../../common/utils/functional/functional";
interface FormatPickerProps {
    measure: Measure;
    format: SeriesFormat;
    formatChange: Unary<SeriesFormat, void>;
}
export declare const FormatPicker: React.SFC<FormatPickerProps>;
export {};
