import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
export interface CubeContextValue {
    essence: Essence;
    clicker: Clicker;
}
export declare const CubeContext: React.Context<CubeContextValue>;
