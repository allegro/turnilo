import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Binary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
interface SplitTilesProps {
    essence: Essence;
    openedSplit: Split;
    removeSplit: Unary<Split, void>;
    updateSplit: Binary<Split, Split, void>;
    openMenu: Unary<Split, void>;
    closeMenu: Fn;
    dragStart: Ternary<string, Split, React.DragEvent<HTMLElement>, void>;
    menuStage: Stage;
    maxItems: number;
    overflowOpen: boolean;
    closeOverflowMenu: Fn;
    openOverflowMenu: Fn;
}
export declare const SplitTiles: React.SFC<SplitTilesProps>;
export {};
