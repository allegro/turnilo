import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { SortOn } from "../../../common/models/sort-on/sort-on";
import "./pinboard-measure-tile.scss";
export interface PinboardMeasureTileProps {
    essence: Essence;
    title: string;
    dimension?: Dimension;
    sortOn?: SortOn;
    onSelect: (sel: SortOn) => void;
}
export declare const PinboardMeasureTile: React.SFC<PinboardMeasureTileProps>;
