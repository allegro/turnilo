import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
interface PinboardTilesProps {
    hidePlaceholder: boolean;
    essence: Essence;
    clicker: Clicker;
    timekeeper: Timekeeper;
}
export declare const PinboardTiles: React.SFC<PinboardTilesProps>;
export {};
