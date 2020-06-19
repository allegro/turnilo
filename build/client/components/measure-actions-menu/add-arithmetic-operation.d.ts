import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { Series } from "../../../common/models/series/series";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
interface AddPercentSeriesButtonProps {
    addExpressionPlaceholder: Unary<Series, void>;
    measure: Measure;
    onClose: Fn;
}
export declare const AddArithmeticOperationButton: React.SFC<AddPercentSeriesButtonProps>;
export {};
