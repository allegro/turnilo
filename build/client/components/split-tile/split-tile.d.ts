import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Binary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
interface SplitTileProps {
    essence: Essence;
    split: Split;
    dimension: Dimension;
    open: boolean;
    style?: React.CSSProperties;
    removeSplit: Unary<Split, void>;
    updateSplit: Binary<Split, Split, void>;
    openMenu: Unary<Split, void>;
    closeMenu: Fn;
    dragStart: Ternary<string, Split, React.DragEvent<HTMLElement>, void>;
    containerStage: Stage;
}
export declare const SplitTile: React.SFC<SplitTileProps>;
export {};
