import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
interface TileOverflowContainerProps {
    className: string;
    x: number;
    items: JSX.Element[];
    open: boolean;
    openOverflowMenu: Fn;
    closeOverflowMenu: Fn;
}
export declare const TileOverflowContainer: React.SFC<TileOverflowContainerProps>;
export {};
