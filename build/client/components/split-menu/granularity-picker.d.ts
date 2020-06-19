import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Unary } from "../../../common/utils/functional/functional";
export interface GranularityPickerProps {
    dimension: Dimension;
    granularity: string;
    granularityChange: Unary<string, void>;
}
export declare const GranularityPicker: React.SFC<GranularityPickerProps>;
