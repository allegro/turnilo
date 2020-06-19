import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
export interface LimitDropdownProps {
    limit: number;
    includeNone: boolean;
    onLimitSelect: Unary<number, void>;
}
export declare const LimitDropdown: React.SFC<LimitDropdownProps>;
